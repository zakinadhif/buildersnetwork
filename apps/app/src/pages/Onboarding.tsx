import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useStream } from "@myapp/ai/react";
import { Dots, Loading } from "@/components/ui-atoms";
import { type Member, callClaude, cleanJSON } from "@/lib/members";
import { useOnboarding } from "@/lib/onboarding-ctx";

const INTRO =
  "hei — selamat datang di al-fath berkarya. aku mau kenalan dulu — abis itu kita nyusun profil kamu bareng.\n\nsiapa nama kamu?";

const SYS_ONBOARD = `Kamu adalah AI onboarding untuk Al-Fath Berkarya — komunitas builder eksklusif mahasiswa teknik informatika di Telkom University, Indonesia.

Lakukan intake percakapan yang santai dan hangat untuk membangun profil anggota baru. Cakup: nama, tingkat/jurusan, skill teknis (probe lebih dalam — tanya apa yang pernah mereka bikin, bukan cuma yang mereka tahu), hal yang pernah dibangun, apa yang mau mereka bangun/pelajari, project sekarang, gaya kolaborasi.

Aturan:
- SATU pertanyaan per pesan. Jangan tumpuk pertanyaan.
- Santai, langsung, akrab. Maksimal 1-2 kalimat. Pakai "kamu/aku", bukan "Anda/saya". Semua lowercase kecuali nama orang/tempat.
- Kalau jawabannya terlalu umum, tanya satu follow-up yang spesifik.
- Setelah 8-10 pertukaran yang sudah mencakup semua area, akhiri pesanmu dengan tepat: "oke, biar aku susun profil kamu sekarang."
- JANGAN bilang "oke, biar aku susun profil kamu sekarang" sebelum semua area tercakup.`;

interface ChatMessage {
  role: "ai" | "user";
  text: string;
}

interface ApiMessage {
  role: "user" | "assistant";
  content: string;
}

export default function Onboarding() {
  const { setDraft } = useOnboarding();
  const [, navigate] = useLocation();
  const [msgs, setMsgs] = useState<ChatMessage[]>([{ role: "ai", text: INTRO }]);
  const [history, setHistory] = useState<ApiMessage[]>([]);
  const [input, setInput] = useState("");
  const [genning, setGenning] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const { streamingText, stream } = useStream();

  const busy = streamingText !== null;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, streamingText]);

  const isEndSignal = (t: string) =>
    t.toLowerCase().includes("susun profil kamu sekarang");

  async function genProfile(hist: ApiMessage[]) {
    setGenning(true);
    const transcript = hist
      .map((m) => `${m.role === "user" ? "member" : "ai"}: ${m.content}`)
      .join("\n");
    const prompt = `Dari percakapan onboarding ini, ekstrak profil anggota sebagai JSON dengan field persis ini:
{"name":"","year":"Tingkat X","major":"","skills":[],"building":"","wants":"","vibe":""}
- skills: array of string
- building/wants/vibe: 1-2 kalimat singkat dalam bahasa Indonesia kasual (pakai "lagi bikin", "pengen", dll)
- Jujur, jangan ngarang.

Percakapan:\n${transcript}`;
    try {
      const raw = await callClaude([{ role: "user", content: prompt }]);
      const parsed = cleanJSON(raw) as Member;
      const profile: Member = { ...parsed, id: "user", skills: parsed.skills ?? [] };
      setDraft(profile);
      navigate("/review");
    } catch (e) {
      console.error(e);
      setGenning(false);
    }
  }

  async function send() {
    const text = input.trim();
    if (!text || busy || genning) return;
    const newHist: ApiMessage[] = [...history, { role: "user", content: text }];
    setMsgs((p) => [...p, { role: "user", text }]);
    setHistory(newHist);
    setInput("");

    const apiMsgs: ApiMessage[] = [
      {
        role: "user",
        content: `${SYS_ONBOARD}\n\nBegin. Your first message is: "${INTRO}"`,
      },
      { role: "assistant", content: INTRO },
      ...newHist,
    ];

    try {
      const reply = await stream(apiMsgs);
      const updatedHist: ApiMessage[] = [
        ...newHist,
        { role: "assistant", content: reply },
      ];
      setMsgs((p) => [...p, { role: "ai", text: reply }]);
      setHistory(updatedHist);
      if (isEndSignal(reply)) {
        setTimeout(() => genProfile(updatedHist), 600);
      }
    } catch {
      setMsgs((p) => [...p, { role: "ai", text: "ada yang error — coba lagi?" }]);
    }
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  if (genning) return <Loading label="lagi nyusun profil kamu" />;

  return (
    <div className="screen" style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          padding: "18px 28px",
          borderBottom: "1px solid var(--line)",
          flexShrink: 0,
        }}
      >
        <p className="eyebrow">Al-Fath Berkarya · onboarding</p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "36px 28px 24px" }}>
        <div className="wrap" style={{ padding: 0 }}>
          <div className="chat">
            {msgs.map((m, i) => (
              <div key={i} className={`msg-${m.role}`}>
                {m.text}
              </div>
            ))}
            {streamingText !== null && (
              <div className="msg-ai">
                {streamingText || <Dots />}
              </div>
            )}
            <div ref={endRef} />
          </div>
        </div>
      </div>

      <div className="input-bar">
        <div className="input-inner">
          <textarea
            className="chat-textarea"
            rows={1}
            placeholder="balas…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
          />
          <button
            className="send-btn"
            onClick={send}
            disabled={!input.trim() || busy}
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}
