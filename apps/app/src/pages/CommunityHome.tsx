import { useListKarya, useListMembers } from "@myapp/api-client-react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Avatar, Dots, STAGE_LABELS } from "@/components/ui-atoms";
import { callClaude, firstName, type Member } from "@/lib/members";

export default function CommunityHome({ user }: { user: Member }) {
  const [, navigate] = useLocation();
  const { data: members = [] } = useListMembers();
  const { data: karya = [] } = useListKarya();

  const greeting = `hei ${firstName(user.name)} — lagi nyari siapa? tanya aja soal komunitas ini.`;
  const msgId = useRef(0);
  const [msgs, setMsgs] = useState<
    { id: number; role: "ai" | "user"; text: string }[]
  >([{ id: msgId.current, role: "ai", text: greeting }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: msgs/busy are intentional scroll triggers
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, busy]);

  async function query() {
    const text = input.trim();
    if (!text || busy) return;
    setMsgs((p) => [
      ...p,
      { id: ++msgId.current, role: "user" as const, text },
    ]);
    setInput("");
    setBusy(true);

    const dir = members
      .map(
        (m) =>
          `${m.name} (${m.year}, ${m.major})\nSkills: ${m.skills.join(", ")}\nMinat: ${m.interests.join(", ")}\nBio: ${m.bio ?? "-"}`,
      )
      .join("\n\n");

    const prompt = `Kamu adalah AI discovery untuk komunitas builder Al-Fath Berkarya.

Direktori anggota:
${dir}

Pertanyaan: "${text}"

Jawab dengan bahasa Indonesia kasual dan langsung. Sebutkan maksimal 3 anggota yang relevan beserta nama dan 1-2 kalimat kenapa mereka cocok. Kalau ga ada yang cocok, bilang aja terus terang. Singkat padat.`;

    try {
      const reply = await callClaude([{ role: "user", content: prompt }]);
      setBusy(false);
      setMsgs((p) => [
        ...p,
        { id: ++msgId.current, role: "ai" as const, text: reply },
      ]);
    } catch {
      setBusy(false);
      setMsgs((p) => [
        ...p,
        {
          id: ++msgId.current,
          role: "ai" as const,
          text: "ada yang error — coba lagi?",
        },
      ]);
    }
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      query();
    }
  };

  return (
    <div
      className="screen"
      style={{ display: "flex", flexDirection: "column" }}
    >
      <div className="nav">
        <div className="nav-inner">
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "var(--ink3)",
            }}
          >
            Al-Fath Berkarya
          </span>
          <span style={{ fontSize: 13, color: "var(--ink2)" }}>
            {user.name} · {user.year}
          </span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "36px 28px 24px" }}>
        <div className="wrap" style={{ padding: 0 }}>
          <div className="chat" style={{ marginBottom: 48 }}>
            {msgs.map((m) => (
              <div key={m.id} className={`msg-${m.role}`}>
                {m.text}
              </div>
            ))}
            {busy && (
              <div className="msg-ai">
                <Dots />
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              borderBottom: "1px solid var(--line)",
              paddingBottom: 10,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--ink3)",
              }}
            >
              Karya ({karya.length})
            </span>
            <button
              type="button"
              onClick={() => navigate("/karya/new")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--accent)",
                fontSize: 13,
                padding: 0,
              }}
            >
              + buat karya
            </button>
          </div>
          {karya.map((k) => (
            // biome-ignore lint/a11y/useSemanticElements: contains block children, can't use <button>
            <div
              key={k.id}
              className="karya-card"
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/karya/${k.id}`)}
              onKeyDown={(e) => e.key === "Enter" && navigate(`/karya/${k.id}`)}
            >
              <span className="karya-card-title">{k.title}</span>
              <p className="karya-card-desc">{k.description}</p>
              <div className="karya-card-foot">
                <div className="skills-wrap">
                  {k.stages.map((s) => (
                    <span key={s} className="stage-chip">
                      {STAGE_LABELS[s]}
                    </span>
                  ))}
                </div>
                <div className="roster">
                  {k.roster.map((m) => (
                    <Avatar
                      key={m.id}
                      name={m.name}
                      handle={m.handle}
                      image={m.image}
                      size={26}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}

          <p className="sec-head" style={{ marginTop: 40 }}>
            Anggota ({members.length})
          </p>
          {members.map((m) => (
            // biome-ignore lint/a11y/useSemanticElements: contains block children, can't use <button>
            <div
              key={m.id}
              className="member-row"
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/member/${m.id}`)}
              onKeyDown={(e) =>
                e.key === "Enter" && navigate(`/member/${m.id}`)
              }
            >
              <div className="member-top">
                <span className="member-name">{m.name}</span>
                <span className="member-year">{m.year}</span>
              </div>
              <p className="member-skills">
                {m.skills.slice(0, 3).join(" · ")}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="input-bar">
        <div className="input-inner">
          <textarea
            className="chat-textarea"
            rows={1}
            placeholder="siapa yang lagi kerja di ML? ada yang jago backend?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
          />
          <button
            type="button"
            className="send-btn"
            onClick={query}
            disabled={!input.trim() || busy}
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}
