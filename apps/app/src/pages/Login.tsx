import { useState } from "react";
import { useLocation } from "wouter";
import { BrandLockup } from "@/components/ui-atoms";
import { signIn } from "@/lib/auth-client";

export default function Login() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn.email({ email, password });

    if (result.error) {
      setError(result.error.message ?? "Sign in failed");
      setLoading(false);
      return;
    }

    navigate("/");
  };

  return (
    <div className="screen brand-screen">
      <div className="wrap auth-shell" style={{ paddingTop: 0 }}>
        <BrandLockup meta="ruang anggota" />
        <p className="eyebrow mt40 mb8">masuk</p>
        <h1 className="h1" style={{ marginBottom: 16 }}>
          Selamat datang kembali.
        </h1>
        <p className="sub" style={{ maxWidth: 360 }}>
          Masuk pakai akun yang sudah kamu daftarkan.
        </p>

        <form onSubmit={handleSubmit} className="auth-panel">
          <div style={{ marginBottom: 12 }}>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="chat-textarea auth-input"
              placeholder="email"
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="chat-textarea auth-input"
              placeholder="password"
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-dark"
            style={{ width: "100%" }}
          >
            {loading ? "…" : "Masuk →"}
          </button>
        </form>
      </div>
    </div>
  );
}
