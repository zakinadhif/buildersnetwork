# Milestone: Launchpad — app shell + home

*Part of the [Roadmap](../roadmap.md). Requirements: [requirements.md](../reference/requirements.md) · Vision: [vision.md](../vision.md). Non-authoritative working knowledge — trust the code when they diverge.*

**Tasks & status:** on GitHub once groomed. This doc holds only the why, the decisions, and the exit — never the task list.

## Why

The app's primary surface and navigation frame. Adopt the **Launchpad** direction (`apps/mockups/src/screens/Launchpad.tsx`): a calm, curated, reverse-chronological discovery home — **no ranking, no leaderboard** (FR-22) — inside a **persistent left-sidebar shell**. It goes first because it's the frame every later surface slots into: Matchmaking's "Cari Kolaborator" tab, "Karya Saya", etc. all live in this sidebar.

## Scope

- **App shell with a persistent left sidebar** (the mockup's `bn-nav` rail), replacing today's standalone route-pages. Nav items: **Launchpad** (home feed), **Jelajahi Karya** (browse), **Cari Kolaborator** (placeholder until the Matchmaking milestone), **Minat Saya**, **Karya Saya**, plus an **AI assistant tab** (see below).
- **Launchpad home**: elevate the current `CommunityHome` (featured + feed) into the Launchpad-mockup treatment — curated "Top picked" + calm reverse-chron feed. No ranking chrome. Per [content-model.md](../reference/content-model.md) the feed carries **events** (karya update posts) that link back to karya **pages** — it renders update teasers, not pages inline.
- **Onboarding made optional** (see decisions): remove the profile gate; move the AI onboarding chat to its own sidebar tab.

## Decisions

- **Onboarding stops being obligatory.** *(Landed.)* `App.tsx` used to redirect every profile-less user to `/onboarding` — a wall. Instead, a new user enters straight into the shell with a **minimal profile** and enriches it later; the mechanism, left open at grooming, settled as a **quick manual form** — `/mulai`, a one-field start. The **AI chat became an always-available sidebar tab** (`/assistant`), a tool not a gate. FR-6 keeps the agent; this only changed that it's opt-in. Current screens and routes: [user-flow.md](../reference/user-flow.md).
- **Launchpad direction is settled** (the `apps/mockups` Launchpad screen) — not an open exploration. The calm-curated-feed bet is chosen; ranking/leaderboards stay out.
- **Matchmaking content is the *next* milestone.** The "Cari Kolaborator" nav item can ship as a placeholder/disabled tab here and light up in [Matchmaking](matchmaking.md).
- **Mockup fidelity is enforced by one token source, not by discipline.** Adopting the Launchpad treatment (above) only means something if the app *measurably* matches it — and the first port didn't: the palette carried over exactly, but the typography drifted. The app had grown 18 font sizes against the mockup's deliberate 8-step scale, ten line-heights against three, and four mutually inconsistent eyebrow definitions; a `body { font-size: 15px }` base silently inflated anything that didn't declare its own size. Prod read as a cheaper version of the design. The cause was structural — mockups and app each held their **own copy** of the tokens (`apps/mockups/src/lib/tokens.ts` vs a `:root` block in `apps/app/src/index.css`), so drift was free and invisible. The fix, therefore, is not a cleanup but an invariant: **a single shared `libs/design-tokens` (`@myapp/design-tokens`) holds the `@theme` scale — colors, type, spacing — and both apps consume it; neither declares tokens of its own.** Where the two disagree, the mockup wins and the app conforms. Scale-breaking values aren't forbidden, but they must be justified in a comment or promoted into the scale — never kept silently, which is how the drift started.

## Exit

A new user signs up and lands on the Launchpad home inside the sidebar shell **without being forced through the AI chat**; the AI assistant is reachable as a sidebar tab; the home renders the curated feed; the existing nav destinations (Jelajahi, Minat Saya, Karya Saya) are reachable from the rail.
