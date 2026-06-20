# Sprint 3 — Posts, feed & homepage

*Part of the [P0 Sprint Plan](sprint-plan.md). PRD: [al-fath-berkarya-prd.md](../al-fath-berkarya-prd.md) · Vision: [al-fath-berkarya-vision.md](../al-fath-berkarya-vision.md). Non-authoritative working knowledge — trust the code when they diverge.*

Goal: the flywheel — karya feel alive, and there's a place to see activity.

- [ ] **FR-18** Karya members post updates: `progress / challenge / achievement`.
- [ ] **FR-19** Posts appear on the karya page **and** in the feed.
- [ ] **FR-22** Reverse-chronological feed of recent posts + new karya. **No ranking** (Risk §15: avoid attention-trap).
- [ ] **FR-23** Homepage: hand-curated "Top picked inspiring projects" + recent feed.
- [ ] **FR-24** Admin marks a karya "featured" (`featured` table).

New tables: `posts`, `featured`.

**Exit:** posting an update surfaces it on the karya page and the global feed; homepage shows featured + recent. (Success metric: *% who post a second update* becomes measurable here.)
