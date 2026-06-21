import { useStream } from "@myapp/ai/react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Dots, KARYA_STAGE_ORDER, Loading } from "@/components/ui-atoms";
import { type KaryaDraft, useKaryaDraft } from "@/lib/karya-draft-ctx";
import { callClaude, cleanJSON } from "@/lib/members";

const INTRO =
  "oke, ceritain karya yang mau kamu bikin. mulai dari yang paling simpel: namanya apa, atau lagi ngerjain apa?";

const SYS_KARYA = `Kamu adalah AI yang bantu anggota Al-Fath Berkarya nyusun draft karya baru. Karya itu apa pun yang lagi atau mau mereka bikin — produk, tool, riset, acara, tulisan, gerakan komunitas. Bisa dibikin di tahap apa pun, bahkan baru ide.

Lakukan obrolan singkat dan santai buat ngumpulin:
- judul karya (singkat),
- deskripsi: apa itu & lagi ngerjain bagian apa (buat "description"),
- tahap: di mana posisinya sekarang — ide, validasi, lagi dibikin, udah rilis, atau lagi jeda,
- minat/tag yang relevan (topik atau bidang).

Aturan:
- SATU pertanyaan per pesan. Jangan tumpuk pertanyaan.
- Santai, langsung, akrab. Maksimal 1-2 kalimat. Pakai "kamu/aku", bukan "Anda/saya". Semua lowercase kecuali nama orang/tempat.
- Kalau jawabannya terlalu umum, tanya satu follow-up yang spesifik.
- Setelah 4-6 pertukaran yang sudah mencakup semua area, akhiri pesanmu dengan tepat: "oke, biar aku susun draft karyanya sekarang."
- JANGAN bilang "oke, biar aku susun draft karyanya sekarang" sebelum semua area tercakup.`;

interface ChatMessage {
  id: number;
  role: "ai" | "user";
  text: string;
}

interface ApiMessage {
  role: "user" | "assistant";
  content: string;
}

interface ExtractedDraft {
  title?: string;
  description?: string;
  stages?: string[];
  interests?: string[];
}

export default function KaryaAgent() {
  const { setDraft } = useKaryaDraft();
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
    t.toLowerCase().includes("susun draft karyanya sekarang");

  async function genDraft(hist: ApiMessage[]) {
    setGenning(true);
    const transcript = hist
      .map((m) => `${m.role === "user" ? "member" : "ai"}: ${m.content}`)
      .join("\n");
    const prompt = `Dari obrolan ini, ekstrak draft karya sebagai JSON dengan field persis ini:
{"title":"","description":"","stages":[],"interests":[]}
- title: judul singkat karyanya.
- description: 1-2 kalimat bahasa Indonesia kasual — apa karyanya & lagi ngerjain bagian apa.
- stages: array dari nilai berikut saja: "idea","validating","building","shipped","paused". Pilih yang paling sesuai (boleh lebih dari satu). Kalau ga jelas, isi ["idea"].
- interests: array of string — topik/bidang yang relevan.
- Jujur, jangan ngarang. Kalau suatu info ga disebut, isi string kosong "" atau array kosong [].

Obrolan:\n${transcript}`;
    try {
      const raw = await callClaude([{ role: "user", content: prompt }]);
      const parsed = cleanJSON(raw) as ExtractedDraft;
      const stages = (parsed.stages ?? []).filter(
        (s): s is KaryaDraft["stages"][number] =>
          (KARYA_STAGE_ORDER as string[]).includes(s),
      );
      const draft: KaryaDraft = {
        title: parsed.title ?? "",
        description: parsed.description ?? "",
        stages: stages.length > 0 ? stages : ["idea"],
        interests: parsed.interests ?? [],
      };
      setDraft(draft);
      navigate("/karya/new");
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
        content: `${SYS_KARYA}\n\nBegin. Your first message is: "${INTRO}"`,
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
        setTimeout(() => genDraft(updatedHist), 600);
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

  if (genning) return <Loading label="lagi nyusun draft karya kamu" />;

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
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <p className="eyebrow">Al-Fath Berkarya · bikin karya</p>
        <button
          type="button"
          onClick={() => navigate("/karya/new")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--ink2)",
            fontSize: 13,
            padding: 0,
          }}
        >
          isi manual →
        </button>
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
