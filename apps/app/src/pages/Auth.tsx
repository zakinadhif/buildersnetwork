import { sendOtp } from "@myapp/api-client-react";
import { Button, Eyebrow, Input } from "@myapp/ui";
import { useEffect, useState, type FormEvent } from "react";
import { useLocation } from "wouter";
import { EntryAlert, EntryLayout } from "@/components/EntryLayout";
import { signIn, signUp, useSession } from "@/lib/auth-client";

type AuthMode = "login" | "signup";

export default function Auth({ mode }: { mode: AuthMode }) {
  const { data: session } = useSession();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isSignup = mode === "signup";

  useEffect(() => {
    if (session?.user) navigate("/");
  }, [session?.user, navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (
      isSignup &&
      !normalizedEmail.endsWith("@student.telkomuniversity.ac.id")
    ) {
      setError("Gunakan email @student.telkomuniversity.ac.id.");
      return;
    }
    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    setLoading(true);

    if (isSignup) {
      const result = await signUp.email({
        email: normalizedEmail,
        password,
        name: normalizedEmail.split("@")[0],
      });
      if (result.error) {
        setError(result.error.message ?? "Gagal daftar");
        setLoading(false);
        return;
      }

      let otpSent = false;
      try {
        await sendOtp({ email: normalizedEmail });
        otpSent = true;
      } catch {
        // The verification screen retries automatically when the first send
        // did not succeed, and exposes the actionable error there.
      }
      navigate(
        `/verify-email?email=${encodeURIComponent(normalizedEmail)}${otpSent ? "&sent=1" : ""}`,
      );
      return;
    }

    const result = await signIn.email({
      email: normalizedEmail,
      password,
    });
    if (result.error) {
      setError(result.error.message ?? "Gagal masuk");
      setLoading(false);
      return;
    }

    setLoading(false);
    navigate("/");
  }

  return (
    <EntryLayout
      eyebrow="Al-Fath Berkarya"
      title={isSignup ? "Buat akun builder." : "Selamat datang kembali."}
      description={
        isSignup
          ? "Gabung dengan mahasiswa yang sedang membangun sesuatu yang nyata."
          : "Masuk untuk lanjut dari mana kamu berhenti."
      }
    >
      {error && <EntryAlert>{error}</EntryAlert>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
        <label htmlFor={`${mode}-email`}>
          <Eyebrow as="span" className="mb-1.5 block">
            {isSignup ? "Email kampus" : "Email"}
          </Eyebrow>
          <Input
            id={`${mode}-email`}
            type="email"
            placeholder={
              isSignup ? "nama@student.telkomuniversity.ac.id" : "Email kamu"
            }
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {isSignup && (
            <span className="mt-1.5 block text-micro text-ink3">
              Email student menjaga komunitas ini tetap dekat dan relevan.
            </span>
          )}
        </label>
        <label htmlFor={`${mode}-password`}>
          <Eyebrow as="span" className="mb-1.5 block">
            Password
          </Eyebrow>
          <Input
            id={`${mode}-password`}
            type="password"
            placeholder="Minimal 8 karakter"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-ink text-bg hover:bg-ink/90"
          size="lg"
        >
          {loading
            ? isSignup
              ? "Membuat akun…"
              : "Memeriksa akun…"
            : isSignup
              ? "Daftar"
              : "Masuk"}
        </Button>
      </form>
      <p className="mt-[22px] text-ui text-ink2">
        {isSignup ? "Sudah punya akun? " : "Belum punya akun? "}
        <button
          type="button"
          onClick={() => navigate(isSignup ? "/login" : "/signup")}
          className="border-none bg-transparent p-0 text-ui font-medium text-accent"
        >
          {isSignup ? "Buka halaman Masuk" : "Buka halaman Daftar"}
        </button>
      </p>
    </EntryLayout>
  );
}
