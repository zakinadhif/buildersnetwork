/**
 * Al-Fath Berkarya — Masuk / Daftar (+ verifikasi email)  ·  issue #101
 *
 * The pre-shell entry surface. A calm editorial column — not a boxy card — on the
 * shared token scale, grounding the app's `Welcome.tsx` + `VerifyEmail.tsx`: the
 * Telkom-student email gate, password, and the OTP verify state. Real inputs here,
 * not the borrowed `.chat-textarea` the app reused for auth.
 *
 * "Daftar → kirim kode" flips to the verify view, so both states are reviewable by
 * interacting — no extra gallery chrome needed.
 */

import { useRef, useState } from "react";
import { T, eyebrow } from "@myapp/design-tokens";

type Mode = "daftar" | "masuk";

// ─── Field ──────────────────────────────────────────────────────────────────────
function Field({ label, type = "text", placeholder, value, onChange, note }: {
  label: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
  note?: string;
}) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ ...eyebrow, display: "block", marginBottom: 6 }}>{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        style={{
          width: "100%",
          boxSizing: "border-box" as const,
          background: T.surface,
          border: `1px solid ${T.line}`,
          borderRadius: T.radiusCard,
          padding: "11px 13px",
          fontFamily: T.fontBody,
          fontSize: T.size.body,
          color: T.ink,
          outline: "none",
        }}
      />
      {note && (
        <span style={{ display: "block", marginTop: 6, fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3 }}>
          {note}
        </span>
      )}
    </label>
  );
}

function PrimaryButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        background: T.ink,
        color: T.bg,
        border: "none",
        borderRadius: T.radiusCard,
        padding: "12px 18px",
        fontFamily: T.fontBody,
        fontSize: T.size.ui,
        fontWeight: T.weight.semibold,
        letterSpacing: T.track.heading,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

// ─── Form view (daftar / masuk) ──────────────────────────────────────────────────
function FormView({ mode, setMode, email, setEmail, onSubmit }: {
  mode: Mode;
  setMode: (m: Mode) => void;
  email: string;
  setEmail: (v: string) => void;
  onSubmit: () => void;
}) {
  const daftar = mode === "daftar";
  return (
    <>
      {/* Mode toggle */}
      <div style={{
        display: "flex",
        gap: 2,
        padding: 3,
        background: T.surface,
        border: `1px solid ${T.line}`,
        borderRadius: 99,
        marginBottom: 28,
      }}>
        {(["daftar", "masuk"] as const).map((m) => {
          const on = m === mode;
          return (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              aria-pressed={on}
              style={{
                flex: 1,
                border: "none",
                borderRadius: 99,
                padding: "7px 0",
                background: on ? T.ink : "transparent",
                color: on ? T.bg : T.ink2,
                fontFamily: T.fontBody,
                fontSize: T.size.ui,
                fontWeight: on ? T.weight.medium : T.weight.regular,
                cursor: "pointer",
                transition: "background 0.12s, color 0.12s",
              }}
            >
              {m === "daftar" ? "Daftar" : "Masuk"}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column" as const, gap: 18 }}>
        <Field
          label="Email"
          type="email"
          placeholder="nama@student.telkomuniversity.ac.id"
          value={email}
          onChange={setEmail}
          note={daftar ? "Pakai email student Telkom — itu yang mengunci komunitas ini." : undefined}
        />
        <Field label="Password" type="password" placeholder="••••••••" />

        <PrimaryButton onClick={onSubmit}>
          {daftar ? "Kirim kode ke email →" : "Masuk →"}
        </PrimaryButton>
      </div>

      <p style={{ marginTop: 22, fontFamily: T.fontBody, fontSize: T.size.ui, color: T.ink2 }}>
        {daftar ? "Sudah punya akun? " : "Belum gabung? "}
        <button
          type="button"
          onClick={() => setMode(daftar ? "masuk" : "daftar")}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            fontFamily: T.fontBody,
            fontSize: T.size.ui,
            color: T.accent,
            fontWeight: T.weight.medium,
          }}
        >
          {daftar ? "Masuk" : "Daftar"} →
        </button>
      </p>
    </>
  );
}

// ─── Verify view (OTP) ───────────────────────────────────────────────────────────
function VerifyView({ onBack }: { onBack: () => void }) {
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  function setDigit(i: number, v: string) {
    const d = v.replace(/\D/g, "").slice(-1);
    setCode((prev) => prev.map((c, idx) => (idx === i ? d : c)));
    if (d && i < 5) refs.current[i + 1]?.focus();
  }

  return (
    <>
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        {code.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            value={digit}
            onChange={(e) => setDigit(i, e.target.value)}
            inputMode="numeric"
            aria-label={`Digit ${i + 1}`}
            style={{
              width: 46,
              height: 56,
              textAlign: "center" as const,
              background: T.surface,
              border: `1px solid ${digit ? T.accent : T.line}`,
              borderRadius: T.radiusCard,
              fontFamily: T.fontBody,
              fontSize: T.size.title,
              fontWeight: T.weight.medium,
              color: T.ink,
              outline: "none",
            }}
          />
        ))}
      </div>

      <PrimaryButton>Verifikasi &amp; masuk →</PrimaryButton>

      <p style={{ marginTop: 20, fontFamily: T.fontBody, fontSize: T.size.ui, color: T.ink2 }}>
        Nggak ada kodenya?{" "}
        <button type="button" style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: T.fontBody, fontSize: T.size.ui, color: T.accent, fontWeight: T.weight.medium }}>
          Kirim ulang
        </button>
      </p>
      <button
        type="button"
        onClick={onBack}
        style={{ marginTop: 8, background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: T.fontBody, fontSize: T.size.ui, color: T.ink3 }}
      >
        ← Ganti email
      </button>
    </>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>("daftar");
  const [view, setView] = useState<"form" | "verifikasi">("form");
  const [email, setEmail] = useState("");

  const verifying = view === "verifikasi";
  const daftar = mode === "daftar";

  return (
    <div style={{
      minHeight: "100vh",
      background: T.bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "48px 24px",
      fontFamily: T.fontBody,
    }}>
      <div style={{ width: "100%", maxWidth: 396 }}>
        <div style={{ ...eyebrow, marginBottom: 14 }}>Al-Fath Berkarya</div>

        <h1 style={{
          margin: "0 0 10px",
          fontFamily: T.fontDisplay,
          fontSize: T.size.feature,
          fontWeight: T.weight.light,
          letterSpacing: T.track.heading,
          lineHeight: T.lh.heading,
          color: T.ink,
        }}>
          {verifying ? "Cek email kamu." : daftar ? "Gabung ke komunitas builder." : "Selamat datang kembali."}
        </h1>

        <p style={{
          margin: "0 0 32px",
          fontFamily: T.fontBody,
          fontSize: T.size.body,
          color: T.ink2,
          lineHeight: T.lh.body,
        }}>
          {verifying
            ? <>Kami kirim kode 6-digit ke <span style={{ color: T.ink, fontWeight: T.weight.medium }}>{email || "email kamu"}</span>. Masukkan di bawah.</>
            : daftar
              ? "Orang-orang di sini lagi bikin sesuatu yang nyata. Kenalan dulu."
              : "Lanjut dari mana kamu berhenti."}
        </p>

        {verifying ? (
          <VerifyView onBack={() => setView("form")} />
        ) : (
          <FormView
            mode={mode}
            setMode={setMode}
            email={email}
            setEmail={setEmail}
            onSubmit={() => (daftar ? setView("verifikasi") : undefined)}
          />
        )}
      </div>
    </div>
  );
}
