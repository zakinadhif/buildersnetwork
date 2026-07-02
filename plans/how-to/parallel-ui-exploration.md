# How-to: parallel UI exploration with worktree agents

*A repeatable way to generate several distinct UI/UX directions for a surface at once, then pull the winner into the app. This is step 5 of the build loop ("2–4 mockup approaches before implementing"). Non-authoritative working knowledge — trust the code when they diverge.*

## When to use it

You're about to build a non-trivial screen and want to *see* a few honest directions before committing — not one hedged compromise. Good for discovery/search surfaces, matchmaking boards, home layouts, onboarding. Overkill for a single component tweak.

## The shape

Run several agents **in parallel, each in its own git worktree** so they never clobber each other's files. Every agent gets the **same context preamble**, then **one different direction**. Each returns a self-contained mockup page + a short rationale; you review them side by side and pull the winning ideas into the real app.

- One `Agent` call per direction, `subagent_type: "claude"`, `isolation: "worktree"`, each using the **`frontend-design` skill**.
- Launch them in a **single message** so they run concurrently.
- Keep each mockup **self-contained**: import only `react` and `./images` (`coverFor`); hardcode all data inline; copy design tokens/shell verbatim from an existing mockup so every direction renders under identical font/palette rules.
- Land the results in `apps/app/src/mockups/` and register each in `main.tsx`'s gallery picker so you can flip between them in one view. (See the existing `MockupB` + `MockupCari{A,B,C,E}` set for the pattern.)

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

Review the mockups side by side in the gallery, decide, and pull the winning ideas into the real app. The mockups are throwaway exploration — once a direction ships for real, the mockup can be deleted or kept as a reference in `apps/app/src/mockups/`. If the direction reshapes a milestone's scope, that's a **Proposed** issue (see [build-workflow.md](build-workflow.md)), not a silent pivot.
