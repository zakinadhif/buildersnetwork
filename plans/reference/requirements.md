# Requirements catalog — Al-Fath Berkarya

*A stable catalog of capabilities, cited by ID (`FR-22`, `NFR-1`, `AI-3`) from milestone docs and issues. It defines **what a capability is** and carries **no schedule** — timing is owned by the [roadmap](../roadmap.md). Why the product exists: [vision](../vision.md). How the domain works: [content-model](content-model.md). Non-authoritative working knowledge — trust the code when they diverge.*

---

## 1. Functional Requirements

### 1.1 Accounts & Auth
- **FR-1** Sign up / log in (email/OAuth).
- **FR-2** Access limited to the Al-Fath community (invite/allowlist or gated sign-up).

### 1.2 Profiles & Identity
- **FR-3** Profile: name, handle, bio, skills[], interests[], karya.
- **FR-4** Skills/interests **AI-synthesized** and **directly editable** (field-level; never re-prompt-only).
- **FR-5** A "looking for…" intent (see Matchmaking).

### 1.3 Onboarding / Creation Agent
- **FR-6** One conversational agent for onboarding, direction-finding, karya creation, profile synthesis. *Acceptance: a Seeker answering "I don't know" is guided to interests/people without pressure to start a project.*
- **FR-7** Replies in the community's Indonesian register; output is an editable draft.
- **FR-8** Suggestions use **only real platform data** — no fabrication.
- **FR-9** Lightweight "update my profile via chat."

### 1.4 Karya
- **FR-10** Create a karya (via agent): title, description, status, interest tags. A karya can be created at any maturity — including before anything is built.
- **FR-10a** **Karya stage(s) (lifecycle).** A **multi-select** set of stage labels, so early-stage work is first-class and the feedback channel (FR-42) can meet a project wherever it is. A karya can occupy **more than one stage at once** (e.g. *Validating* + *Building* while it iterates):
  - **Idea** — a concept being explored; not yet validated or built.
  - **Validating** — researching problem–solution fit, target market, demand; actively seeking community feedback.
  - **Building** — actively under construction.
  - **Shipped** — live / released and usable.
  - **Paused** — dormant or on hold (optional; keeps stale projects honest).

  *Stages are owner-set and freely changeable; they're a signal, not a gate. A brand-new karya defaults to **Idea**.*
- **FR-11** Karya page: description, status, tags, anchors, **contributor roster shown as faces (profile pics)**, and the **post stream**.
- **FR-12** **Request to join**; owner approves/declines.
- **FR-13** Optionally link a karya to a problem and/or event.
- **FR-34** A karya can mark itself **"open to contributors" / incubation status**, surfacing how to contribute and inviting the community in (the community-effort concept).
- **FR-33** **Per-project AI assistant** — anyone can ask a project's AI questions to lower the barrier to collaborate, e.g. "What's this built with?", "How do I contribute?", "What's the nearest problem this project faces?" Grounded in the karya's data and posts; does not fabricate.
- **FR-42** **Project feedback / validation channel** — any community member (not only karya members) can leave constructive feedback, reactions, and questions on a karya's page, so builders gather early users and honest feedback *at every stage* — from research and conception (target-market analysis, problem–solution fit) through active building. This implies a karya is worth creating and sharing *before* it is built, not only after. This is the community-driven complement to the AI-guided validation in FR-38. *Mechanism builds on comments (FR-21) and likes (FR-20).*

### 1.5 Anchors — Interests, Problems, Events
- **FR-14** Interest/theme tags, attachable to karya and people, browsable.
- **FR-15** A curated starter interest list to prevent fragmentation; free-text additions allowed.
- **FR-16** Problem bank: create a problem; attach karya; problem page lists all karya tackling it. *No tiers in v1.*
- **FR-17** Lightweight Events.

### 1.6 Posts & Collective Knowledge
- **FR-18** Any karya member can post an update — covering **progress, challenges, or achievements**.
- **FR-19** Posts appear on the karya page and in the feed.
- **FR-35** **Microblogging** — members can post general, beneficial short-form content (not only karya updates) to the feed (X/Threads-style, *no brainrot* — beneficial content from people you know).
- **FR-36** **Blog** — longer-form how-tos/guides for collective knowledge (e.g. "how to code comfortably with Claude").
- **FR-37** **Magazine** — a periodic, curated editorial compilation of the community's best work and knowledge.
- **FR-20** Likes; **FR-21** comments.

