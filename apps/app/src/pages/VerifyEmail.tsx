import { ApiError, sendOtp, verifyOtp } from "@myapp/api-client-react";
import { Button } from "@myapp/ui";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearch } from "wouter";
import { Eyebrow } from "@/components/ui-atoms";

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

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
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
    if (!email || autoSentEmail.current === email) return;
    autoSentEmail.current = email;
    void handleSend();
  }, [email, handleSend]);

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
    <div className="fixed inset-0 animate-up flex items-center">
      <div className="max-w-[var(--container-page)] mx-auto px-7 pt-0">
        <Eyebrow className="mb-2">Al-Fath Berkarya</Eyebrow>
        <h1 className="text-feature font-light tracking-heading leading-heading mb-4">
          Cek email kamu.
        </h1>
        <p className="text-body text-ink2 leading-body mb-10 max-w-[360px]">
          {sent
            ? `Kode 6 digit dikirim ke ${email}.`
            : `Mengirim kode ke ${email}…`}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              required
              // biome-ignore lint/a11y/noAutofocus: intentional focus on OTP input
              autoFocus
              className="w-full bg-transparent border-none border-b border-line font-body text-feature tracking-[0.3em] text-ink outline-none resize-none px-3.5 py-2.5 leading-body max-h-[100px] overflow-y-auto transition-colors focus:border-accent placeholder:text-ink3"
            />
          </div>

          {error && <p className="text-[13px] text-ink2 mb-3">{error}</p>}

          <Button
            type="submit"
            disabled={loading || code.length !== 6}
            variant="primary"
            className="w-full"
          >
            {loading ? "…" : "Verifikasi →"}
          </Button>
        </form>

        <p className="text-[13px] text-ink2 mt-5">
          Tidak menerima kode?{" "}
          <button
            type="button"
            onClick={handleSend}
            disabled={cooldown > 0}
            className={`bg-transparent border-none p-0 text-[13px] ${
              cooldown > 0
                ? "cursor-default text-ink no-underline"
                : "cursor-pointer text-ink underline"
            }`}
          >
            {cooldown > 0 ? `kirim ulang dalam ${cooldown}s` : "kirim ulang ↗"}
          </button>
        </p>
      </div>
    </div>
  );
}
