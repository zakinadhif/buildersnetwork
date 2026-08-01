import { sendOtp } from "@myapp/api-client-react";
import { Button, Eyebrow, Input } from "@myapp/ui";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { EntryAlert, EntryLayout } from "@/components/EntryLayout";
import { signIn, signUp, useSession } from "@/lib/auth-client";

type Mode = "signup" | "signin";

export default function Welcome() {
  const { data: session } = useSession();
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<Mode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user) navigate("/");
  }, [session?.user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.endsWith("@student.telkomuniversity.ac.id")) {
      setError("Gunakan email @student.telkomuniversity.ac.id.");
      return;
    }
    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    setLoading(true);

    if (mode === "signup") {
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
    } else {
      const result = await signIn.email({ email: normalizedEmail, password });
      if (result.error) {
        setError(result.error.message ?? "Gagal masuk");
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    navigate("/");
  }

  const isSignup = mode === "signup";

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
        <label htmlFor="entry-email">
          <Eyebrow as="span" className="mb-1.5 block">
            Email kampus
          </Eyebrow>
          <Input
            id="entry-email"
            type="email"
            placeholder="nama@student.telkomuniversity.ac.id"
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
        <label htmlFor="entry-password">
          <Eyebrow as="span" className="mb-1.5 block">
            Password
          </Eyebrow>
          <Input
            id="entry-password"
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
          onClick={() => {
            setMode(isSignup ? "signin" : "signup");
            setError(null);
          }}
          className="border-none bg-transparent p-0 text-ui font-medium text-accent"
        >
          {isSignup ? "Buka halaman Masuk" : "Buka halaman Daftar"}
        </button>
      </p>
    </EntryLayout>
  );
}
