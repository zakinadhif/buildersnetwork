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
import { cn } from "@myapp/ui";

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
    <label className="block">
      <span className="eyebrow mb-1.5 block">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className="w-full rounded-card border border-line bg-surface px-[13px] py-[11px] font-body text-body text-ink outline-none placeholder:text-ink3"
      />
      {note && (
        <span className="mt-1.5 block font-body text-micro text-ink3">
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
      className="w-full cursor-pointer rounded-card border-none bg-ink px-[18px] py-3 font-body text-ui font-semibold tracking-heading text-bg"
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
      <div className="mb-7 flex gap-0.5 rounded-full border border-line bg-surface p-[3px]">
        {(["daftar", "masuk"] as const).map((m) => {
          const on = m === mode;
          return (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              aria-pressed={on}
              className={cn(
                "flex-1 cursor-pointer rounded-full border-none py-[7px] font-body text-ui transition-[background,color] duration-[120ms]",
                on
                  ? "bg-ink text-bg font-medium"
                  : "bg-transparent text-ink2 font-normal",
              )}
            >
              {m === "daftar" ? "Daftar" : "Masuk"}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-[18px]">
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

      <p className="mt-[22px] font-body text-ui text-ink2">
        {daftar ? "Sudah punya akun? " : "Belum gabung? "}
        <button
          type="button"
          onClick={() => setMode(daftar ? "masuk" : "daftar")}
          className="cursor-pointer border-none bg-none p-0 font-body text-ui font-medium text-accent"
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
      <div className="mb-5 flex gap-3">
        {code.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            value={digit}
            onChange={(e) => setDigit(i, e.target.value)}
            inputMode="numeric"
            aria-label={`Digit ${i + 1}`}
            className={cn(
              "h-[56px] w-[46px] rounded-card border bg-surface text-center font-body text-title font-medium text-ink outline-none",
              digit ? "border-accent" : "border-line",
            )}
          />
        ))}
      </div>

      <PrimaryButton>Verifikasi &amp; masuk →</PrimaryButton>

      <p className="mt-5 font-body text-ui text-ink2">
        Nggak ada kodenya?{" "}
        <button type="button" className="cursor-pointer border-none bg-none p-0 font-body text-ui font-medium text-accent">
          Kirim ulang
        </button>
      </p>
      <button
        type="button"
        onClick={onBack}
        className="mt-2 cursor-pointer border-none bg-none p-0 font-body text-ui text-ink3"
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
    <div className="flex min-h-screen items-center justify-center bg-bg px-6 py-12 font-body">
      <div className="w-full max-w-[396px]">
        <div className="eyebrow mb-3.5">Al-Fath Berkarya</div>

        <h1 className="mb-2.5 mt-0 font-display text-feature font-light tracking-heading leading-heading text-ink">
          {verifying ? "Cek email kamu." : daftar ? "Gabung ke komunitas builder." : "Selamat datang kembali."}
        </h1>

        <p className="mb-8 mt-0 font-body text-body leading-body text-ink2">
          {verifying
            ? <><span>Kami kirim kode 6-digit ke </span><span className="font-medium text-ink">{email || "email kamu"}</span><span>. Masukkan di bawah.</span></>
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
