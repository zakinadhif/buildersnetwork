# Product Requirements Document — Al-Fath Berkarya (v2)

| | |
|---|---|
| **Product** | Al-Fath Berkarya |
| **Engine codename** | BuildersNetwork |
| **Document status** | Draft **v2** (synced to the Product Vision) |
| **Supersedes** | `al-fath-berkarya-prd.md` (v1 — kept as the first draft) |
| **Last updated** | (fill in) |
| **Owner** | (fill in) |

> **Changelog — what changed from v1 → v2.** Synced to the Product Vision doc. Added: per-project AI assistant; project posts elaborated to progress/challenges/achievements; karya "open to contributors / incubation" status; microblogging (general beneficial short-form, not only karya updates); community blog; magazine; AI-guided build journey; embeddable Al-Fath Berkarya badge; AI **quota** system and **subscription** tier. Changed: the AI cost stance moved from "AI only at creation" to **"AI woven throughout, made sustainable via quota (free) + subscription (premium)"**; monetization moved from a hard non-goal to an intended freemium direction. Everything from v1 is otherwise preserved.

---

## 1. Overview

Al-Fath Berkarya is a community platform for Al-Fath members to **find their direction, build their work ("karya") in the open, raise the community's collective knowledge, and find the people to build with.** It is organized around the **karya** — any kind of creative or productive work — and uses AI throughout: a conversational front door, a per-project assistant, and (later) a guided build journey.

Inspired by Buildspace's "Sage" but deliberately different: **karya-centric** (not person-centric), **community-scoped and standalone**, **any idea goes**, and **AI-rich but made sustainable** via quota + subscription (the thing Sage never solved).

---

## 2. Background & Problem

