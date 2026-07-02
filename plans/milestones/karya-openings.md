# Milestone: Karya openings — the karya lane (P1 fast-follow)

*Part of the [Roadmap](../roadmap.md). PRD: [al-fath-berkarya-prd.md](../al-fath-berkarya-prd.md) · Vision: [al-fath-berkarya-vision.md](../al-fath-berkarya-vision.md). Non-authoritative working knowledge — trust the code when they diverge.*

**Priority: P1** (PRD §12 Phase 2). Named now because it completes matchmaking; not scheduled until the P0 milestones land. No GitHub milestone yet — groom when it's picked up.

## Why

The mirror of the [people lane](matchmaking.md): a karya marks itself **"open to contributors" / incubation status** (FR-34), surfacing what help it needs and inviting the community in. Together with the people lane this makes matchmaking **two-sided** — browsing people *and* browsing karya-with-openings in one surface, which is what the [Cari Kolaborator mockups](../../apps/app/src/mockups/) (directions A/B/C/E) actually explored.

## Open decisions (settle at grooming)

- **Combined surface direction** — which mockup direction the two-sided board takes: A (two-lane split) · B (intent-typed sections) · C (reciprocal "buat kamu" match) · E (wall of asks). The people-lane seeker board built in P0 is one input; this milestone decides how the karya lane joins it.
- **Fate of the AI-`matches` feature** — the existing AI-suggested `matches` table + page is a *different* model from explicit intent. Replace it, keep it as a serendipity extra, or fold its idea into direction C. Decided here, together with the direction, because C effectively *is* a warmer AI-matches.
- **Data model** — an `open_to_contributors` flag + needed-roles on `karya`, vs. a richer openings entity; whether direction E's "asks" want a timestamped posts-like table rather than flags.

## Exit

A karya owner marks their karya open to contributors with what they need; members browse open karya alongside seekers on one two-sided surface and can act on them (request to join / message).
