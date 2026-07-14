# Al-Fath Berkarya — Roadmap

*The ordered milestones that **define** P0 (the ruthless MVP), plus the first named P1 fast-follows. This file is the single source of schedule: what ships when is answered by which milestone cites a capability and where that milestone sits below. Capabilities themselves are defined, schedule-free, in the [requirements catalog](reference/requirements.md); the north star is the [vision](vision.md). Like everything in `plans/`, this is non-authoritative working knowledge — trust the code when they diverge.*

**Open discussion** about vision, ideas, and this sequencing lives in the pinned [🧭 Visi & Roadmap issue (#12)](https://github.com/zakinadhif/buildersnetwork/issues/12) — technical and non-technical alike. This file stays the source of truth; the issue is where changes to it get argued out first.

**How work flows** (docs ↔ issues ↔ board) is defined in [how-to/build-workflow.md](how-to/build-workflow.md). Short version: each milestone has a half-page doc here (the why + exit criteria) and a GitHub Milestone holding its task issues; live status lives on the [project board](https://github.com/users/zakinadhif/projects/8), never in these files.

**How content surfaces relate** (post ↔ feed ↔ karya page ↔ articles) is settled in [content-model.md](reference/content-model.md) — the *feed carries events that point at pages* spine (ratified 2026-07-03). Launchpad, microblog, and articles all inherit it.

---

## P0 — the ruthless MVP (Phase 1)

**The bet: one hero surface, finished.** P0 shrinks to the **Launchpad home**, polished to the edges, sitting on the foundation already built (profile, interests, karya, auth). Everything that pointed *forward* — matchmaking, messaging — moves to **P1**: not because it doesn't matter, but because building it before the hero is validated risks polishing concepts users haven't confirmed they want. Two already-built surfaces (posts + feed, discovery) stay in the app but are reclassified **dark / walking skeleton** — present and integrated, *not* invested in further until real users validate the concept. See [scope treatments](how-to/build-workflow.md#scope-treatments--how-much-a-feature-gets-right-now) for what **hero / dark / deferred** mean.

| Milestone | Doc | Treatment | Core FRs | Status |
|---|---|---|---|---|
| Profile · Interests · Karya core | [archive/](archive/) | foundation | FR-3/4/8/10–15 | Done |
| Posts + feed | [archive/sprint-3.md](archive/sprint-3.md) | **dark** — built, unvalidated. The *feed display* is absorbed into Launchpad and polished there; the *microblog posting* concept waits for validation (→ P1) | FR-18/19/22–24 | Done, frozen |
| Discovery | [archive/sprint-4.md](archive/sprint-4.md) | **dark** — search/filters present but thin; fuller discovery is P1 | FR-25, FR-44 | Done, frozen |
| **Launchpad** | [milestones/launchpad.md](milestones/launchpad.md) | **hero** — the one surface we finish | FR-22/23/25, FR-6 | **Active** |
| Feedback loop — the community's response | [milestones/feedback-loop.md](milestones/feedback-loop.md) | closes the P0 core loop — comments on posts (see below) | FR-42, FR-21 | Planned |
| Seed + hardening | [milestones/seed-hardening.md](milestones/seed-hardening.md) | supports the hero — seed content so the feed lands alive | NFR-1/3/4/5/7 | Later |

> **Why the feedback loop is P0.** The P0 core loop is *create karya → post → **community responds** → post again*, and "responds" needs a channel. A post is a whole object only through its first layer of response; comments are that layer, so they're in P0. Likes (FR-20), threading, replies-to-replies, and notifications are richness *above* the first layer and stay P1. This is what keeps the P0/P1 line from being re-cut later as if it were arbitrary. *(Promoted out of P1 by decision — resolves what was open priority call #1.)* Comments attach to the **post**, not the karya page, per [content-model.md](reference/content-model.md) — one comment system, not two.

## P1 — fast-follow (named, not scheduled)

Pulled out of P0 by the ruthless shrink, plus the previously-named follow-ons. None is scheduled until the Launchpad hero is in front of real users and their behavior tells us what earns polish next.

| Milestone | Doc | Theme | Core FRs | Status |
|---|---|---|---|---|
| Matchmaking — people lane | [milestones/matchmaking.md](milestones/matchmaking.md) | "Looking for…" intent badge + seeker board | FR-5/27/28 | Planned |
| Messaging | [milestones/messaging.md](milestones/messaging.md) | 1:1 DMs, connect actions | FR-31/32 | Planned |
| Karya openings | [milestones/karya-openings.md](milestones/karya-openings.md) | "Open to contributors" — completes two-sided matchmaking | FR-34 | Planned |
| Microblog | — | Twitter-like progress stream — the validated evolution of posts + feed; where `posts.karyaId` may go nullable (personal posts) per [content-model.md](reference/content-model.md) | FR-35 | Planned |

Remaining P1 scope stays in the deferred list below until it earns a milestone doc.

> **Sequencing (current intent) — shrink P0 ruthlessly.** Ship **Launchpad as the single hero**, get it in front of real users, and let their behavior decide what earns polish next. Matchmaking and messaging are demoted from P0 to **P1** — deliberately, so we don't fine-tune concepts before the community confirms they hold. (This is a change from the earlier "Launchpad → Matchmaking → later" order.) Posts + feed and discovery are already built, so rather than extend them we hold them as **walking skeletons** and revisit under P1 once tested. Blog/articles (FR-36) remain P1, unchanged.

> **Why matchmaking is still split.** The [Cari Kolaborator mockups](../apps/mockups/src/) explored a *two-sided* surface — people seeking teams **and** karya seeking contributors — in one board. Those two sides stay separate milestones: the **people lane** ("looking for…" badge + seeker board, FR-5/27/28) comes first, and the **karya lane** ("open to contributors", FR-34 — placed in P1 by this roadmap) follows to make the surface two-sided. Both are now **P1** — the ruthless shrink moved the people lane out of P0 too — but the people lane leads. The mockups (A/B/C/E) remain the design input for the combined surface — see [karya-openings.md](milestones/karya-openings.md).

---

## Conventions

- **A milestone ends shippable:** migration + API route + wired UI + a test (vitest API / Playwright e2e), no half-landed entities. It closes when its **Exit** criterion demonstrably passes. A milestone carries a **target date** (its GitHub `due_on`, shown as a countdown in `/project-status`) as a planning aim — but closure stays exit-driven; a blown date is a signal to surface, not a gate that closes or forces the work.
- **Definition of Done per task:** its issue's acceptance criteria met, happy-path test green, README touched if it documents the surface (per repo convention).
- Don't over-engineer (NFR-6) — community scale.

---

## P0 → P1 boundary (explicitly deferred)

Fast-follow, owned by this roadmap. Named milestones above pull items out of this list as they're scheduled; still deferred: per-project AI (FR-33), validation-seeking surfacing on discovery (FR-43), microblog (FR-35), blog (FR-36), problem bank (FR-16), events + event-scoped matchmaking (FR-17/29), embeddable badge (FR-39), AI quota (FR-40), likes (FR-20), profile-update-via-chat (FR-9).

**One open priority call** that could pull work *into* P0 if decided now:
1. **Hackathon/event-scoped matchmaking (FR-29)** — possible launch wedge. *(Per prior discussion: staying P1 — the generic "event team" badge in the [people lane](milestones/matchmaking.md) covers the launch need.)*

*(The feedback/validation channel + comments call is **resolved: promoted to P0** — see the P0 table and the reasoning beneath it.)*

**Not scheduled.** No milestone owns these yet, and none is planned: **FR-26** (saved searches / filter refinement), **FR-30** (badge auto-expiry), **FR-37** (magazine), **FR-38** (AI-guided build journey), **FR-41** (subscription tier). A capability with no milestone is simply not scheduled — that's the whole statement, and there is deliberately no third phase bucket to grow tags in. The [vision](vision.md)'s "Horizon" is the aspirational read on these.

---

## Open questions

Live product questions, unanswered. They live here — one place to look — rather than scattered across milestone docs. A milestone that one of these blocks may point back at its entry.

- **Quota sizing & free/paid boundary** — how much AI is free; which features are premium? (FR-40/41)
- **Microblog vs. karya feed** — one unified feed or two surfaces? The data-shape half of this (must a post always belong to a karya? `posts.karyaId` nullable) is tracked in [content-model.md](reference/content-model.md); discussion in [#15](https://github.com/zakinadhif/buildersnetwork/issues/15).
- **Interest vocabulary** — how curated vs. free-text? (FR-15)
- **Profile draft schema** — final fields (skills granularity, "potential," portfolio links)? (FR-3/4)
- **Access model** — invite-only, allowlist, or open community sign-up? (FR-2) *Note: the code already gates on `@student.telkomuniversity.ac.id` + OTP; confirm whether that settles this or an invite layer is still wanted.*
- **Multi-community (later)** — if/when to productize the BuildersNetwork engine for other communities.
- **Hackathon/event-scoped matchmaking (FR-29)** — the open priority call above.

---

## Explicitly out of scope

Not "later" — **not doing**. Named so scope creep has to argue with something:

- Problem-bank tiers / governance.
- Dedup / merge tooling for interests and tags (user-created rows accumulate `curated:false`; cleaned up by hand if it ever becomes a chore).
- Feed ranking, algorithmic picks, infinite scroll. Reverse-chron only (FR-22) — this one is a *values* line, not a cost line.
- Near-peer surfacing; organizer analytics dashboards.
- Multi-tenant / multi-community. The engine seam is preserved, not productized. (*If* it ever is, is an open question above; that it isn't being built now, is not.)
- LLM micro-optimization beyond quota (NFR-2/AI-6).
- RBAC / an admin app / a moderation build-out — `ADMIN_EMAILS` is the whole authority model (see [retro](archive/retro.txt)).
