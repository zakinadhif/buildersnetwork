import { getGetMeQueryKey, saveProfile } from "@myapp/api-client-react";
import { Button } from "@myapp/ui";
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
    <div className="fixed inset-0 animate-up overflow-y-auto">
      <div className="max-w-[440px] mx-auto px-7 py-[72px]">
        <p className="eyebrow mb-2">Al-Fath Berkarya</p>
        <h1 className="text-feature font-light tracking-heading leading-heading">
          Sebelum masuk — panggil kamu siapa?
        </h1>
        <p className="text-body text-ink2 leading-body mt-2">
          Cukup ini dulu. Sisanya bisa kamu lengkapi kapan aja — sendiri atau
          ngobrol sama asisten.
        </p>

        <input
          className="w-full bg-transparent border-none border-b-2 border-ink font-body text-feature font-light tracking-heading text-ink outline-none py-1.5 my-5 mb-2 placeholder:text-ink3"
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

        <div className="flex justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="primary"
            onClick={begin}
            disabled={!name.trim()}
          >
            Masuk ke Launchpad →
          </Button>
        </div>
      </div>
    </div>
  );
}
