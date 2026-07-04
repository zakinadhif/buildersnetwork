import { getGetMeQueryKey, saveProfile } from "@myapp/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "wouter";
import { Loading } from "@/components/ui-atoms";

/**
 * The minimal-profile start (issue #8, grooming decision 2: a quick one-field
 * form, not an auto-stub). A newly-verified member with no profile gives just a
 * display name, which creates a minimal profile so the app renders without a
 * null-profile crash — then lands straight in the Launchpad shell. Everything
 * else (bio, skills, interests) is enriched later via inline edit or the AI
 * assistant tab. This replaces the old obligatory `/onboarding` chat gate.
 */
export default function MinimalStart({
  defaultName = "",
}: {
  defaultName?: string;
}) {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [name, setName] = useState(defaultName);
  const [busy, setBusy] = useState(false);

  async function begin() {
    const trimmed = name.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    try {
      // year/major are NOT NULL text; empty strings satisfy the column and are
      // filled in later. skills defaults to [] server-side.
      await saveProfile({ name: trimmed, year: "", major: "", skills: [] });
      await queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      navigate("/home");
    } catch (e) {
      console.error(e);
      setBusy(false);
    }
  }

  if (busy) return <Loading label="lagi nyiapin ruangmu" />;

  return (
    <div className="screen" style={{ overflowY: "auto" }}>
      <div className="bn-start">
        <p className="eyebrow mb8">Al-Fath Berkarya</p>
        <h1 className="h1">Sebelum masuk — panggil kamu siapa?</h1>
        <p className="sub mt8">
          Cukup ini dulu. Sisanya bisa kamu lengkapi kapan aja — sendiri atau
          ngobrol sama asisten.
        </p>

        <input
          className="bn-start-field"
          placeholder="nama kamu"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") begin();
          }}
          // biome-ignore lint/a11y/noAutofocus: single-field entry screen
          autoFocus
          aria-label="Nama kamu"
        />

        <div className="row-end mt24">
          <button
            type="button"
            className="btn btn-dark"
            onClick={begin}
            disabled={!name.trim()}
          >
            Masuk ke Launchpad →
          </button>
        </div>
      </div>
    </div>
  );
}
