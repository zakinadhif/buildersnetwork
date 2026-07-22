import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn, KaryaCover, Button, Textarea, Card, CardTitle, CardDescription } from "@myapp/ui";
import { useNavigate } from "../gallery";
import { ME, MY_KARYA, type Karya } from "../data/karya";
import { coverFor } from "../lib/images";
import { Eyebrow } from "@myapp/ui";

/**
 * Tulis kabar — the composer, embedded at the head of the two surfaces a kabar
 * can come from: Scroll's feed, and a karya's own update stream.
 *
 * It sits *in* those surfaces rather than behind a button in the left rail. The
 * rail was tried: one door on every surface, which put a second "Tulis kabar"
 * three inches from the karya page's own, and no amount of restyling makes two
 * doors to one room read as anything but a mistake. In place, each surface has
 * exactly one, and it is already where you are looking.
 *
 * What keeps this from being the status box that productive-posting-only exists
 * to refuse is no longer the `kind` enum — that is going away — but the shape of
 * the panel itself: the karya is not a form field, it is the byline. "The karya
 * is the account" (Scroll.tsx) means picking one is picking an identity, the way
 * you post as a page and not as yourself. So the top of this panel is built to
 * look like the top of the post it will become — same cover, same serif title,
 * the human demoted to a line of small print underneath. You are not filling in
 * a field; you are looking at who is about to speak.
 */

// ─── No karya yet — the principle at the door ────────────────────────────────
// An invitation, never a disabled composer. The reason there is nothing to post
// is not a permission problem: a kabar is *about* work, and there is no work
// yet. So the only useful thing this panel can do is point at the making of
// some, which is also the shortest statement of what the place is for.
function NoKarya() {
  const navigate = useNavigate();

  return (
    <Card className="flex flex-row items-center gap-3.5 border-line bg-surface p-4 shadow-none">
      <div className="min-w-0 flex-1">
        <CardTitle className="font-body text-body font-medium text-ink mb-0.5">
          Kabar selalu punya karya
        </CardTitle>
        <CardDescription className="font-body text-caption leading-compact text-ink3">
          Yang tayang di sini kemajuan sebuah karya, dan karyanya yang jadi penulis.
        </CardDescription>
      </div>
      <Button
        onClick={() => navigate("karya-new")}
        variant="primary"
        className="shrink-0 font-medium px-3.5 py-2 h-auto"
      >
        Bikin karya
      </Button>
    </Card>
  );
}

// ─── The byline, which is also the identity control ──────────────────────────
// One karya renders as plain print with no control at all: a picker over a set
// of one is a decision you cannot make, and offering it implies a choice that
// isn't there. Two or more gets "Ganti" — the risk with several is never picking
// wrong, it is not *noticing*, so the identity stays loud and the control stays
// quiet.
function Byline({ karya, onSwitch }: { karya: Karya; onSwitch?: () => void }) {
  return (
    <div className="flex items-center gap-3">
      <KaryaCover src={coverFor(karya.interests)} size={40} radius={11} alt={`Logo ${karya.title}`} />
      <div className="min-w-0 flex-1">
        <div className="font-display text-title leading-heading text-ink">
          {karya.title}
        </div>
        <div className="mt-px font-body text-micro text-ink3">
          diposting {ME.name}
        </div>
      </div>
      {onSwitch && (
        <Button
          variant="outline"
          onClick={onSwitch}
          className="inline-flex h-auto items-center gap-1 rounded-full border-line bg-transparent px-[11px] py-[5px] font-body text-caption font-medium text-ink2 hover:bg-transparent hover:text-ink"
        >
          Ganti
          <ChevronDown size={13} strokeWidth={2} aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}

/**
 * `karya` pins the identity: the karya page's own stream hands one over, and
 * then there is nothing to pick. Standing on Aksara AI's page and being offered
 * "Ganti" would be absurd — the page *is* the byline, and a control that lets
 * you post as something else from here is one that only ever fires by mistake.
 * On Scroll there is no such context, so the choice comes back.
 */
export function Composer({ karya: pinned }: { karya?: Karya }) {
  const [chosen, setChosen] = useState<Karya | undefined>(MY_KARYA[0]);
  const [switching, setSwitching] = useState(false);
  const [body, setBody] = useState("");

  const karya = pinned ?? chosen;
  if (!karya) return <NoKarya />;

  const ready = Boolean(body.trim());

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-line pb-4",
        // Bleed to column rules on both sides — same logic as .bn-post (GlobalStyles).
        "mx-[calc(-1*var(--shell-gutter))] px-[var(--shell-gutter)]",
      )}
    >
      <Byline
        karya={karya}
        onSwitch={!pinned && MY_KARYA.length > 1 ? () => setSwitching((v) => !v) : undefined}
      />

      {switching && (
        <div className="border-t border-line pt-3">
          <Eyebrow as="div" className="mb-2">Posting sebagai</Eyebrow>
          <div className="flex flex-col gap-0.5">
            {MY_KARYA.map((k) => {
              const on = k.id === karya.id;
              return (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => { setChosen(k); setSwitching(false); }}
                  aria-pressed={on}
                  className={cn(
                    "flex cursor-pointer items-center gap-[9px] rounded-card border-none px-2 py-1.5 text-left font-body text-ui",
                    on
                      ? "bg-accent-tint text-accent font-medium"
                      : "bg-transparent text-ink2 font-normal",
                  )}
                >
                  <KaryaCover src={coverFor(k.interests)} size={22} radius={7} alt="" />
                  {k.title}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        placeholder="Ceritakan secukupnya. Yang paling berguna biasanya bagian yang tidak terduga."
        aria-label="Isi kabar"
        className="w-full resize-y font-body text-body leading-body text-ink"
      />

      <div className="flex items-center gap-3">
        {/* Says where the thing goes, because the surface you are on is not where
            it lives — the post's home is the karya, and Scroll is a view of it. */}
        <div className="font-body text-micro leading-compact text-ink3">
          Tayang di halaman {karya.title}, lalu muncul di Scroll orang yang mengikutinya.
        </div>
        <Button
          disabled={!ready}
          variant="primary"
          className="ml-auto shrink-0 font-medium px-4 h-auto py-2"
        >
          Posting
        </Button>
      </div>
    </div>
  );
}