### 1.7 Feed & Homepage
- **FR-22** **Reverse-chronological** feed of recent posts and new karya. No ranking algorithm.
- **FR-23** Homepage with a **hand-curated** "Top picked inspiring projects" section + recent feed.
- **FR-24** *(admin)* Team can mark a karya as "featured."

### 1.8 Discovery & Search

*The **browse/discovery page** and the **search page** are distinct surfaces: discovery is for exploring what exists (curated + grouped listings you scroll), search is query-driven lookup.*

- **FR-25** **Project discovery page** — the home page for projects: a browsable listing organized into groupings (e.g. featured per FR-24, recent, by interest, and the validation-seeking grouping per FR-43). The surface for exploring what exists.
- **FR-44** **Search page** — query-driven search of karya by interest and people by skill/interest.
- **FR-43** **Surface validation-seeking karya on the discovery/listing page** — early-stage karya (*Idea* / *Validating*) that are seeking community feedback are surfaced as a visible grouping/section *within* the project discovery page (FR-25), with stage shown on each listing, so members who want to weigh in or become early users find them in the place they already browse. Not a separate destination; feeds the validation loop (FR-42).
- **FR-26** Saved searches / filter refinement (on the search page).

### 1.9 Matchmaking
- **FR-27** "Looking for…" badge: *event team*, *project team*, *talent/gig*, + a note.
- **FR-28** A **seeker board** of everyone looking, filterable by type.
- **FR-29** Event-scoped filtering + a distinct hackathon team-formation surface.
- **FR-30** Badge auto-expiry / "still looking?" nudges.

### 1.10 Messaging
- **FR-31** Basic async 1:1 DMs.
- **FR-32** "Request to join" and "message" are the connect actions.

### 1.11 Build Support & Identity (vision features)
- **FR-38** **AI-guided build journey** — when starting a karya, optional staged guidance through product validation, target market analysis, problem–solution fit, UI/UX prototyping, and other support, with AI at each step.
- **FR-39** **Embeddable Al-Fath Berkarya badge** — a "Built at / Incubated by Al-Fath Berkarya" badge member/incubated projects can place in their footers.

### 1.12 Monetization & Quota
- **FR-40** **AI quota** — AI usage (agent, per-project AI) is metered/rationed for free members.
- **FR-41** **Subscription tier** — premium/impressive AI features for paying members.

---

## 2. Non-Functional Requirements

- **NFR-1 — Desktop-first.** The core experience is creator's work — running a karya, the onboarding agent, long-form posts and blogs, and the build journey (research, validation, prototyping) — and that happens at a desk. Design desktop-first. The app stays responsive and usable on mobile for consumption (feed, discovery, feedback, DMs), but mobile is not the primary design target. *(Revised from mobile-first: the "mobile-dominant community" assumption was not validated, and members do real building work on laptops.)*
- **NFR-2 — Sustainable AI.** AI is woven throughout (creation, per-project assistant, guided journey). Sustainability comes from **quota/rationing for free members + a subscription tier**, not from minimizing AI. Non-AI surfaces (feed, search, browsing) stay plain DB queries to keep baseline cost low.
- **NFR-3 — Language/voice.** Authentic Indonesian (code-switched) register, not translated English.
- **NFR-4 — Privacy.** DMs private; profiles community-only; handle data responsibly; some members may be minors — keep surfaces appropriate.
- **NFR-5 — Performance.** Fast across devices and typical campus/mobile networks.
- **NFR-6 — Scale.** Community scale (hundreds–low thousands); don't over-engineer.
- **NFR-7 — Reliability.** No data loss on edits; editable drafts persist.

---

## 3. AI / LLM Requirements

- **AI-1** AI surfaces: the onboarding/creation agent; the **per-project assistant**; the **guided build journey**.
- **AI-2** Output is always an **editable** draft (profile/karya). (Direct fix for Sage's top complaint.)
- **AI-3** **Grounding:** agent and per-project AI reference only real platform data; never invent karya/people/answers.
- **AI-4** **Prompt construction:** hybrid — English logic + Indonesian voice anchor + in-register examples. (See onboarding system prompt doc.)
- **AI-5** **Voice:** warm "older-sibling" guide; natural code-switching; light, non-preachy Islamic warmth; never over-perform peer slang.
- **AI-6** **Sustainability:** AI metered by quota for free members; premium AI behind subscription (FR-40/41). Quality models where they matter; non-AI everywhere they don't.
