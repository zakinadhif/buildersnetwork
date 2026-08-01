/**
 * Al-Fath Berkarya — entry screens · issue #101
 *
 * Masuk and Daftar are separate gallery screens and separate product routes.
 * Daftar naturally advances to email verification; neither form contains a mode
 * switch. Review-only response controls stay in the floating preview pane.
 */

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eyebrow,
  Input,
  Button,
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
import { PreviewStates } from "../components/PreviewStates";
import { useNavigate } from "../gallery";

type AuthKind = "daftar" | "masuk";
type ResponseState = "ready" | "busy" | "error";

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

function EntryForm({
  kind,
  email,
  setEmail,
  onRegistered,
  responseState,
}: {
  kind: AuthKind;
  email: string;
  setEmail: (value: string) => void;
  onRegistered: () => void;
  responseState: ResponseState;
}) {
  const daftar = kind === "daftar";
  const form = useForm<AuthValues>({
    resolver: zodResolver(authSchema),
    defaultValues: { email, password: "" },
  });

  function handleSubmit(values: AuthValues) {
    setEmail(values.email);
    if (daftar) onRegistered();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-[18px]">
        {responseState === "error" && (
          <div role="alert" className="rounded-card border border-accent-line bg-accent-tint px-3.5 py-3 font-body text-ui leading-body text-accent">
            {daftar
              ? "Akun belum bisa dibuat. Periksa datanya lalu coba lagi."
              : "Email atau password belum cocok. Periksa lagi lalu coba masuk."}
          </div>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <div className="mb-1.5">
                <FormLabel asChild><Eyebrow as="span">Email kampus</Eyebrow></FormLabel>
              </div>
              <FormControl>
                <Input type="email" placeholder="nama@student.telkomuniversity.ac.id" {...field} />
              </FormControl>
              {daftar && (
                <span className="mt-1.5 block font-body text-micro text-ink3">
                  Email student menjaga komunitas ini tetap dekat dan relevan.
                </span>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="mb-1.5 flex items-center justify-between">
                <FormLabel asChild><Eyebrow as="span">Password</Eyebrow></FormLabel>
                {!daftar && (
                  <button type="button" className="border-none bg-transparent p-0 font-body text-micro text-accent">
                    Lupa password?
                  </button>
                )}
              </div>
              <FormControl>
                <Input type="password" placeholder="Minimal 8 karakter" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={responseState === "busy"}
          className="w-full bg-ink text-bg hover:bg-ink/90 font-semibold tracking-heading"
          size="lg"
        >
          {responseState === "busy"
            ? daftar ? "Membuat akun…" : "Memeriksa akun…"
            : daftar ? "Daftar" : "Masuk"}
        </Button>
      </form>
    </Form>
  );
}

function VerifyView({
  email,
  onBack,
  responseState,
}: {
  email: string;
  onBack: () => void;
  responseState: ResponseState;
}) {
  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: { code: "" },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => undefined)}>
        {responseState === "error" && (
          <div role="alert" className="mb-4 rounded-card border border-accent-line bg-accent-tint px-3.5 py-3 font-body text-ui leading-body text-accent">
            Kodenya salah atau sudah kedaluwarsa. Minta kode baru lalu coba lagi.
          </div>
        )}
        <p className="mb-5 mt-0 font-body text-body leading-body text-ink2">
          Kode 6-digit sudah dikirim ke <span className="font-medium text-ink">{email || "email kamu"}</span>.
        </p>
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem className="mb-5">
              <FormControl>
                <InputOTP maxLength={6} {...field}>
                  <InputOTPGroup className="gap-3">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <InputOTPSlot
                        key={index}
                        index={index}
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
        <Button
          type="submit"
          disabled={responseState === "busy"}
          className="w-full bg-ink text-bg hover:bg-ink/90 font-semibold tracking-heading"
          size="lg"
        >
          {responseState === "busy" ? "Memverifikasi…" : "Verifikasi & lanjut"}
        </Button>
        <div className="mt-5 flex items-center justify-between font-body text-ui">
          <button type="button" onClick={onBack} className="border-none bg-transparent p-0 text-ink3">← Ganti email</button>
          <button type="button" className="border-none bg-transparent p-0 font-medium text-accent">Kirim ulang</button>
        </div>
      </form>
    </Form>
  );
}

function AuthScreen({ kind }: { kind: AuthKind }) {
  const navigate = useNavigate();
  const [view, setView] = useState<"form" | "verifikasi">("form");
  const [email, setEmail] = useState("");
  const [responseState, setResponseState] = useState<ResponseState>("ready");
  const daftar = kind === "daftar";
  const verifying = daftar && view === "verifikasi";

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6 py-12 font-body">
      <div className="w-full max-w-[396px]">
        <Eyebrow as="div" className="mb-3.5">Al-Fath Berkarya</Eyebrow>
        <h1 className="mb-2.5 mt-0 font-display text-feature font-light tracking-heading leading-heading text-ink">
          {verifying ? "Verifikasi email kamu." : daftar ? "Buat akun builder." : "Selamat datang kembali."}
        </h1>
        <p className="mb-8 mt-0 font-body text-body leading-body text-ink2">
          {verifying
            ? "Satu langkah lagi sebelum kamu melengkapi profil."
            : daftar
              ? "Gabung dengan mahasiswa yang sedang membangun sesuatu yang nyata."
              : "Masuk untuk lanjut dari mana kamu berhenti."}
        </p>

        <PreviewStates
          label="State respons"
          value={responseState}
          onChange={setResponseState}
          options={[
            { value: "ready", label: "Siap" },
            { value: "busy", label: "Memproses" },
            { value: "error", label: "Gagal" },
          ]}
        />

        {verifying ? (
          <VerifyView email={email} onBack={() => setView("form")} responseState={responseState} />
        ) : (
          <EntryForm
            kind={kind}
            email={email}
            setEmail={setEmail}
            onRegistered={() => setView("verifikasi")}
            responseState={responseState}
          />
        )}

        {!verifying && (
          <p className="mt-[22px] font-body text-ui text-ink2">
            {daftar ? "Sudah punya akun? " : "Belum punya akun? "}
            <button
              type="button"
              onClick={() => navigate(daftar ? "masuk" : "daftar")}
              className="border-none bg-transparent p-0 font-body text-ui font-medium text-accent"
            >
              {daftar ? "Buka halaman Masuk" : "Buka halaman Daftar"}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

export function MasukScreen() {
  return <AuthScreen kind="masuk" />;
}

export default function DaftarScreen() {
  return <AuthScreen kind="daftar" />;
}
