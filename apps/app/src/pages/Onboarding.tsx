import { useStream } from "@myapp/ai/react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Dots, Loading } from "@/components/ui-atoms";
import { callClaude, cleanJSON, type Member } from "@/lib/members";
import { useOnboarding } from "@/lib/onboarding-ctx";

const INTRO =
  "hei — selamat datang di al-fath berkarya. aku mau kenalan dulu — abis itu kita nyusun profil kamu bareng.\n\nsiapa nama kamu?";

const SYS_ONBOARD = `Kamu adalah AI onboarding untuk Al-Fath Berkarya — komunitas builder buat mahasiswa Telkom University dari semua jurusan dan fakultas. Siapa pun yang suka bikin sesuatu — ngoding, desain, nulis, riset, bikin produk, atau ngegerakin komunitas — punya tempat di sini.

Lakukan intake percakapan yang santai dan hangat untuk membangun profil anggota baru. Cakup:
- nama dan tingkat/jurusan,
- skill — probe lebih dalam, tanya apa yang pernah mereka bikin atau kerjain, bukan cuma yang mereka tahu (skill ga harus teknis — desain, nulis, riset, ngatur acara semua kehitung),
- cerita singkat soal diri mereka & apa yang lagi atau pengen mereka garap (buat "bio"),
- hal-hal yang mereka minati atau pengen dalami (buat "interests").

Aturan:
- SATU pertanyaan per pesan. Jangan tumpuk pertanyaan.
- Santai, langsung, akrab. Maksimal 1-2 kalimat. Pakai "kamu/aku", bukan "Anda/saya". Semua lowercase kecuali nama orang/tempat.
- Kalau jawabannya terlalu umum, tanya satu follow-up yang spesifik.
- Setelah 8-10 pertukaran yang sudah mencakup semua area, akhiri pesanmu dengan tepat: "oke, biar aku susun profil kamu sekarang."
- JANGAN bilang "oke, biar aku susun profil kamu sekarang" sebelum semua area tercakup.`;

interface ChatMessage {
  id: number;
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
  const msgId = useRef(0);
  const [msgs, setMsgs] = useState<ChatMessage[]>([
    { id: msgId.current, role: "ai", text: INTRO },
  ]);
  const [history, setHistory] = useState<ApiMessage[]>([]);
  const [input, setInput] = useState("");
  const [genning, setGenning] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const { streamingText, stream } = useStream();

  const busy = streamingText !== null;

  // biome-ignore lint/correctness/useExhaustiveDependencies: msgs/streamingText are intentional scroll triggers
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
{"name":"","handle":"","bio":"","year":"Tingkat X","major":"","skills":[],"interests":[]}
- handle: username pendek huruf kecil tanpa spasi (boleh diturunkan dari nama depan). Kalau ga jelas, kosongkan ("").
- bio: 1-2 kalimat singkat orang pertama dalam bahasa Indonesia kasual — siapa mereka & apa yang lagi atau pengen mereka garap.
- skills: array of string (ga harus teknis).
- interests: array of string — topik/bidang yang mereka minati atau pengen dalami.
- Jujur, jangan ngarang. Kalau suatu info ga disebut di percakapan, isi string kosong "" atau array kosong [] — jangan dikira-kira.

Percakapan:\n${transcript}`;
    try {
      const raw = await callClaude([{ role: "user", content: prompt }]);
      const parsed = cleanJSON(raw) as Member;
      const profile: Member = {
        ...parsed,
        id: "user",
        skills: parsed.skills ?? [],
        interests: parsed.interests ?? [],
      };
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
    setMsgs((p) => [...p, { id: ++msgId.current, role: "user", text }]);
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
      setMsgs((p) => [...p, { id: ++msgId.current, role: "ai", text: reply }]);
      setHistory(updatedHist);
      if (isEndSignal(reply)) {
        setTimeout(() => genProfile(updatedHist), 600);
      }
    } catch {
      setMsgs((p) => [
        ...p,
        {
          id: ++msgId.current,
          role: "ai",
          text: "ada yang error — coba lagi?",
        },
      ]);
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
    <div
      className="screen"
      style={{ display: "flex", flexDirection: "column" }}
    >
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
            {msgs.map((m) => (
              <div key={m.id} className={`msg-${m.role}`}>
                {m.text}
              </div>
            ))}
            {streamingText !== null && (
              <div className="msg-ai">{streamingText || <Dots />}</div>
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
            type="button"
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
