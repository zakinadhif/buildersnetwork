# Sprint 5 — Matchmaking (badge + seeker board)

*Part of the [P0 Sprint Plan](sprint-plan.md). PRD: [al-fath-berkarya-prd.md](../al-fath-berkarya-prd.md) · Vision: [al-fath-berkarya-vision.md](../al-fath-berkarya-vision.md). Non-authoritative working knowledge — trust the code when they diverge.*

Goal: people-discovery via explicit intent. **Note the divergence:** the existing AI-`matches` feature is a different model; decide whether to keep it as an extra or replace with the PRD's intent-based flow.

- [ ] **FR-5 / FR-27** "Looking for…" intent badge: `event team / project team / talent-gig` + a note. Fields land on the user (`seeking_type, seeking_event, seeking_role, seeking_note`).
- [ ] **FR-28** Seeker board of everyone looking, filterable by type.

**Exit:** a member sets an intent and finds others on the seeker board.

**Schema:** alter `users`/`profiles` with the `seeking_*` fields.
