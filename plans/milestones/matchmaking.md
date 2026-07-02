# Milestone: Matchmaking — people lane

*Part of the [Roadmap](../roadmap.md). PRD: [al-fath-berkarya-prd.md](../al-fath-berkarya-prd.md) · Vision: [al-fath-berkarya-vision.md](../al-fath-berkarya-vision.md). Non-authoritative working knowledge — trust the code when they diverge.*

**Tasks & status:** [GitHub milestone](https://github.com/zakinadhif/buildersnetwork/milestone/1) · [board](https://github.com/users/zakinadhif/projects/8). This doc holds only the why, the decisions, and the exit — never the task list.

## Why

People-discovery via **explicit intent** (FR-5, FR-27, FR-28). A member declares what they're looking for — `event team / project team / talent-gig` — plus a free-text note; everyone looking is browsable on a seeker board, filterable by type. This is the launch-critical "find teammates" loop, and the P0 half of matchmaking.

## Scope

**People lane only.** A member is the one seeking; the board lists people. The mirror image — *karya* seeking contributors ("open to contributors", FR-34) — is **out of scope here** and lives in the [Karya openings](karya-openings.md) P1 milestone. This split keeps a P1 feature off the P0 critical path; the two lanes reunite into one two-sided surface then.

## Decisions

- Intent lives as `seeking_*` fields on the member's profile (alter `profiles`), not a new table — one active intent per member.
- `seekingType` is a closed vocabulary validated in code, not a pg enum (repo convention; see [retro](retro.txt)).
- **Presentation follows the PRD-minimal shape**: an intent badge on the profile + a filterable seeker board. The [Cari Kolaborator mockups](../../apps/app/src/mockups/) are design *reference* for the UI tasks, not a blocking decision — their two-sided ambition belongs to [Karya openings](karya-openings.md).
- The existing AI-`matches` feature stays **untouched** this milestone; its keep/replace fate is decided in [Karya openings](karya-openings.md).

## Exit

A member sets an intent on their profile and another member finds them on the seeker board, filtered by type, end to end in the deployed app.
