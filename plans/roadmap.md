# Al-Fath Berkarya — Roadmap

*Ordered milestones toward the P0 (MVP / Phase 1) scope in [the PRD](al-fath-berkarya-prd.md), plus the first named P1 fast-follows. Vision north star: [al-fath-berkarya-vision.md](al-fath-berkarya-vision.md). Like everything in `plans/`, this is non-authoritative working knowledge — trust the code when they diverge.*

**How work flows** (docs ↔ issues ↔ board) is defined in [how-to/build-workflow.md](how-to/build-workflow.md). Short version: each milestone has a half-page doc here (the why + exit criteria) and a GitHub Milestone holding its task issues; live status lives on the [project board](https://github.com/users/zakinadhif/projects/8), never in these files.

---

## P0 — MVP (Phase 1)

| Milestone | Doc | Theme | Core FRs | Status |
|---|---|---|---|---|
| Profile model | [archive/sprint-0.md](archive/sprint-0.md) | Profile expand + agent contract | FR-3, FR-4, FR-8 | Done |
| Interests | [archive/sprint-1.md](archive/sprint-1.md) | Interests + profile | FR-14, FR-15 | Done |
| Karya core | [archive/sprint-2.md](archive/sprint-2.md) | Projects, lifecycle, roster | FR-10–12 | Done |
| Posts + feed | [archive/sprint-3.md](archive/sprint-3.md) | Progress posts, featured | FR-18/19/22–24 | Done |
| Discovery | [archive/sprint-4.md](archive/sprint-4.md) | Search + filters | FR-25, FR-44 | Done |
| **Matchmaking — people lane** | [milestones/matchmaking.md](milestones/matchmaking.md) | "Looking for…" intent badge + seeker board | FR-5, FR-27, FR-28 | **Active** |
| Messaging | [milestones/messaging.md](milestones/messaging.md) | 1:1 DMs, connect actions | FR-31, FR-32 | Next |
| Seed + hardening | [milestones/seed-hardening.md](milestones/seed-hardening.md) | Phase 0 content + NFR pass | NFR-1/3/4/5/7 | Next |

## P1 — fast-follow (named, not yet scheduled)

| Milestone | Doc | Theme | Core FRs | Status |
|---|---|---|---|---|
| Karya openings | [milestones/karya-openings.md](milestones/karya-openings.md) | "Open to contributors" — the karya-seeking-contributors lane; completes two-sided matchmaking | FR-34 | Planned |

Remaining P1 scope stays in the deferred list below until it earns a milestone doc.

> **Why matchmaking is split.** The [Cari Kolaborator mockups](../apps/app/src/mockups/) explored a *two-sided* surface — people seeking teams **and** karya seeking contributors — in one board. But the two sides sit on different PRD priorities: the **people lane** ("looking for…" badge + seeker board, FR-5/27/28) is **P0**, while the **karya lane** ("open to contributors", FR-34) is **P1** (PRD §12 Phase 2). Fusing them would drag a P1 feature into the P0 critical path. So P0 ships the people lane alone; the karya lane becomes the first named P1 milestone that makes the surface two-sided. The mockups (A/B/C/E) remain the design input for that combined surface — see [karya-openings.md](milestones/karya-openings.md).

---

## Where the code actually is today

A grounding pass over the repo (React SPA + Hono API on Cloudflare Workers + Drizzle/Postgres + Better Auth) found this already built:

| Area | State | PRD mapping |
|---|---|---|
| Auth gated to `@student.telkomuniversity.ac.id` + OTP email verification | **Done** | FR-1, FR-2 |
| `profiles`, interests, karya spine, posts + feed, discovery | **Done** (milestones 0–4) | FR-3, FR-10–15, FR-18–25, FR-44 |
| Onboarding AI agent (`/api/ai/complete` + `/stream`), Onboarding + Review pages | **Partial** — flow exists; grounding done, not yet quota'd (quota is FR-40, P1) | FR-6, FR-7, FR-8 |
| AI-generated `matches` (table + page) | **Divergent** — AI-suggested matches, *not* the PRD's explicit intent model. Left untouched through P0; its keep/replace fate is decided in the [Karya openings](milestones/karya-openings.md) milestone, alongside the richer matchmaking surface | cf. FR-27/28 |

> **Stack note.** The PRD "suggests" Next.js + Supabase. The actual stack is React/Vite SPA + Hono + Drizzle + Better Auth on Cloudflare. This plan targets the real stack.

---

## Conventions

- **A milestone ends shippable:** migration + API route + wired UI + a test (vitest API / Playwright e2e), no half-landed entities. It closes when its **Exit** criterion demonstrably passes — there is no time-box.
- **Definition of Done per task:** its issue's acceptance criteria met, happy-path test green, README touched if it documents the surface (per repo convention).
- Don't over-engineer (NFR-6) — community scale.

---

## P0 → P1 boundary (explicitly deferred)

Fast-follow per PRD §12. Named milestones above pull items out of this list as they're scheduled; still deferred: per-project AI (FR-33), feedback/validation channel (FR-42), validation-seeking surfacing on discovery (FR-43), microblog (FR-35), blog (FR-36), problem bank (FR-16), events + event-scoped matchmaking (FR-17/29), embeddable badge (FR-39), AI quota (FR-40), likes (FR-20), profile-update-via-chat (FR-9).

**Two open priority calls** (PRD §16) that could pull work *into* P0 if decided now:
1. **Feedback/validation channel (FR-42) + comments (FR-21)** — central to the value prop; candidate for early promotion.
2. **Hackathon/event-scoped matchmaking (FR-29)** — possible launch wedge. *(Per prior discussion: staying P1 — the generic "event team" badge in the [people lane](milestones/matchmaking.md) covers the launch need.)*
