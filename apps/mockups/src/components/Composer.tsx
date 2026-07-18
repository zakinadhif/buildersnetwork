import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { KaryaCover } from "@myapp/ui";
import { T, eyebrow } from "@myapp/design-tokens";
import { useNavigate } from "../gallery";
import { ME, MY_KARYA, type Karya } from "../data/karya";
import { coverFor } from "../lib/images";

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
 * the panel itself:
 *
 *   1. The karya is not a form field, it is the byline. "The karya is the account"
 *      (Scroll.tsx) means picking one is picking an identity, the way you post as
 *      a page and not as yourself. So the top of this panel is built to look like
 *      the top of the post it will become — same cover, same serif title, the
 *      human demoted to a line of small print underneath. You are not filling in
 *      a field; you are looking at who is about to speak.
 *
 *   2. It asks for a headline, not for a thought. "Apa yang terjadi — satu baris",
 *      set in the display face at the size the post will use, because a thought
 *      does not have a headline and being asked for one is the moment you notice.
 *      That is a softer gate than an enum you cannot lie your way past, and it is
 *      worth being honest that it is softer: what is left is a norm with a nudge,
 *      not a mechanism.
 */

const field = {
  width: "100%",
  boxSizing: "border-box" as const,
  border: `1px solid ${T.line}`,
  borderRadius: T.radiusCard,
  padding: "9px 11px",
  background: T.bg,
  fontFamily: T.fontBody,
  color: T.ink,
} as const;

// ─── No karya yet — the principle at the door ───────────────────────────────────
// An invitation, never a disabled composer. The reason there is nothing to post is
// not a permission problem: a kabar is *about* work, and there is no work yet. So
// the only useful thing this panel can do is point at the making of some, which is
// also the shortest statement of what the place is for.
function NoKarya() {
  const navigate = useNavigate();

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "14px 16px",
      background: T.surface,
      border: `1px solid ${T.line}`,
      borderRadius: T.radiusPanel,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: T.fontBody, fontSize: T.size.body, fontWeight: T.weight.medium, color: T.ink }}>
          Kabar selalu punya karya
        </div>
        <div style={{ fontFamily: T.fontBody, fontSize: T.size.caption, color: T.ink3, marginTop: 2, lineHeight: T.lh.compact }}>
          Yang tayang di sini kemajuan sebuah karya, dan karyanya yang jadi penulis.
        </div>
      </div>
      <button
        type="button"
        onClick={() => navigate("karya-new")}
        style={{
          flexShrink: 0,
          border: "none",
          borderRadius: T.radiusCard,
          padding: "8px 14px",
          background: T.accent,
          color: T.accentFg,
          fontFamily: T.fontBody,
          fontSize: T.size.ui,
          fontWeight: T.weight.medium,
          cursor: "pointer",
        }}
      >
        Bikin karya
      </button>
    </div>
  );
}

// ─── The byline, which is also the identity control ─────────────────────────────
// One karya renders as plain print with no control at all: a picker over a set of
// one is a decision you cannot make, and offering it implies a choice that isn't
// there. Two or more gets "Ganti" — the risk with several is never picking wrong,
// it is not *noticing*, so the identity stays loud and the control stays quiet.
function Byline({ karya, onSwitch }: { karya: Karya; onSwitch?: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <KaryaCover src={coverFor(karya.interests)} size={40} radius={11} alt={`Logo ${karya.title}`} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontFamily: T.fontDisplay, fontSize: T.size.title, color: T.ink, lineHeight: T.lh.heading }}>
          {karya.title}
        </div>
        <div style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3, marginTop: 1 }}>
          diposting {ME.name}
        </div>
      </div>
      {onSwitch && (
        <button
          type="button"
          onClick={onSwitch}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            border: `1px solid ${T.line}`,
            borderRadius: 99,
            padding: "5px 11px",
            background: "transparent",
            color: T.ink2,
            fontFamily: T.fontBody,
            fontSize: T.size.caption,
            fontWeight: T.weight.medium,
            cursor: "pointer",
          }}
        >
          Ganti
          <ChevronDown size={13} strokeWidth={2} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

/**
 * `karya` pins the identity: the karya page's own stream hands one over, and then
 * there is nothing to pick. Standing on Aksara AI's page and being offered "Ganti"
 * would be absurd — the page *is* the byline, and a control that lets you post as
 * something else from here is one that only ever fires by mistake. On Scroll there
 * is no such context, so the choice comes back.
 */
export function Composer({ karya: pinned }: { karya?: Karya }) {
  const [chosen, setChosen] = useState<Karya | undefined>(MY_KARYA[0]);
  const [switching, setSwitching] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const karya = pinned ?? chosen;
  if (!karya) return <NoKarya />;

  // A kabar needs a karya to speak for and a headline. The body can wait — some
  // news is one line, and padding it out to earn the button helps nobody.
  const ready = Boolean(title.trim());

  return (
    <div style={{
      background: T.surface,
      border: `1px solid ${T.line}`,
      borderRadius: T.radiusPanel,
      padding: 16,
      display: "flex",
      flexDirection: "column" as const,
      gap: 12,
    }}>
      <Byline
        karya={karya}
        onSwitch={!pinned && MY_KARYA.length > 1 ? () => setSwitching((v) => !v) : undefined}
      />

      {switching && (
        <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 12 }}>
          <div style={{ ...eyebrow, marginBottom: 8 }}>Posting sebagai</div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 2 }}>
            {MY_KARYA.map((k) => {
              const on = k.id === karya.id;
              return (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => { setChosen(k); setSwitching(false); }}
                  aria-pressed={on}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    textAlign: "left" as const,
                    border: "none",
                    borderRadius: T.radiusCard,
                    padding: "6px 8px",
                    background: on ? T.accentTint : "transparent",
                    color: on ? T.accent : T.ink2,
                    fontFamily: T.fontBody,
                    fontSize: T.size.ui,
                    fontWeight: on ? T.weight.medium : T.weight.regular,
                    cursor: "pointer",
                  }}
                >
                  <KaryaCover src={coverFor(k.interests)} size={22} radius={7} alt="" />
                  {k.title}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* The headline leads, in the face and size the post will set it in — what
          you type is what you will have said. */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Apa yang terjadi — satu baris"
        aria-label="Judul kabar"
        style={{ ...field, fontFamily: T.fontDisplay, fontSize: T.size.title, lineHeight: T.lh.heading }}
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        placeholder="Ceritakan secukupnya. Yang paling berguna biasanya bagian yang tidak terduga."
        aria-label="Isi kabar"
        style={{ ...field, fontSize: T.size.body, lineHeight: T.lh.body, resize: "vertical" as const }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Says where the thing goes, because the surface you are on is not where
            it lives — the post's home is the karya, and Scroll is a view of it. */}
        <div style={{ fontFamily: T.fontBody, fontSize: T.size.micro, color: T.ink3, lineHeight: T.lh.compact }}>
          Tayang di halaman {karya.title}, lalu muncul di Scroll orang yang mengikutinya.
        </div>
        <button
          type="button"
          disabled={!ready}
          style={{
            marginLeft: "auto",
            flexShrink: 0,
            border: "none",
            borderRadius: T.radiusCard,
            padding: "8px 16px",
            background: ready ? T.accent : T.line,
            color: ready ? T.accentFg : T.ink3,
            fontFamily: T.fontBody,
            fontSize: T.size.ui,
            fontWeight: T.weight.medium,
            cursor: ready ? "pointer" : "default",
            transition: "background 0.12s, color 0.12s",
          }}
        >
          Posting
        </button>
      </div>
    </div>
  );
}
