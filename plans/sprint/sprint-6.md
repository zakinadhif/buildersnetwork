# Sprint 6 — Messaging

*Part of the [P0 Sprint Plan](sprint-plan.md). PRD: [al-fath-berkarya-prd.md](../al-fath-berkarya-prd.md) · Vision: [al-fath-berkarya-vision.md](../al-fath-berkarya-vision.md). Non-authoritative working knowledge — trust the code when they diverge.*

Goal: the connect action that closes the loop.

- [ ] **FR-31** Basic async 1:1 DMs (`messages` table).
- [ ] **FR-32** "Request to join" + "message" are *the* connect actions across the app.

**Exit:** badge → DM → conversation works end to end. (Success metric: *messages sent*, *teammate matches*.)

**New tables:** `messages`.
