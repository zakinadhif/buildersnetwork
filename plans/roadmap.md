# Al-Fath Berkarya — Roadmap

*Ordered milestones toward the P0 (MVP / Phase 1) scope in [the PRD](al-fath-berkarya-prd.md), plus the first named P1 fast-follows. Vision north star: [al-fath-berkarya-vision.md](al-fath-berkarya-vision.md). Like everything in `plans/`, this is non-authoritative working knowledge — trust the code when they diverge.*

**Open discussion** about vision, ideas, and this sequencing lives in the pinned [🧭 Visi & Roadmap issue (#12)](https://github.com/zakinadhif/buildersnetwork/issues/12) — technical and non-technical alike. This file stays the source of truth; the issue is where changes to it get argued out first.

**How work flows** (docs ↔ issues ↔ board) is defined in [how-to/build-workflow.md](how-to/build-workflow.md). Short version: each milestone has a half-page doc here (the why + exit criteria) and a GitHub Milestone holding its task issues; live status lives on the [project board](https://github.com/users/zakinadhif/projects/8), never in these files.

**How content surfaces relate** (post ↔ feed ↔ karya page ↔ articles) is settled in [content-model.md](content-model.md) — the *feed carries events that point at pages* spine (ratified 2026-07-03). Launchpad, microblog, and articles all inherit it.

---

## P0 — the ruthless MVP (Phase 1)

**The bet: one hero surface, finished.** P0 shrinks to the **Launchpad home**, polished to the edges, sitting on the foundation already built (profile, interests, karya, auth). Everything that pointed *forward* — matchmaking, messaging — moves to **P1**: not because it doesn't matter, but because building it before the hero is validated risks polishing concepts users haven't confirmed they want. Two already-built surfaces (posts + feed, discovery) stay in the app but are reclassified **dark / walking skeleton** — present and integrated, *not* invested in further until real users validate the concept. See [scope treatments](how-to/build-workflow.md#scope-treatments--how-much-a-feature-gets-right-now) for what **hero / dark / deferred** mean.

| Milestone | Doc | Treatment | Core FRs | Status |
|---|---|---|---|---|
| Profile · Interests · Karya core | [archive/](archive/) | foundation | FR-3/4/8/10–15 | Done |
| Posts + feed | [archive/sprint-3.md](archive/sprint-3.md) | **dark** — built, unvalidated. The *feed display* is absorbed into Launchpad and polished there; the *microblog posting* concept waits for validation (→ P1) | FR-18/19/22–24 | Done, frozen |
| Discovery | [archive/sprint-4.md](archive/sprint-4.md) | **dark** — search/filters present but thin; fuller discovery is P1 | FR-25, FR-44 | Done, frozen |
| **Launchpad** | [milestones/launchpad.md](milestones/launchpad.md) | **hero** — the one surface we finish | FR-22/23/25, FR-6 | **Active** |
| Seed + hardening | [milestones/seed-hardening.md](milestones/seed-hardening.md) | supports the hero — seed content so the feed lands alive | NFR-1/3/4/5/7 | Later |

## P1 — fast-follow (named, not scheduled)

Pulled out of P0 by the ruthless shrink, plus the previously-named follow-ons. None is scheduled until the Launchpad hero is in front of real users and their behavior tells us what earns polish next.

| Milestone | Doc | Theme | Core FRs | Status |
|---|---|---|---|---|
| Matchmaking — people lane | [milestones/matchmaking.md](milestones/matchmaking.md) | "Looking for…" intent badge + seeker board | FR-5/27/28 | Planned |
| Messaging | [milestones/messaging.md](milestones/messaging.md) | 1:1 DMs, connect actions | FR-31/32 | Planned |
| Karya openings | [milestones/karya-openings.md](milestones/karya-openings.md) | "Open to contributors" — completes two-sided matchmaking | FR-34 | Planned |
| Microblog | — | Twitter-like progress stream — the validated evolution of posts + feed; where `posts.karyaId` may go nullable (personal posts) per [content-model.md](content-model.md) | FR-35 | Planned |

Remaining P1 scope stays in the deferred list below until it earns a milestone doc.

> **Sequencing (current intent) — shrink P0 ruthlessly.** Ship **Launchpad as the single hero**, get it in front of real users, and let their behavior decide what earns polish next. Matchmaking and messaging are demoted from P0 to **P1** — deliberately, so we don't fine-tune concepts before the community confirms they hold. (This is a change from the earlier "Launchpad → Matchmaking → later" order and from the PRD, which lists messaging as P0; the PRD gets amended to match once this settles.) Posts + feed and discovery are already built, so rather than extend them we hold them as **walking skeletons** and revisit under P1 once tested. Blog/articles (FR-36) remain P1, unchanged.

> **Why matchmaking is still split.** The [Cari Kolaborator mockups](../apps/app/src/mockups/) explored a *two-sided* surface — people seeking teams **and** karya seeking contributors — in one board. Those two sides sit on different PRD priorities and stay separate milestones: the **people lane** ("looking for…" badge + seeker board, FR-5/27/28) comes first, and the **karya lane** ("open to contributors", FR-34, PRD §12 Phase 2) follows to make the surface two-sided. Both are now **P1** — the ruthless shrink moved the people lane out of P0 too — but the people lane leads. The mockups (A/B/C/E) remain the design input for the combined surface — see [karya-openings.md](milestones/karya-openings.md).

---

## Where the code actually is today

A grounding pass over the repo (React SPA + Hono API on Cloudflare Workers + Drizzle/Postgres + Better Auth) found this already built:

| Area | State | PRD mapping |
|---|---|---|
| Auth gated to `@student.telkomuniversity.ac.id` + OTP email verification | **Done** | FR-1, FR-2 |
| `profiles`, interests, karya spine, posts + feed, discovery | **Done** (milestones 0–4) | FR-3, FR-10–15, FR-18–25, FR-44 |
| Onboarding AI agent (`/api/ai/complete` + `/stream`), Onboarding + Review pages | **Partial** — flow exists; grounding done, not yet quota'd (quota is FR-40, P1). Currently an **obligatory gate** (`App.tsx` redirects profile-less users to `/onboarding`); the [Launchpad](milestones/launchpad.md) milestone makes it optional (sidebar tab) | FR-6, FR-7, FR-8 |
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
