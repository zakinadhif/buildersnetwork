import { useStream } from "@myapp/ai/react";
import { useEffect, useRef, useState } from "react";
import { Dots, Loading } from "@/components/ui-atoms";
import { callClaude, cleanJSON, type Member } from "@/lib/members";

/**
 * The shared onboarding/assistant chat (issue #8). Lifted out of the Onboarding
 * page so both the standalone `/onboarding` flow and the in-shell `/assistant`
 * tab reuse the same intake — the `SYS_ONBOARD` register, `useStream`, the
 * end-signal detection, and the JSON profile extraction (AI-2: the output is an
 * editable draft, never written straight to the profile).
 *
 * The caller supplies the register/intro and receives the extracted draft via
 * `onProfile` — Onboarding routes it to `/review`; Assistant reviews it inline.
 */

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

export default function AssistantChat({
  intro,
  onProfile,
  genLabel = "lagi nyusun profil kamu",
}: {
  intro: string;
  onProfile: (draft: Member) => void;
  genLabel?: string;
}) {
  const msgId = useRef(0);
  const [msgs, setMsgs] = useState<ChatMessage[]>([
    { id: 0, role: "ai", text: intro },
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
      onProfile(profile);
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
        content: `${SYS_ONBOARD}\n\nBegin. Your first message is: "${intro}"`,
      },
      { role: "assistant", content: intro },
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

  if (genning) return <Loading label={genLabel} />;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-y-auto py-2 pb-6">
        <div className="flex flex-col gap-6">
          {msgs.map((m) => (
            <div
              key={m.id}
              className={
                m.role === "ai"
                  ? "text-feature text-ink leading-heading font-light max-w-[80%]"
                  : "text-body text-ink2 leading-body self-end max-w-[80%] text-right"
              }
            >
              {m.text}
            </div>
          ))}
          {streamingText !== null && (
            <div className="text-feature text-ink leading-heading font-light max-w-[80%]">
              {streamingText || <Dots />}
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      <div className="shrink-0 pt-3.5 bg-bg flex justify-center">
        <div className="w-full flex items-end gap-3 p-1.5 pl-3 border border-line rounded-panel transition-colors focus-within:border-accent-line">
          <textarea
            className="flex-1 bg-transparent border-none font-body text-body text-ink outline-none resize-none py-1.5 leading-body max-h-[100px] overflow-y-auto placeholder:text-ink3"
            rows={1}
            placeholder="balas…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
          />
          <button
            type="button"
            className="w-9 h-9 rounded-card bg-ink text-bg border-none flex items-center justify-center font-ui text-ui cursor-pointer shrink-0 transition-opacity hover:opacity-85 disabled:opacity-30 disabled:cursor-not-allowed"
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
