import { sendOtp } from "@myapp/api-client-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
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
    setLoading(true);
    setError(null);

    if (mode === "signup") {
      if (!email.endsWith("@student.telkomuniversity.ac.id")) {
        setError(
          "Gunakan email student Telkom (@student.telkomuniversity.ac.id).",
        );
        setLoading(false);
        return;
      }
      const result = await signUp.email({
        email,
        password,
        name: email.split("@")[0],
      });
      if (result.error) {
        setError(result.error.message ?? "Gagal daftar");
        setLoading(false);
        return;
      }
      await sendOtp({ email }).catch(() => null);
      navigate(`/verify-email?email=${encodeURIComponent(email)}`);
      return;
    } else {
      const result = await signIn.email({ email, password });
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
    <div className="screen" style={{ display: "flex", alignItems: "center" }}>
      <div className="wrap" style={{ paddingTop: 0 }}>
        <p className="eyebrow mb8">Al-Fath Berkarya</p>
        <h1 className="h1" style={{ marginBottom: 16 }}>
          {isSignup ? "Gabung ke komunitas." : "Selamat datang kembali."}
        </h1>
        {isSignup && (
          <p className="sub" style={{ marginBottom: 40, maxWidth: 360 }}>
            Orang-orang di sini lagi ngerjain sesuatu yang nyata. Kenalan dulu.
          </p>
        )}

        <form onSubmit={handleSubmit} style={{ marginTop: isSignup ? 0 : 40 }}>
          <div style={{ marginBottom: 12 }}>
            <input
              type="email"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="chat-textarea"
              style={{ width: "100%", padding: "10px 14px", resize: "none" }}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <input
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="chat-textarea"
              style={{ width: "100%", padding: "10px 14px", resize: "none" }}
            />
          </div>

          {error && (
            <p
              style={{
                fontSize: 13,
                color: "var(--color-ink2)",
                marginBottom: 12,
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-dark"
            style={{ width: "100%", justifyContent: "center" }}
          >
            {loading ? "…" : isSignup ? "Mulai →" : "Masuk →"}
          </button>
        </form>

        <p style={{ fontSize: 13, color: "var(--color-ink2)", marginTop: 20 }}>
          {isSignup ? "sudah anggota? " : "belum anggota? "}
          <button
            type="button"
            onClick={() => {
              setMode(isSignup ? "signin" : "signup");
              setError(null);
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              color: "var(--color-ink)",
              textDecoration: "underline",
              padding: 0,
            }}
          >
            {isSignup ? "masuk ↗" : "daftar ↗"}
          </button>
        </p>
      </div>
    </div>
  );
}
