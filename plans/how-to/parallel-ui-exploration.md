# How-to: parallel UI exploration with worktree agents

*A repeatable way to generate several distinct UI/UX directions for a surface at once, then pull the winner into the app. This is how a `[Desain]` exploration gets built — the mockup that [Gate B of the issue-creation gate](build-workflow.md#the-issue-creation-gate) requires. The chosen mockup **grounds** the `[Fitur]` that follows (its scope and schema follow from the UI); the surface doesn't "graduate" into a feature, it feeds a sibling one. Non-authoritative working knowledge — trust the code when they diverge.*

## When to use it

You're about to build a non-trivial screen and want to *see* a few honest directions before committing — not one hedged compromise. Good for discovery/search surfaces, matchmaking boards, home layouts, onboarding. Overkill for a single component tweak.

## The shape

Run several agents **in parallel, each in its own git worktree** so they never clobber each other's files. Every agent gets the **same context preamble**, then **one different direction**. Each returns a self-contained mockup page + a short rationale; you review them side by side and pull the winning ideas into the real app.

- One `Agent` call per direction, `subagent_type: "claude"`, `isolation: "worktree"`, each using the **`frontend-design` skill**.
- Launch them in a **single message** so they run concurrently.
- Keep each direction **self-contained in its own file**, but **import the shared chrome rather than copying it**: `@myapp/design-tokens` (`T`, `eyebrow`), `@myapp/ui` (`Avatar`, `Tag`, `KaryaCover`, `LeftNav`, `ShellColumns`), `components/Shell` (background + global stylesheet + left nav), `lib/format`, and `lib/images` (`coverFor`). That way every direction renders under identical font/palette rules without any of them re-declaring tokens. Do **not** re-emit a `<style>` block or re-implement the left nav — `Shell` owns both.
- Put sample data in `apps/mockups/src/data/`, not inline in the render file. Reuse the canonical domain types there (e.g. `LookingFor` from `data/looking-for.ts`) instead of inventing a per-variant string union; a variant expresses its own vocabulary with a local `Record<LookingFor, string>` label map.
- Land the results as `apps/mockups/src/screens/<Screen>.tsx` and register each in `main.tsx`'s `SCREENS` map. When several directions explore the *same* screen, give it a folder — `screens/cari/{index.tsx,VariantA.tsx,…}` — where `index.tsx` holds the variant registry + per-screen picker and each variant is its own file. (See `screens/cari/` for the Cari Kolaborator A/B/C/E explorations.)

## Shared context preamble (paste into every agent)

Adapt the specifics, but keep the four blocks — identity, shared chrome, data shapes, deliverable:

> You are designing UI for **Al-Fath Berkarya**, a builder-community web app for Telkom University students who make side projects ("karya") and want to find collaborators. The app is in **Indonesian**. Tone: warm, humble, student-made.
>
> **Shared chrome (import it; never re-declare it):** the design system lives in code, not in this brief. Use `T` (+ `eyebrow`) from `@myapp/design-tokens` for every colour, size, and font — do not hard-code a value or invent a token. Take `Avatar`, `Tag`, `KaryaCover`, `LeftNav` and `ShellColumns` from `@myapp/ui`. Wrap the page in `components/Shell` (it owns the background, the global stylesheet, and the left nav — don't re-emit a `<style>` block or rebuild the nav), and reuse `lib/format` and `lib/images` (`coverFor`). Every direction must render under identical font and palette rules; your divergence is in *layout and idea*, not in the tokens.
>
> **Data shapes (from `@myapp/api-client-react`):** `Karya`/`KaryaListItem`, `Member`, and the hooks available today. Mock any endpoint that doesn't exist yet.
>
> **What to build:** <the target surface + the FRs it satisfies>. Keep it distinct from existing screens, not duplicative. Mobile-friendly. Indonesian copy.
>
> **Deliverable:** working React + TSX page(s) built on the shared chrome above, plus 3–4 sentences on the direction's bet and trade-offs.

Then append one direction line per agent:

> **Your direction: {{DIRECTION}}.** Lean fully into this; don't hedge toward the others.

## Picking directions

Write 5–6 candidate directions that genuinely diverge (calm/wide vs. dense dashboard vs. search-first vs. editorial vs. matchmaking-forward vs. ranked/upvote), then select 3–4 to actually launch. Divergence is the point — near-duplicates waste a worktree.

## After the round

Review the mockups side by side in the gallery, decide, and pull the winning ideas into the real app. Register new directions as **Exploration** in `SCREEN_META`; a coherent candidate may become **In Review**, and only a maintainer-accepted, merged direction becomes an **Approved Reference** with its grounding issue and explicit scope. The mockups are throwaway exploration — once a direction ships for real, the mockup can be deleted or kept as a reference in `apps/mockups/src/`. If the direction reshapes a milestone's scope, that's a **Proposed** issue (see [build-workflow.md](build-workflow.md)), not a silent pivot.

## Graduation: when a mockup's chrome moves into `libs/ui`

*The words this section uses — chrome, drift, north star, rail, hairline, eyebrow — are defined in [reference/design-glossary.md](../reference/design-glossary.md).*

The gallery's inline-style idiom is a **feature**, not debt. A screen you can rewrite in one file, with no CSS to name and no component to keep in sync, is what makes five directions in a day possible. Exploration keeps it.

But two implementations of one design **always** drift, and the record is unambiguous: #26 gave the app and the gallery one set of token *values*; #87 still found the type had drifted; #91 found the box model had too, and the app's centre column had been 48px narrow for months. Tokens pin the leaves. They cannot pin the tree.

So chrome **graduates** out of the gallery and into [`libs/ui`](../../libs/ui) — one implementation, imported by both apps — the moment it is:

1. **Ratified** — the design is settled, not a bet still being tested, and
2. **Ported** — the app renders it too, so a second implementation now exists.

Both conditions, not either. Something only the gallery renders has nothing to drift against; something still moving isn't ready to be pinned.

**What has graduated:** `ShellColumns` (the three-column frame), `LeftNav`, `Avatar`, `Tag`, `KaryaCover` (#92), and `KaryaCard` — the feed-row karya card, cover through footer (#97 follow-up).

**What has not, and why:**

- **The variant screens** (`screens/cari/Variant*`) — still exploration. They keep their inline styles and their freedom, which is the whole point. Never force a variant into `libs/ui`.

**When you graduate something**, the usual bar is that neither app moves a pixel: take the mockup's values (the mockup is the north star and wins every disagreement), then measure both sides before and after. #91 and #92 each shipped with a `0 of 2162 elements moved` diff. If your refactor changes how something *looks*, that is a design change wearing a refactor's clothes — split it out and let it be reviewed as one, the way #93 was.

The karya card was that split-out change. It was ratified and ported, so it was due — but the two sides had never been one layout, so unifying them was a *design merge*, not a pixel-preserving lift. It graduated as its own reviewed change: the **mockup did not move**, and the **app conformed to it** (a serif title, the accent activity line, overlapping roster, the interests footer). That is the shape of a design-merge graduation — the mockup holds still, one app changes on purpose, and it is reviewed as the design change it is rather than hidden inside a refactor.

**And the rule that follows from all of it:** if a component lives in `libs/ui`, do not re-declare it in an app. Not "prefer not to" — the reason `libs/ui` exists is that a component which exists once cannot drift. Re-declaring it hands the problem back.
