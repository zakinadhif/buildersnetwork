# Milestone: Launchpad — app shell + home

*Part of the [Roadmap](../roadmap.md). Requirements: [requirements.md](../reference/requirements.md) · Vision: [vision.md](../vision.md). Non-authoritative working knowledge — trust the code when they diverge.*

**Tasks & status:** on GitHub once groomed. This doc holds only the why, the decisions, and the exit — never the task list.

## Why

The app's primary surface and navigation frame. Adopt the current **Scroll** direction (`apps/mockups/src/screens/Scroll.tsx`): a calm, reverse-chronological karya-update home — **no ranking, no leaderboard** (FR-22) — inside a **persistent left-sidebar shell**. The milestone keeps the name *Launchpad*, but its former `Launchpad.tsx` reference was replaced by the gallery's current three-surface frame (`Scroll`, `Karya`, `People`).

## Scope

- **App shell with a persistent left sidebar**, replacing standalone route-pages. Its live destinations match the current mockup rail: **Scroll** (the home feed), **Karya** (catalogue), and **People** (builder directory). `Cari Kolaborator`, `Minat Saya`, `Karya Saya`, and the exploratory **AI assistant** are retired from this rail for P0; Matchmaking and the assistant stay later work.
- **Scroll home**: replace the former curated "Top picked" home with the `Scroll` mockup treatment: calm reverse-chron karya updates. Per [content-model.md](../reference/content-model.md) the feed carries **events** that link back to karya **pages** — it renders update teasers, not pages inline.
- **Primary funnels from the three core surfaces**: Scroll and Karya lead into a functional karya detail route (`/karya/:id`) and direct manual creation (`/karya/new`); Scroll and People lead into a functional member profile route (`/member/:id`). These are hero paths, not route stubs: their implemented states use the shared design system and follow the current mockups.
- **Onboarding is direct and manual** (see decisions): `/mulai` collects the profile fields needed for a useful member profile. Conversational onboarding is retired from P0.

## Decisions

- **Onboarding is a bounded profile form.** `App.tsx` used to redirect every profile-less user to `/onboarding` — a conversational wall. The Launchpad entry flow instead uses `/mulai` to collect the member's name, handle, campus context, skills, interests, and optional photo directly before entering the shell. The consolidated action-capable AI chat is preserved as a retired P1 exploration, not a P0 route or navigation destination. Current implementation routes may lag this approved direction; they remain inventoried in [user-flow.md](../reference/user-flow.md).
- **Launchpad direction is settled** in the gallery's active `Scroll`, `Karya`, and `People` screens — not the retired `Launchpad`, `Cari Kolaborator`, or `Minat Saya` screens. The calm karya-update feed is chosen; ranking/leaderboards stay out.
- **The Launchpad closure bar includes the primary funnels.** It covers the literal entry path (`/welcome` → `/verify-email` → `/mulai` → Scroll), the persistent three-destination shell, the Scroll surface, and the core transitions from Scroll/Karya into karya detail and creation plus Scroll/People into member profiles. `/karya/:id`, the direct manual `/karya/new`, and `/member/:id` must be functional, grounded in their current mockups, built from the shared design system, and polished as hero edges rather than merely reachable. The retired AI assistant is outside the closure gate.
- **Mockup affordances do not silently promote roadmap scope.** The current gallery's composer, comments, and appreciation affordances are design input for their owning roadmap work (feedback loop and P1 richness); they are not required functional deliverables of Launchpad.
- **Matchmaking content remains a later milestone.** It is absent from the primary rail until [Matchmaking](matchmaking.md) earns implementation.
- **Mockup fidelity is enforced by one token source, not by discipline.** Adopting the Launchpad treatment (above) only means something if the app *measurably* matches it — and the first port didn't: the palette carried over exactly, but the typography drifted. The app had grown 18 font sizes against the mockup's deliberate 8-step scale, ten line-heights against three, and four mutually inconsistent eyebrow definitions; a `body { font-size: 15px }` base silently inflated anything that didn't declare its own size. Prod read as a cheaper version of the design. The cause was structural — mockups and app each held their **own copy** of the tokens (`apps/mockups/src/lib/tokens.ts` vs a `:root` block in `apps/app/src/index.css`), so drift was free and invisible. The fix, therefore, is not a cleanup but an invariant: **a single shared `libs/design-tokens` (`@myapp/design-tokens`) holds the `@theme` scale — colors, type, spacing — and both apps consume it; neither declares tokens of its own.** Where the two disagree, the mockup wins and the app conforms. Scale-breaking values aren't forbidden, but they must be justified in a comment or promoted into the scale — never kept silently, which is how the drift started.

## Exit

A new user signs up, completes the direct `/mulai` profile form, and lands on Scroll inside the persistent `Scroll` / `Karya` / `People` sidebar shell; Scroll renders the reverse-chronological karya-update feed; and the primary paths into `/karya/:id`, manual `/karya/new`, and `/member/:id` are functional, mockup-grounded, use the shared design system, and cover their meaningful loading, empty, error, and success states. The AI assistant remains retired until P1.
