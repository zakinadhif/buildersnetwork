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

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  cn,
  Eyebrow,
  Input,
  Button,
  ToggleGroup,
  ToggleGroupItem,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@myapp/ui";

type Mode = "daftar" | "masuk";

const authSchema = z.object({
  email: z
    .string()
    .email("Email tidak valid.")
    .endsWith("@student.telkomuniversity.ac.id", "Gunakan email @student.telkomuniversity.ac.id"),
  password: z.string().min(8, "Password minimal 8 karakter."),
});
type AuthValues = z.infer<typeof authSchema>;

const verifySchema = z.object({
  code: z.string().length(6, "Kode verifikasi harus 6 digit."),
});

// ─── Form view (daftar / masuk) ──────────────────────────────────────────────────
function FormView({ mode, setMode, email, setEmail, onSubmit }: {
  mode: Mode;
  setMode: (m: Mode) => void;
  email: string;
  setEmail: (v: string) => void;
  onSubmit: () => void;
}) {
  const daftar = mode === "daftar";

  const form = useForm<AuthValues>({
    resolver: zodResolver(authSchema),
    defaultValues: { email, password: "" },
  });

  function handleSubmit(values: AuthValues) {
    setEmail(values.email);
    if (daftar) onSubmit();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        {/* Mode toggle */}
        <div className="mb-7 flex gap-0.5 rounded-full border border-line bg-surface p-[3px]">
          <ToggleGroup type="single" value={mode} onValueChange={(v: any) => { if (v) setMode(v as Mode) }} className="flex-1 w-full flex">
            {(["daftar", "masuk"] as const).map((m) => (
              <ToggleGroupItem
                key={m}
                value={m}
                className={cn(
                  "flex-1 rounded-full font-body text-ui transition-[background,color] duration-[120ms] text-ink2 font-normal hover:bg-transparent",
                  "data-[state=on]:bg-ink data-[state=on]:text-bg data-[state=on]:font-medium"
                )}
              >
                {m === "daftar" ? "Daftar" : "Masuk"}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="flex flex-col gap-[18px]">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <div className="mb-1.5">
                  <FormLabel asChild><Eyebrow as="span">Email</Eyebrow></FormLabel>
                </div>
                <FormControl>
                  <Input type="email" placeholder="nama@student.telkomuniversity.ac.id" {...field} />
                </FormControl>
                {daftar && <span className="mt-1.5 block font-body text-micro text-ink3">Pakai email student Telkom — itu yang mengunci komunitas ini.</span>}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="mb-1.5">
                  <FormLabel asChild><Eyebrow as="span">Password</Eyebrow></FormLabel>
                </div>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-ink text-bg hover:bg-ink/90 font-semibold tracking-heading"
            size="lg"
          >
            {daftar ? "Kirim kode ke email →" : "Masuk →"}
          </Button>
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
      </form>
    </Form>
  );
}

// ─── Verify view (OTP) ───────────────────────────────────────────────────────────
function VerifyView({ onBack }: { onBack: () => void }) {
  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: { code: "" },
  });

  function onSubmit(values: z.infer<typeof verifySchema>) {
    console.log("verify", values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="mb-5 flex gap-3">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputOTP maxLength={6} {...field}>
                    <InputOTPGroup className="gap-3">
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <InputOTPSlot
                          key={i}
                          index={i}
                          className="h-[56px] w-[46px] rounded-card border bg-surface font-body text-title font-medium text-ink"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-ink text-bg hover:bg-ink/90 font-semibold tracking-heading"
          size="lg"
        >
          Verifikasi &amp; masuk →
        </Button>

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
      </form>
    </Form>
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
        <Eyebrow as="div" className="mb-3.5">Al-Fath Berkarya</Eyebrow>

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
