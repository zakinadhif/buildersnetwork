import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { BrandLockup } from "@/components/ui-atoms";
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
    <div className="screen brand-screen">
      <div className="wrap auth-shell" style={{ paddingTop: 0 }}>
        <BrandLockup />
        <p className="eyebrow mt40 mb8">
          {isSignup ? "kenalan pertama" : "ruang anggota"}
        </p>
        <h1 className="h1" style={{ marginBottom: 16 }}>
          {isSignup ? "Kamu masuk." : "Selamat datang kembali."}
        </h1>
        {isSignup && (
          <p className="sub" style={{ marginBottom: 40, maxWidth: 360 }}>
            Di komunitas ini, banyak yang sedang membangun sesuatu yang nyata.
            Kenalan dulu.
          </p>
        )}

        <form
          className="auth-panel"
          onSubmit={handleSubmit}
          style={{ marginTop: isSignup ? 0 : 34 }}
        >
          <div style={{ marginBottom: 12 }}>
            <input
              type="email"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="chat-textarea auth-input"
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <input
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="chat-textarea auth-input"
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-dark"
            style={{ width: "100%", justifyContent: "center" }}
          >
            {loading ? "…" : isSignup ? "Mulai →" : "Masuk →"}
          </button>
        </form>

        <p className="auth-footnote">
          {isSignup ? "sudah anggota? " : "belum anggota? "}
          <button
            type="button"
            onClick={() => {
              setMode(isSignup ? "signin" : "signup");
              setError(null);
            }}
            className="text-link"
          >
            {isSignup ? "masuk ↗" : "daftar ↗"}
          </button>
        </p>
      </div>
    </div>
  );
}
