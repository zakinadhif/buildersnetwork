import { ApiError, sendOtp, verifyOtp } from "@myapp/api-client-react";
import { Button, InputOTP, InputOTPGroup, InputOTPSlot } from "@myapp/ui";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearch } from "wouter";
import { EntryAlert, EntryLayout } from "@/components/EntryLayout";

function extractApiError(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    const data = err.data as { error?: string } | null;
    return data?.error ?? fallback;
  }
  return err instanceof Error ? err.message : fallback;
}

export default function VerifyEmail() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const email = params.get("email") ?? "";
  const wasSent = params.get("sent") === "1";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(wasSent);
  const [cooldown, setCooldown] = useState(wasSent ? 60 : 0);
  const autoSentEmail = useRef<string | null>(null);

  const handleSend = useCallback(async () => {
    setError(null);
    try {
      await sendOtp({ email });
      setSent(true);
      setCooldown(60);
    } catch (err: unknown) {
      setError(extractApiError(err, "Gagal mengirim kode."));
    }
  }, [email]);

  useEffect(() => {
    if (wasSent || !email || autoSentEmail.current === email) return;
    autoSentEmail.current = email;
    void handleSend();
  }, [email, handleSend, wasSent]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await verifyOtp({ email, code });
      // Hard reload so the session re-fetches with emailVerified: true
      window.location.href = "/";
    } catch (err: unknown) {
      setError(extractApiError(err, "Kode tidak valid."));
      setLoading(false);
    }
  }

  return (
    <EntryLayout
      eyebrow="Al-Fath Berkarya"
      title="Verifikasi email kamu."
      description={
        sent ? (
          <>
            Kode 6-digit sudah dikirim ke{" "}
            <span className="font-medium text-ink">{email}</span>.
          </>
        ) : (
          <>Mengirim kode ke {email}…</>
        )
      }
    >
      {error && <EntryAlert>{error}</EntryAlert>}
      <form onSubmit={handleSubmit}>
        <InputOTP
          maxLength={6}
          value={code}
          onChange={setCode}
          autoFocus
          aria-label="Kode verifikasi"
        >
          <InputOTPGroup className="mb-5 gap-2 sm:gap-3">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <InputOTPSlot
                key={index}
                index={index}
                className="h-[52px] w-[42px] rounded-card border bg-surface text-title font-medium text-ink sm:h-[56px] sm:w-[46px]"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
        <Button
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full bg-ink text-bg hover:bg-ink/90"
          size="lg"
        >
          {loading ? "Memverifikasi…" : "Verifikasi & lanjut"}
        </Button>
      </form>
      <div className="mt-5 flex items-center justify-between text-ui">
        <span className="text-ink3">Tidak menerima kode?</span>
        <button
          type="button"
          onClick={handleSend}
          disabled={cooldown > 0}
          className={`border-none bg-transparent p-0 text-ui font-medium ${
            cooldown > 0
              ? "cursor-default text-ink3"
              : "cursor-pointer text-accent"
          }`}
        >
          {cooldown > 0 ? `Kirim ulang dalam ${cooldown}s` : "Kirim ulang"}
        </button>
      </div>
    </EntryLayout>
  );
}
