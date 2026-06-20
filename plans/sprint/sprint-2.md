# Sprint 2 — Karya core *(the spine — biggest sprint)*

*Part of the [P0 Sprint Plan](sprint-plan.md). PRD: [al-fath-berkarya-prd.md](../al-fath-berkarya-prd.md) · Vision: [al-fath-berkarya-vision.md](../al-fath-berkarya-vision.md). Non-authoritative working knowledge — trust the code when they diverge.*

Goal: a karya exists, can be created, joined, and viewed as a living page.

- [ ] **FR-10** Create a karya via the agent: `title, description, status, interest tags`. Creatable at any maturity (before anything is built).
- [ ] **FR-10a** Lifecycle `stages[]` — multi-select `idea / validating / building / shipped / paused`, owner-set, default `[idea]`. Signal, not a gate.
- [ ] **FR-11** Karya page: description, status, tags, anchors, **contributor roster as faces (profile pics)**, post stream placeholder.
- [ ] **FR-12** Request to join → owner approves/declines (`karya_members` with `status: member/pending`).

New tables: `karya`, `karya_members`, `karya_interests`. Consider whether to extend the onboarding agent or add a dedicated "create karya" agent entry.

**Exit:** a member creates a karya from chat, others see it with contributor faces and can request to join.
