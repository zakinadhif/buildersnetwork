# Milestone: Matchmaking — intent badge + seeker board

*Part of the [Roadmap](../roadmap.md). PRD: [al-fath-berkarya-prd.md](../al-fath-berkarya-prd.md) · Vision: [al-fath-berkarya-vision.md](../al-fath-berkarya-vision.md). Non-authoritative working knowledge — trust the code when they diverge.*

**Tasks & status:** [GitHub milestone](https://github.com/zakinadhif/buildersnetwork/milestone/1) · [board](https://github.com/users/zakinadhif/projects/8). This doc holds only the why, the decisions, and the exit — never the task list.

## Why

People-discovery via **explicit intent** (FR-5, FR-27, FR-28). A member declares what they're looking for — `event team / project team / talent-gig` — plus a free-text note; everyone looking is browsable on a seeker board, filterable by type. This is the launch-critical "find teammates" loop.

## Decisions

- Intent lives as `seeking_*` fields on the member's profile (alter `profiles`), not a new table — one active intent per member.
- `seekingType` is a closed vocabulary validated in code, not a pg enum (repo convention; see [retro](retro.txt)).
- **Open — [#7](https://github.com/zakinadhif/buildersnetwork/issues/7):** which Cari Kolaborator direction ships — the mockup explorations in `apps/app/src/mockups/` (A two-lane · B intent-typed · C reciprocal match · E wall of asks) are all two-sided (people ↔ karya) and lean on P1-deferred FR-34/FR-29, so the pick reshapes this milestone's task set. Direction E would also rework the schema task (intent as timestamped asks, not profile fields).
- **Open — [#6](https://github.com/zakinadhif/buildersnetwork/issues/6):** the existing AI-`matches` feature is a different model (AI-suggested vs. explicit intent). Replace, keep both, or defer — undecided; `matches` stays untouched meanwhile. Direction C in #7 would effectively answer this, so decide them together.

## Exit

A member sets an intent on their profile and another member finds them on the seeker board, end to end in the deployed app.
