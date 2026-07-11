# Milestone: Launchpad — app shell + home

*Part of the [Roadmap](../roadmap.md). PRD: [al-fath-berkarya-prd.md](../al-fath-berkarya-prd.md) · Vision: [al-fath-berkarya-vision.md](../al-fath-berkarya-vision.md). Non-authoritative working knowledge — trust the code when they diverge.*

**Tasks & status:** on GitHub once groomed. This doc holds only the why, the decisions, and the exit — never the task list.

## Why

The app's primary surface and navigation frame. Adopt the **Launchpad** direction (`apps/mockups/src/screens/Launchpad.tsx`): a calm, curated, reverse-chronological discovery home — **no ranking, no leaderboard** (FR-22) — inside a **persistent left-sidebar shell**. It goes first because it's the frame every later surface slots into: Matchmaking's "Cari Kolaborator" tab, "Karya Saya", etc. all live in this sidebar.

## Scope

- **App shell with a persistent left sidebar** (the mockup's `bn-nav` rail), replacing today's standalone route-pages. Nav items: **Launchpad** (home feed), **Jelajahi Karya** (browse), **Cari Kolaborator** (placeholder until the Matchmaking milestone), **Minat Saya**, **Karya Saya**, plus an **AI assistant tab** (see below).
- **Launchpad home**: elevate the current `CommunityHome` (featured + feed) into the Launchpad-mockup treatment — curated "Top picked" + calm reverse-chron feed. No ranking chrome. Per [content-model.md](../content-model.md) the feed carries **events** (karya update posts) that link back to karya **pages** — it renders update teasers, not pages inline.
- **Onboarding made optional** (see decisions): remove the profile gate; move the AI onboarding chat to its own sidebar tab.

## Decisions

- **Onboarding stops being obligatory.** Today `App.tsx` redirects every profile-less user to `/onboarding` — a wall. Instead, a new user enters straight into the shell with a **minimal profile** (mechanism — auto-stub vs. quick manual form — settled at grooming) and enriches it later. The **AI chat becomes an always-available sidebar tab**, a tool not a gate. PRD FR-6 keeps the agent; this only changes that it's opt-in. This is an intentional deviation from the current gated flow.
- **Launchpad direction is settled** (the `apps/mockups` Launchpad screen) — not an open exploration. The calm-curated-feed bet is chosen; ranking/leaderboards stay out.
- **Matchmaking content is the *next* milestone.** The "Cari Kolaborator" nav item can ship as a placeholder/disabled tab here and light up in [Matchmaking](matchmaking.md).

## Exit

A new user signs up and lands on the Launchpad home inside the sidebar shell **without being forced through the AI chat**; the AI assistant is reachable as a sidebar tab; the home renders the curated feed; the existing nav destinations (Jelajahi, Minat Saya, Karya Saya) are reachable from the rail.
