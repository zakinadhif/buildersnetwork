import { sendOtp } from "@myapp/api-client-react";
import { Button } from "@myapp/ui";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Eyebrow } from "@/components/ui-atoms";
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
    <div className="fixed inset-0 animate-up flex items-center">
      <div className="max-w-[var(--container-page)] mx-auto px-7 pt-0">
        <Eyebrow className="mb-2">Al-Fath Berkarya</Eyebrow>
        <h1 className="text-feature font-light tracking-heading leading-heading mb-4">
          {isSignup ? "Gabung ke komunitas." : "Selamat datang kembali."}
        </h1>
        {isSignup && (
          <p className="text-body text-ink2 leading-body mb-10 max-w-[360px]">
            Orang-orang di sini lagi ngerjain sesuatu yang nyata. Kenalan dulu.
          </p>
        )}

        <form onSubmit={handleSubmit} className={isSignup ? "mt-0" : "mt-10"}>
          <div className="mb-3">
            <input
              type="email"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-transparent border-none border-b border-line font-body text-body text-ink outline-none resize-none px-3.5 py-2.5 leading-body max-h-[100px] overflow-y-auto transition-colors focus:border-accent placeholder:text-ink3"
            />
          </div>
          <div className="mb-5">
            <input
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-transparent border-none border-b border-line font-body text-body text-ink outline-none resize-none px-3.5 py-2.5 leading-body max-h-[100px] overflow-y-auto transition-colors focus:border-accent placeholder:text-ink3"
            />
          </div>

          {error && <p className="text-[13px] text-ink2 mb-3">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            variant="primary"
            className="w-full"
          >
            {loading ? "…" : isSignup ? "Mulai →" : "Masuk →"}
          </Button>
        </form>

        <p className="text-[13px] text-ink2 mt-5">
          {isSignup ? "sudah anggota? " : "belum anggota? "}
          <button
            type="button"
            onClick={() => {
              setMode(isSignup ? "signin" : "signup");
              setError(null);
            }}
            className="bg-transparent border-none cursor-pointer text-[13px] text-ink underline p-0"
          >
            {isSignup ? "masuk ↗" : "daftar ↗"}
          </button>
        </p>
      </div>
    </div>
  );
}
