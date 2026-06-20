# Al-Fath Berkarya — P0 Sprint Plan

*Sequenced delivery plan for the P0 (MVP / Phase 1) scope in [the PRD](../al-fath-berkarya-prd.md). Vision north star: [al-fath-berkarya-vision.md](../al-fath-berkarya-vision.md). Like everything in `plans/`, this is non-authoritative working knowledge — trust the code when they diverge.*

This file is the index. Each sprint is a living file — open it for the task breakdown and exit criteria, and tick items there as work lands.

---

## Sprints

| # | File | Theme | Core FRs | New tables |
|---|---|---|---|---|
| 0a | [sprint-0.md](sprint-0.md) | Profile model *expand* + draft fixes | FR-3, FR-4 | *(add cols to `profiles`)* |
| 0b | [sprint-0.md](sprint-0.md) | Agent realignment + *contract* | FR-3, FR-4, FR-8 | *(drop cols from `profiles`)* |
| 1 | [sprint-1.md](sprint-1.md) | Interests + profile | FR-14, FR-15 | `interests`, `user_interests` |
| 2 | [sprint-2.md](sprint-2.md) | **Karya core** | FR-10, FR-10a, FR-11, FR-12 | `karya`, `karya_members`, `karya_interests` |
| 3 | [sprint-3.md](sprint-3.md) | Posts + feed | FR-18, FR-19, FR-22, FR-23, FR-24 | `posts`, `featured` |
| 4 | [sprint-4.md](sprint-4.md) | Discovery + search | FR-25, FR-44 | — |
| 5 | [sprint-5.md](sprint-5.md) | Matchmaking | FR-5, FR-27, FR-28 | *(alter `users`/`profiles`)* |
| 6 | [sprint-6.md](sprint-6.md) | Messaging | FR-31, FR-32 | `messages` |
| 7 | [sprint-7.md](sprint-7.md) | Seed + hardening | NFR-1/3/4/5/7 | — |

---

## Where the code actually is today

A grounding pass over the repo (React SPA + Hono API on Cloudflare Workers + Drizzle/Postgres + Better Auth) found this already built:

| Area | State | PRD mapping |
|---|---|---|
| Auth gated to `@student.telkomuniversity.ac.id` + OTP email verification | **Done** | FR-1, FR-2 |
| `profiles` table (`name, year, major, skills[], building, wants, vibe`) | **Partial** — schema differs from PRD (no `handle`, `bio`, `interests[]`) | FR-3 |
| Onboarding AI agent (`/api/ai/complete` + `/stream`), Onboarding + Review pages | **Partial** — flow exists; not yet grounded/quota'd | FR-6, FR-7, FR-8 |
| AI-generated `matches` (table + page) | **Divergent** — this is AI-suggested matches, *not* the PRD's "looking for" badge + seeker board | cf. FR-27/28 |
| Members list (`GET /api/members`) + member profile page | **Partial** — lists all; no search/filter | cf. FR-25, FR-44 |

**The central gap:** the entire **karya** spine — projects, lifecycle stages, contributor roster, posts, feed, curated homepage — does **not** exist yet. That is the heart of the product and where most P0 effort sits ([Sprint 2](sprint-2.md) onward).

> **Stack note.** The PRD "suggests" Next.js + Supabase. The actual stack is React/Vite SPA + Hono + Drizzle + Better Auth on Cloudflare. This plan targets the real stack.

---

## Conventions

- **Cadence:** 1-week sprints, community scale, small team. Don't over-engineer (NFR-6).
- **Each sprint ends shippable:** migration + API route + wired UI + a test (vitest API / Playwright e2e), no half-landed entities.
- **Definition of Done per FR:** schema migrated, endpoint live, UI reachable from a route, happy-path test green, README touched if it documents the surface (per repo convention).

---

## P0 → P1 boundary (explicitly deferred)

Not in this plan; fast-follow per PRD §12: per-project AI (FR-33), feedback/validation channel (FR-42), validation-seeking surfacing on discovery (FR-43), "open to contributors"/incubation (FR-34), microblog (FR-35), blog (FR-36), problem bank (FR-16), events + event-scoped matchmaking (FR-17/29), embeddable badge (FR-39), AI quota (FR-40), likes (FR-20), profile-update-via-chat (FR-9).

**Two open priority calls** (PRD §16) that could pull work *into* P0 if decided now:
1. **Feedback/validation channel (FR-42) + comments (FR-21)** — central to the value prop; candidate for early promotion.
2. **Hackathon/event-scoped matchmaking (FR-29)** — possible launch wedge. *(Per this conversation: staying P1 — the generic "event team" badge in [Sprint 5](sprint-5.md) covers the launch need.)*
