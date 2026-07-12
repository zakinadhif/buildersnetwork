# How-to: parallel UI exploration with worktree agents

*A repeatable way to generate several distinct UI/UX directions for a surface at once, then pull the winner into the app. This is how a `[Desain]` exploration gets built — the mockup that [Gate B of the issue-creation gate](build-workflow.md#the-issue-creation-gate) requires. The chosen mockup **grounds** the `[Fitur]` that follows (its scope and schema follow from the UI); the surface doesn't "graduate" into a feature, it feeds a sibling one. Non-authoritative working knowledge — trust the code when they diverge.*

## When to use it

You're about to build a non-trivial screen and want to *see* a few honest directions before committing — not one hedged compromise. Good for discovery/search surfaces, matchmaking boards, home layouts, onboarding. Overkill for a single component tweak.

## The shape

Run several agents **in parallel, each in its own git worktree** so they never clobber each other's files. Every agent gets the **same context preamble**, then **one different direction**. Each returns a self-contained mockup page + a short rationale; you review them side by side and pull the winning ideas into the real app.

- One `Agent` call per direction, `subagent_type: "claude"`, `isolation: "worktree"`, each using the **`frontend-design` skill**.
- Launch them in a **single message** so they run concurrently.
- Keep each direction **self-contained in its own file**, but **import the shared chrome rather than copying it**: `lib/tokens` (`T`, `eyebrow`), `components/Shell` (background + global stylesheet + left nav), `components/{Avatar,Tag}`, `lib/format`, and `lib/images` (`coverFor`). That way every direction renders under identical font/palette rules without any of them re-declaring tokens. Do **not** re-emit a `<style>` block or re-implement the left nav — `Shell` owns both.
- Put sample data in `apps/mockups/src/data/`, not inline in the render file. Reuse the canonical domain types there (e.g. `LookingFor` from `data/looking-for.ts`) instead of inventing a per-variant string union; a variant expresses its own vocabulary with a local `Record<LookingFor, string>` label map.
- Land the results as `apps/mockups/src/screens/<Screen>.tsx` and register each in `main.tsx`'s `SCREENS` map. When several directions explore the *same* screen, give it a folder — `screens/cari/{index.tsx,VariantA.tsx,…}` — where `index.tsx` holds the variant registry + per-screen picker and each variant is its own file. (See `screens/cari/` for the Cari Kolaborator A/B/C/E explorations.)

## Shared context preamble (paste into every agent)

Adapt the specifics, but keep the four blocks — identity, design system, data shapes, deliverable:

> You are designing UI for **Al-Fath Berkarya**, a builder-community web app for Telkom University students who make side projects ("karya") and want to find collaborators. The app is in **Indonesian**. Tone: warm, humble, student-made.
>
> **Design system (reuse these tokens/classes; defined in `apps/app/src/index.css`):** warm-paper palette (`--bg #f1efe9`, `--ink`, muted greys, a single terracotta `--accent`, hairlines `--line`); Plus Jakarta Sans (`--font`) + IBM Plex Mono (`--mono`); light (300) headings; calm editorial layout. Existing classes: `.screen .nav .wrap .sec-head .empty-state .featured .karya-card .stage-chip .roster`. Atoms: `Avatar`, `STAGE_LABELS` from `@/components/ui-atoms`. *(Confirm against the current `index.css` before pasting — tokens drift.)*
>
> **Data shapes (from `@myapp/api-client-react`):** `Karya`/`KaryaListItem`, `Member`, and the hooks available today. Mock any endpoint that doesn't exist yet.
>
> **What to build:** <the target surface + the FRs it satisfies>. Keep it distinct from existing screens, not duplicative. Mobile-friendly. Indonesian copy.
>
> **Deliverable:** working React + TSX page(s) using the tokens above, plus 3–4 sentences on the direction's bet and trade-offs.

Then append one direction line per agent:

> **Your direction: {{DIRECTION}}.** Lean fully into this; don't hedge toward the others.

## Picking directions

Write 5–6 candidate directions that genuinely diverge (calm/wide vs. dense dashboard vs. search-first vs. editorial vs. matchmaking-forward vs. ranked/upvote), then select 3–4 to actually launch. Divergence is the point — near-duplicates waste a worktree.

## After the round

Review the mockups side by side in the gallery, decide, and pull the winning ideas into the real app. The mockups are throwaway exploration — once a direction ships for real, the mockup can be deleted or kept as a reference in `apps/mockups/src/`. If the direction reshapes a milestone's scope, that's a **Proposed** issue (see [build-workflow.md](build-workflow.md)), not a silent pivot.
