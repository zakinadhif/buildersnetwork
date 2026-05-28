import { ApiError, sendOtp, verifyOtp } from "@myapp/api-client-react";
import { useEffect, useState } from "react";
import { useSearch } from "wouter";

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

  useEffect(() => {
    if (email) handleSend();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function handleSend() {
    setError(null);
    try {
      await sendOtp({ email });
      setSent(true);
      setCooldown(60);
    } catch (err: unknown) {
      setError(extractApiError(err, "Gagal mengirim kode."));
    }
  }

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
    <div className="screen" style={{ display: "flex", alignItems: "center" }}>
      <div className="wrap" style={{ paddingTop: 0 }}>
        <p className="eyebrow mb8">Al-Fath Berkarya</p>
        <h1 className="h1" style={{ marginBottom: 16 }}>Cek email kamu.</h1>
        <p className="sub" style={{ marginBottom: 40, maxWidth: 360 }}>
          {sent
            ? `Kode 6 digit dikirim ke ${email}.`
            : `Mengirim kode ke ${email}…`}
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              required
              autoFocus
              className="chat-textarea"
              style={{
                width: "100%",
                padding: "10px 14px",
                resize: "none",
                letterSpacing: "0.3em",
                fontSize: 22,
              }}
            />
          </div>

          {error && (
            <p style={{ fontSize: 13, color: "var(--ink2)", marginBottom: 12 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="btn btn-dark"
            style={{ width: "100%", justifyContent: "center" }}
          >
            {loading ? "…" : "Verifikasi →"}
          </button>
        </form>

        <p style={{ fontSize: 13, color: "var(--ink2)", marginTop: 20 }}>
          Tidak menerima kode?{" "}
          <button
            type="button"
            onClick={handleSend}
            disabled={cooldown > 0}
            style={{
              background: "none",
              border: "none",
              cursor: cooldown > 0 ? "default" : "pointer",
              fontSize: 13,
              color: "var(--ink1)",
              textDecoration: cooldown > 0 ? "none" : "underline",
              padding: 0,
            }}
          >
            {cooldown > 0 ? `kirim ulang dalam ${cooldown}s` : "kirim ulang ↗"}
          </button>
        </p>
      </div>
    </div>
  );
}
