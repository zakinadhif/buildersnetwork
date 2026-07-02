# Sprint 4 — UI brainstorming kit

*Working scaffold for spinning up parallel UI agents to explore directions for the
Sprint 4 discovery (FR-25) and search (FR-44) surfaces. See [sprint-4.md](sprint-4.md).
Non-authoritative — trust the code when they diverge.*

## How to spin up the agents

Run several agents **in parallel, each in its own git worktree** so they don't
clobber each other's files. Give every agent the **same context preamble** below,
then a **different direction**. Each should use the `frontend-design` skill.

- One `Agent` call per direction, `subagent_type: "claude"`, `isolation: "worktree"`.
- Launch them in a single message so they run concurrently.
- Each returns a self-contained page (or pages) + a short rationale; review the
  worktrees side by side, then pull the winning ideas into the real app.

## Shared context preamble (paste into every agent)

> You are designing UI for **Al-Fath Berkarya**, a builder-community web app for
> Telkom University students who make side projects ("karya") and want to find
> collaborators. The app is in **Indonesian**. Tone: warm, humble, student-made.
>
> **Current design system (reuse these tokens/classes; defined in `apps/app/src/index.css`):**
> - Palette: `--bg #f1efe9` (warm paper), `--ink #0f0e0b`, muted greys `--ink2 #8a8781` / `--ink3 #bbb8b2`,
>   a single accent `--accent oklch(39% 0.085 62)` (terracotta), hairlines `--line #dedad2`.
> - Type: Plus Jakarta Sans (`--font`), IBM Plex Mono (`--mono`). Headings are **light (weight 300)**.
> - Current layout is a narrow **580px single column** (`--max`), calm and editorial. Existing
>   classes: `.screen .nav .wrap .sec-head .empty-state .featured .karya-card .stage-chip .roster`.
> - Components: `Avatar`, `STAGE_LABELS` from `@/components/ui-atoms`.
>
> **Data shapes (from `@myapp/api-client-react`):**
> - `Karya` / `KaryaListItem`: `{ id, title, description, stages: KaryaStage[], interests: string[], roster: RosterMember[] }`
> - `Member`: `{ id, name, handle, bio, interests: string[], skills: string[], year, major }`
> - Hooks available today: `useGetFeatured()`, `useGetFeed()`. (Search/discovery endpoints are TBD — mock them.)
>
> **What to build:** the two Sprint 4 surfaces —
> - **FR-25 Discovery:** browsable, *grouped* listings of karya — featured, recent, and by interest.
> - **FR-44 Search:** query-driven — karya by interest; people by skill/interest.
>
> Keep the existing CommunityHome (`/home`, featured + feed) in mind — discovery and
> home must feel distinct, not duplicative. Mobile-friendly. Indonesian copy.
>
> **Deliverable:** working React + TSX page(s) using the tokens above, plus 3–4
> sentences on the direction's bet and trade-offs.

## Per-direction line (append one of these to the preamble)

> **Your direction: {{DIRECTION}}.** Lean fully into this; don't hedge toward the others.

### Candidate directions (pick / edit before launching)

- **A — Calm, wide.** Keep the warm minimal language; just break the 580px cap into a
  relaxed grid. Groupings as quiet horizontal rails (Pilihan / Terbaru / Per minat). No gamification.
- **B — Launchpad.** Peerlist-style three-column dashboard: ranked karya, weekly cadence,
  a "top builders" people rail, social proof. Stress-test whether the warm palette survives density.
- **C — Search-first.** Query + facets (minat, skill, stage) are the hero; browse groupings
  live beneath. Optimizes FR-44; discovery is a by-product of filtering.
- **D — Editorial showcase.** Magazine-style curated collections by interest, big featured
  cards, fewer-but-richer. Discovery as a curated feed, not a directory.
- **E — People ↔ karya.** Emphasize matchmaking: karya and the builders behind them shown
  side by side and cross-linked, so browsing projects is also browsing people.
- **F — Hero + upvotable list.** A prominent hero at the top showcasing featured karya, then a
  scrollable list of karya below, each row with an **upvote** button (lightweight ranking signal).

### Selected for this round

A, B, D, F. (Final launch-ready prompts below.)

## Final prompts (this round)

Each prompt = the **Shared context preamble** above + the matching direction line below.
All run with `frontend-design` skill, `subagent_type: "claude"`, `isolation: "worktree"`.

- **A:** "Your direction: **Calm, wide.** Keep the warm minimal language and tokens intact; just
  break the 580px cap into a relaxed multi-column grid. Render discovery as quiet horizontal rails
  — *Pilihan inspiratif*, *Terbaru*, and one rail per interest (*Per minat*). No upvotes, no
  leaderboards, no ranking chrome. Search (FR-44) is a calm filter, not a dashboard. The bet:
  scale browsing without betraying the editorial, student-made feel."
- **B:** "Your direction: **Launchpad.** Build a Peerlist-style three-column dashboard: a center
  column of ranked karya (with a weekly cadence / week tabs), a left nav rail, and a right rail with
  a *Top Builders* people list (people by skill/interest = FR-44) plus social proof. Add upvotes and
  ranking. Push the warm palette into a dense layout and report whether the identity survives or
  needs to bend."
- **D:** "Your direction: **Editorial showcase.** Magazine-style discovery: large featured karya
  cards up top, then curated collections grouped by interest (*Koleksi per minat*), fewer-but-richer
  cards with real hierarchy and whitespace. Discovery reads as a curated feed, not a directory.
  Search (FR-44) surfaces collections and people as editorial results."
- **F:** "Your direction: **Hero + upvotable list.** A prominent hero at the top spotlighting
  featured karya (rotating or stacked), then a single scrollable list of karya below, each row
  compact with title, one-line desc, interest/stage chips, roster avatars, and an **upvote** button
  with a count. Upvotes are a soft ranking signal — keep it warm and humble, not competitive. Fold
  people-search (FR-44) in as a secondary tab or filter."