**Context.** Al-Fath is a bounded community (students/members, e.g. the team behind the student-run Handai Coffee business incubated at Telkom University's Bandung Techno Park; "FTE friends" who code or are learning to). The community already builds real things but has no shared home for that activity.

**Problems to solve:**
1. **Direction** — many members haven't found their interests, skills, or "thing."
2. **Finding people** — no good way to find collaborators (hackathon teammate, project partner, talent for a gig).
3. **Visibility & collaboration** — builders aren't visible to one another, and contributing to someone's project is harder than it should be.
4. **Productive inspiration & knowledge** — existing platforms capture attention rather than kindle building or grow shared knowledge.

**Why now / why us.** The community is bounded and trusting, which removes cold-start, spam, and scale problems — making a small, focused, AI-rich first build viable.

---

## 3. Goals & Non-Goals

**Goals**
- Take a member from "I don't know what to build" to a concrete next step in one onboarding session.
- Make the community's karya and people visible, alive (via posts), and easy to contribute to.
- Enable the three forms of matchmaking (event team, project team, talent/gig).
- Raise collective knowledge (microblog, blog, eventually a magazine).
- Provide an inspiring, *productive* feed — no brainrot.
- Keep AI sustainable from day one via quota + a subscription path.

**Non-Goals (v1)**
- Not a public, open-internet network — Al-Fath community only.
- Not a recommendation-engine product — no ML ranking at this scale.
- Not multi-tenant / multi-community yet (engine seam preserved).
- *Monetization is no longer a non-goal:* a freemium model (AI quota + subscription) is the intended direction, though the premium build itself is later-phase.

---

## 4. Success Metrics

| Metric | Why it matters |
|---|---|
| Onboarding completion rate | Does the agent get members to a profile + next step? |
| % who create or join a karya | Core activation. |
| **% who post a *second* update** | Leading indicator the flywheel is turning. |
| Karya with ≥2 contributors | Collaboration working. |
| Successful teammate matches (badge → DM → joined) | People-discovery working. |
| Weekly active / returning members | Retention without an external program. |
| Messages sent | Real intent and connection. |
| *(Later)* Free→paid conversion; quota utilization | Sustainability of the AI-rich model. |

Targets set after a baseline week.

---

## 5. Target Users (Personas)

- **The Seeker** — hasn't found their direction. Needs low-pressure discovery and inspiration. The agent's most important user.
- **The Builder** — already shipping (e.g. a Handai founder). Needs a living page, visibility, contributors, a place to share progress and knowledge.
- **The Contributor** — wants to help on others' projects but needs to understand them fast and find an easy way in. (Served by per-project AI + "open to contributors.")
- **The Recruiter/Teammate-seeker** — needs a hackathon team, project partner, or a specific talent.
- **The Organizer** — plans community events; needs to see skills/interests (served by search in v1).

---

## 6. Core Concept & Model

**People → Karya → Anchors.**

- **People** — lightweight profile: name, bio, **skills**, **interests** (AI-synthesized, editable), and the karya they belong to. One person, many karya.
- **Karya** — the spine. Any kind of work. Has description, status, a **contributor roster** (faces), a stream of **posts** (progress/challenges/achievements), and (P1) a **per-project AI**.
- **Anchors** (optional, many-to-many): **interests/themes**; **problems** (optional bank); **events** (hackathons).

**Why karya, not problem, at the center:** forcing every work to declare a "problem" would exclude creative/expressive work and kill "any idea goes." Problems remain one anchor.

**Four use cases:** (1) skillset/interest mapping → People + interests; (2) idea pool/problem bank → Problem anchor; (3) matchmaking → intent badges + seeker board; (4) collective knowledge → posts, microblog, blog, magazine.

---

## 7. Key User Flows

1. **Onboard & find direction** — agent learns skills/interests or helps a Seeker explore → editable profile draft → suggests a karya/people/interests.
2. **Create a karya** — via agent: articulate, tag interests, optionally attach problem/event → editable karya page.
3. **Discover & contribute** — find a karya → read its posts / ask its per-project AI ("what's it built with? how do I contribute?") → request to join → contribute.
4. **Post an update** — progress, a challenge, or an achievement → appears on the karya page and feed.
5. **Find a teammate** — set a "looking for…" badge → others find you on the seeker board → DM → join.
6. **Discover & get inspired** — browse the feed, microblog, and curated homepage picks; search by interest/skill.

---

## 8. Functional Requirements

Priority: **P0** = first build · **P1** = fast-follow · **P2** = later.

### 8.1 Accounts & Auth
- **FR-1 (P0)** Sign up / log in (email/OAuth).
- **FR-2 (P0)** Access limited to the Al-Fath community (invite/allowlist or gated sign-up).

### 8.2 Profiles & Identity
- **FR-3 (P0)** Profile: name, handle, bio, skills[], interests[], karya.
- **FR-4 (P0)** Skills/interests **AI-synthesized** and **directly editable** (field-level; never re-prompt-only).
- **FR-5 (P0)** A "looking for…" intent (see Matchmaking).

### 8.3 Onboarding / Creation Agent
- **FR-6 (P0)** One conversational agent for onboarding, direction-finding, karya creation, profile synthesis. *Acceptance: a Seeker answering "I don't know" is guided to interests/people without pressure to start a project.*
- **FR-7 (P0)** Replies in the community's Indonesian register; output is an editable draft.
- **FR-8 (P0)** Suggestions use **only real platform data** — no fabrication.
- **FR-9 (P1)** Lightweight "update my profile via chat."

### 8.4 Karya
- **FR-10 (P0)** Create a karya (via agent): title, description, status, interest tags.
- **FR-11 (P0)** Karya page: description, status, tags, anchors, **contributor roster shown as faces (profile pics)**, and the **post stream**.
- **FR-12 (P0)** **Request to join**; owner approves/declines.
- **FR-13 (P1)** Optionally link a karya to a problem and/or event.
- **FR-34 (P1)** A karya can mark itself **"open to contributors" / incubation status**, surfacing how to contribute and inviting the community in (the community-effort concept).
- **FR-33 (P1)** **Per-project AI assistant** — anyone can ask a project's AI questions to lower the barrier to collaborate, e.g. "What's this built with?", "How do I contribute?", "What's the nearest problem this project faces?" Grounded in the karya's data and posts; does not fabricate.

### 8.5 Anchors — Interests, Problems, Events
- **FR-14 (P0)** Interest/theme tags, attachable to karya and people, browsable.
- **FR-15 (P0)** A curated starter interest list to prevent fragmentation; free-text additions allowed.
- **FR-16 (P1)** Problem bank: create a problem; attach karya; problem page lists all karya tackling it. *No tiers in v1.*
- **FR-17 (P1)** Lightweight Events.

### 8.6 Posts & Collective Knowledge
- **FR-18 (P0)** Any karya member can post an update — covering **progress, challenges, or achievements**.
- **FR-19 (P0)** Posts appear on the karya page and in the feed.
- **FR-35 (P1)** **Microblogging** — members can post general, beneficial short-form content (not only karya updates) to the feed (X/Threads-style, *no brainrot* — beneficial content from people you know).
- **FR-36 (P1)** **Blog** — longer-form how-tos/guides for collective knowledge (e.g. "how to code comfortably with Claude").
- **FR-37 (P2)** **Magazine** — a periodic, curated editorial compilation of the community's best work and knowledge.
- **FR-20 (P1)** Likes; **FR-21 (P2)** comments.

### 8.7 Feed & Homepage
- **FR-22 (P0)** **Reverse-chronological** feed of recent posts and new karya. No ranking algorithm.
- **FR-23 (P0)** Homepage with a **hand-curated** "Top picked inspiring projects" section + recent feed.
- **FR-24 (P0, admin)** Team can mark a karya as "featured."

### 8.8 Discovery & Search
- **FR-25 (P0)** Browse/search karya by interest, people by skill/interest.
- **FR-26 (P2)** Saved searches / filter refinement.

### 8.9 Matchmaking
- **FR-27 (P0)** "Looking for…" badge: *event team*, *project team*, *talent/gig*, + a note.
- **FR-28 (P0)** A **seeker board** of everyone looking, filterable by type.
- **FR-29 (P1)** Event-scoped filtering + a distinct hackathon team-formation surface.
- **FR-30 (P2)** Badge auto-expiry / "still looking?" nudges.

### 8.10 Messaging
- **FR-31 (P0)** Basic async 1:1 DMs.
- **FR-32 (P0)** "Request to join" and "message" are the connect actions.

### 8.11 Build Support & Identity (vision features)
- **FR-38 (P2)** **AI-guided build journey** — when starting a karya, optional staged guidance through product validation, problem–solution fit, UI/UX prototyping, and other support, with AI at each step.
- **FR-39 (P1)** **Embeddable Al-Fath Berkarya badge** — a "Built at / Incubated by Al-Fath Berkarya" badge member/incubated projects can place in their footers.

### 8.12 Monetization & Quota
- **FR-40 (P1)** **AI quota** — AI usage (agent, per-project AI) is metered/rationed for free members.
- **FR-41 (P2)** **Subscription tier** — premium/impressive AI features for paying members.

---

## 9. Non-Functional Requirements

- **NFR-1 — Mobile-first.** The community is mobile-dominant; design mobile-first.
- **NFR-2 — Sustainable AI (revised).** AI is woven throughout (creation, per-project assistant, guided journey). Sustainability comes from **quota/rationing for free members + a subscription tier**, not from minimizing AI. Non-AI surfaces (feed, search, browsing) stay plain DB queries to keep baseline cost low.
- **NFR-3 — Language/voice.** Authentic Indonesian (code-switched) register, not translated English.
- **NFR-4 — Privacy.** DMs private; profiles community-only; handle data responsibly; some members may be minors — keep surfaces appropriate.
- **NFR-5 — Performance.** Fast on mobile networks.
- **NFR-6 — Scale.** Community scale (hundreds–low thousands); don't over-engineer.
- **NFR-7 — Reliability.** No data loss on edits; editable drafts persist.

---

## 10. Information Architecture / Data Model

| Entity | Key fields |
|---|---|
| **User** | id, name, handle, bio, skills[], interests[], seeking_type, seeking_event, seeking_role, seeking_note, plan (free/paid), ai_quota |
| **Karya** | id, title, description, status, open_to_contributors (bool), created_by, created_at |
| **Interest** | id, name · **KaryaInterest** · **UserInterest** |
| **Problem** | id, title, description, created_by · **KaryaProblem** *(P1)* |
| **Event** | id, name, starts_at, ends_at *(P1)* |
| **KaryaMember** | karya_id, user_id, role, status (member/pending) |
| **Post** | id, karya_id (nullable for microblog), author_id, type (progress/challenge/achievement/microblog), body, created_at |
| **BlogArticle** | id, author_id, title, body, created_at *(P1)* |
| **Like** | post_id, user_id *(P1)* |
| **Message** | id, sender_id, recipient_id, body, created_at, read |
| **Featured** | karya_id, set_by, set_at |

Relationships: User ↔ Karya many-to-many (KaryaMember). Karya ↔ Interest/Problem/Event optional many-to-many. Post belongs to a Karya (or is a standalone microblog post when karya_id is null).

---

## 11. AI / LLM Requirements

- **AI-1** AI surfaces: the onboarding/creation agent; the **per-project assistant**; (P2) the **guided build journey**.
- **AI-2** Output is always an **editable** draft (profile/karya). (Direct fix for Sage's top complaint.)
- **AI-3** **Grounding:** agent and per-project AI reference only real platform data; never invent karya/people/answers.
- **AI-4** **Prompt construction:** hybrid — English logic + Indonesian voice anchor + in-register examples. (See onboarding system prompt doc.)
- **AI-5** **Voice:** warm "older-sibling" guide; natural code-switching; light, non-preachy Islamic warmth; never over-perform peer slang.
- **AI-6** **Sustainability:** AI metered by quota for free members; premium AI behind subscription (FR-40/41). Quality models where they matter; non-AI everywhere they don't.

---

## 12. Release Plan

- **Phase 0 — Founding seed.** Recruit ~20–50 already-building members (Handai and peers) to create karya and post real progress before launch; team acts as relentless first commenter. Goal: content density on day one.
- **Phase 1 — MVP (P0).** Karya core loop: accounts, profiles + agent, karya create/join/roster, posts (progress/challenge/achievement), reverse-chron feed + curated homepage, basic search, basic matchmaking + seeker board, basic messaging. All four use cases represented minimally.
- **Phase 2 — Fast-follow (P1).** Per-project AI; "open to contributors"/incubation; microblogging; blog; problem bank; events; event-scoped matchmaking; the embeddable badge; AI quota; likes; profile-update-via-chat.
- **Horizon (P2).** AI-guided build journey; magazine; subscription tier and premium AI; comments; badge auto-expiry; richer search.

---

## 13. Scope: In / Out

**In (v1):** all P0 items + P0 NFRs.

**Deferred (P1/P2 or beyond):** per-project AI, incubation status, microblog, blog, magazine, guided build journey, badge, problem bank, events, event-scoped matchmaking, quota + subscription — sequenced per §12. **Still fully out of scope:** problem-bank tiers/governance, dedup/merge tooling, feed ranking/algorithmic picks, near-peer surfacing, organizer analytics dashboard, multi-tenant/multi-community, LLM micro-optimization beyond quota.

---

## 14. Assumptions, Constraints, Dependencies

- **Assumption:** the Al-Fath community provides the initial userbase and founding seed.
- **Assumption:** members accept AI-led onboarding (editable-output fix addresses the main objection).
- **Constraint:** small team/budget → lean stack, phased features.
- **Constraint:** authentic Indonesian voice authored/validated by community members.
- **Dependency:** an LLM provider; Supabase/Vercel (or equivalent); a retrieval/lookup mechanism for agent + per-project AI grounding; a quota/metering mechanism.

**Suggested stack:** Next.js (App Router + Server Actions) · Supabase (Auth + Postgres) · shadcn/ui · one LLM provider · Vercel.

---

## 15. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| **LLM cost** | Quota for free members + subscription path; non-AI surfaces stay DB-only (NFR-2). |
| **AI rewrites/locks user words** (Sage's #1 complaint) | Editable drafts everywhere (AI-2, FR-4). |
| **Program-dependence** (killed Sage) | Standalone + internal content flywheel. |
| **"Productive social" → ghost town or attention trap** | Reward shipping over scrolling; reverse-chron, no infinite-scroll ranking; *no brainrot* microblog; curated inspiration. |
| **Cringe / inauthentic voice** | Transcreation from real samples; community validates voice. |
| **Cold start** | Phase 0 founding seed. |
| **Per-project AI hallucinating about a project** | Strict grounding in the karya's real data/posts (AI-3). |
| **Tag fragmentation** | Curated starter interest list (FR-15). |

---

## 16. Open Questions

- **Quota sizing & free/paid boundary:** how much AI is free; which features are premium?
- **Microblog vs. karya feed:** one unified feed or two surfaces?
- **Interest vocabulary:** how curated vs. free-text?
- **Matchmaking priority:** is the hackathon/event-scoped flow a launch wedge (pull into P0)?
- **Profile draft schema:** final fields (skills granularity, "potential," portfolio links)?
- **Access model:** invite-only, allowlist, or open community sign-up?
- **Multi-community (later):** if/when to productize the BuildersNetwork engine for other communities.
