---
target: apps/app/src/mockups/MockupB.tsx
total_score: 28
p0_count: 0
p1_count: 3
timestamp: 2026-06-28T04-50-22Z
slug: apps-app-src-mockups-mockupb-tsx
---
# Critique — MockupB.tsx (Al-Fath Berkarya Launchpad)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Vote/active states give feedback; no loading/skeleton (static mock, expected) |
| 2 | Match System / Real World | 3 | Indonesian voice excellent; abstract nav glyphs (◈◉◎◇◆) mean nothing |
| 3 | User Control and Freedom | 3 | Upvote toggles, "Hapus filter", week tabs — solid for this surface |
| 4 | Consistency and Standards | 3 | Two "Pilihan Minggu Ini" treatments; nav is div-onClick while filters are button |
| 5 | Error Prevention | 3 | Low-stakes inputs; little to get wrong |
| 6 | Recognition Rather Than Recall | 3 | Labels present, but icons add zero recognition value |
| 7 | Flexibility and Efficiency | 2 | No keyboard shortcuts; nav items not keyboard-reachable |
| 8 | Aesthetic and Minimalist Design | 3 | Strong type system; uppercase-mono labels dense; Spotlight dominates |
| 9 | Error Recovery | 3 | Genuine empty states ("Tidak ada karya yang cocok") |
| 10 | Help and Documentation | 2 | No guidance/tooltips for the Seeker, the priority persona |
| **Total** | | **28/40** | **Good (low end)** |

## Anti-Patterns Verdict

Does this look AI-generated? No. Distinctive three-way type pairing (Instrument Serif display + Plus Jakarta Sans body + IBM Plex Mono meta), committed terracotta-on-gallery-white, deliberate mono "spec voice" for metadata. Passes product slop test. Serif correctly scoped to titles/headings only, never labels/buttons/data.

Deterministic scan: detect.mjs on src/mockups/MockupB.tsx returned [] (clean, exit 0). No gradient text, no numbered markers, no eyebrow reflex flagged. Two hand-noted items the static scan missed:
- Side-stripe borders (brushes absolute ban): borderLeft 2px solid accent on active nav item (line 288) and active filter row (line 981). Read as legitimate active-nav indicators; filter-row closer to the line. P3.
- Uppercase-mono label density: section eyebrows everywhere + "Al-Fath" eyebrow above "Berkarya" wordmark. Coherent system but heavy. P2.

No live browser overlay injected this run (dev server stopped); deterministic layer is the CLI scan plus prior-session visual verification.

## Overall Impression
Craft is genuinely good — looks designed, brand voice intact. Biggest issue is strategic fit, not visuals: the surface is built as a ranked, upvoted, weekly-competition leaderboard (medals, rank deltas, upvote counts), in direct tension with the product's "productive, not addictive" north star.

## What's Working
1. The type system carries real identity. Instrument Serif headlines + IBM Plex Mono meta is high-contrast pairing done right; serif = warmth/humanity, mono = builder/spec feel.
2. Authentic code-switched Indonesian throughout. Reads student-made and sincere, not translated SaaS.
3. Real empty states in both views, with helpful copy.

## Priority Issues

[P1] The Launchpad is a gamified leaderboard, contradicting "productive, not addictive."
- Why: PRODUCT.md names brainrot/ranking/engagement-bait as anti-reference; Principle 3 forbids ranking. Surface ranks karya #1-#7 with podium medals, weekly rank deltas, foregrounded upvotes. For the Seeker (priority persona, should feel invited/unpressured), a competitive scoreboard is intimidating. Mechanic optimizes for behavior the product rejects.
- Fix: Decide if ranking is in or out. If weekly framing stays, shift competition -> curation: drop medals/numeric rank/delta arrows, keep "Pilihan Minggu Ini" + curated/chronological list, demote upvotes to a quiet appreciation count. Lead with discovery over leaderboard.
- Command: /impeccable shape -> /impeccable quieter

[P1] Muted-grey text fails WCAG AA — the exact failure PRODUCT.md predicted.
- Why: --ink3 oklch(64% 0 0) ~3.5:1 on white, under 4.5:1, used heavily for 9-11px text (handles, "{n} karya", "Tkt 3", stage labels, "geser" hint, every eyebrow). PRODUCT.md commits to WCAG 2.1 AA and flags this ramp as most likely failure point.
- Fix: Darken ink3 to ~oklch(52% 0 0) (~4.5:1) for text; keep lighter value only for non-text decoration. Verify 9px skill micro-tags.
- Command: /impeccable audit

[P1] Nav isn't keyboard-accessible and icons don't communicate.
- Why: Nav items are div-onClick (line 272) — not focusable, not Enter-activatable, invisible to screen readers (fails Sam persona + stated keyboard/focus commitment). Glyphs are abstract; labels save them but add noise.
- Fix: Real button/a elements with focus-visible rings; focus states on filters, tabs, upvote. Swap glyphs for recognizable icons or drop them.
- Command: /impeccable audit

[P2] Two redundant featured treatments + mixed component vocabulary.
- Why: Spotlight shows accent band "Pilihan Minggu Ini" and KaryaCard carries clipPath ribbon with same text (line 364). Featured item only renders as Spotlight today (filtered out of card list), so ribbon is dead/duplicate path. Same theme as nav-div vs filter-button.
- Fix: Pick one featured treatment; remove card ribbon or gate against co-occurrence.
- Command: /impeccable distill

## Persona Red Flags
- The Seeker (project, top priority): lands on a #1-#7 leaderboard with medals/deltas, reads as "who's winning" not "where to start." No low-pressure on-ramp; onboarding agent absent from first surface.
- Sam (accessibility): can't reach left nav by keyboard; no visible focus states; ink3 meta under 4.5:1; verify active cues aren't color-alone.
- Jordan (first-timer): labels clear, but icon glyphs teach nothing and no help/tooltip at decision points.

## Minor Observations
- Avatar hue hashing uses first char only — "Arief"/"Aldi" collide. Hash full string.
- Spotlight is tall, pushes ranked list below fold — confirm the list still feels like the point.
- weeklyDelta data model simplifies if ranking goes.
