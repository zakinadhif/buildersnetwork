# Product

## Register

product

## Users

Al-Fath Berkarya serves members of **Al-Fath**, a campus-wide student organization at Telkom University spanning every faculty. They build real side projects ("**karya**") — software, creative work, ventures, anything — and come to the platform to find direction, build in the open, raise the community's shared knowledge, and find people to build with. The community is bounded and trusting, which removes cold-start, spam, and scale problems.

Five personas, in priority order:

- **The Seeker** — hasn't found their direction yet. Needs low-pressure discovery and inspiration. The onboarding agent's most important user.
- **The Builder** — already shipping something real. Needs a living karya page, visibility, contributors, and a place to post progress.
- **The Contributor** — wants to help on others' projects but needs to understand them fast and find an easy way in.
- **The Recruiter / Teammate-seeker** — needs a hackathon team, project partner, or specific talent.
- **The Organizer** — plans community events; needs to see members' skills and interests.

**Context of use:** the core work — running a karya, the onboarding agent, long-form posts, validation/research — happens at a desk. **Design desktop-first**; keep mobile responsive and usable for consumption (feed, discovery, feedback, DMs), but mobile is not the primary design target. Some members may be minors, so keep all surfaces appropriate.

## Product Purpose

A community platform organized around the **karya** (the work itself), not the person. It exists to:

1. Take a member from "I don't know what to build" to a concrete next step in one onboarding session.
2. Make the community's karya and people visible, alive (via posts), and easy to contribute to.
3. Enable three kinds of matchmaking — event team, project team, talent/gig.
4. Raise collective knowledge (microblog → blog → magazine).
5. Give builders a built-in validation loop: early users and honest community feedback right on the karya page, at every stage from idea to shipped.

AI is woven throughout — a conversational onboarding/creation agent, a per-project assistant, and (later) a guided build journey — made sustainable via quota for free members plus a subscription tier, never by minimizing AI. Non-AI surfaces (feed, search, browsing) stay plain DB queries to keep baseline cost low.

**Success looks like:** members completing onboarding, creating or joining a karya, posting a *second* update (the flywheel turning), karya gaining ≥2 contributors and real feedback, and teammate matches turning into DMs and joins — retention without depending on any external program.

## Brand Personality

**Warm, humble, productive.** The voice is a warm "older-sibling" guide — encouraging, grounded, never preachy. Authentic, code-switched **Indonesian** register (NFR-3), with light, non-preachy Islamic warmth; never an over-performed peer-slang costume, never translated-from-English. The interface should feel **student-made and sincere**, not corporate-polished.

Emotional goals: a Seeker feels *invited and unpressured*; a Builder feels *seen*; the whole surface rewards shipping and learning over scrolling. **Productive, not addictive** is the north star — no brainrot, no dark patterns, no engagement bait.

## Anti-references

- **Corporate / sterile** *(primary visual anti-reference)* — no cold enterprise greys, stock-photo polish, or anything impersonal that reads as un-student-made. The warmth and humility must be visible in the pixels, not just the copy.
- **Buildspace "Sage"** *(conceptual)* — its fatal flaws are the things to avoid: program-dependence (be standalone, with an internal content flywheel) and AI that rewrites/locks the user's words (every AI output is an editable draft).
- **Brainrot consumer social** — no infinite-scroll ranking, no algorithmic feed, no attention-trap or engagement-bait patterns. Reverse-chronological, curated, calm.
- **Translated Silicon Valley costume** — not a generic English SaaS reskinned into Indonesian; built in the community's real voice.

## Design Principles

1. **Karya-centric.** The work is the unit, and *any idea goes*. Surfaces lead with the project — its faces, posts, and stage — not with vanity metrics or the individual.
2. **Edit-first AI.** Anything the AI generates is an editable draft, field-level, never a locked black box. This is the direct fix for the #1 complaint about the product's inspiration.
3. **Productive, not addictive.** Reward shipping and learning over scrolling. No infinite scroll, no ranking algorithm, no dark patterns — the feed should make members better, not hooked.
4. **Lower the barrier to collaborate to near-zero.** A curious member should understand a karya and find their way in without interrupting anyone or reading a wall of docs. Projects are open doors, not closed shops.
5. **Authentic and community-scoped.** Built for Al-Fath, in its real code-switched Indonesian voice — warm, humble, student-made. Trust is the platform's advantage; the design should feel like it belongs to the people using it.

## Accessibility & Inclusion

- **Target: WCAG 2.1 AA.** Body text ≥4.5:1 contrast against its background; large text ≥3:1; placeholders held to the same body-text bar. Watch the muted-grey ramp (`--ink2` / `--ink3`) on the warm-paper background — it is the most likely failure point.
- Full keyboard navigation and visible focus states on every interactive element.
- Honor `prefers-reduced-motion` on every animation (crossfade or instant alternative); motion should convey state, not decorate.
- The community may include **minors** — keep all surfaces appropriate; DMs private, profiles community-only.
- Responsive and usable across typical campus and mobile networks.
