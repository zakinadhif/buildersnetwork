# How we build — the workflow

*How work is defined, discussed, claimed, built, and merged. Written for both humans and their coding agents — the `.claude/skills/` in this repo encode the routine parts of this document.*

## The three units

| Unit | Criterion | Lives in |
|---|---|---|
| **Milestone** | One human judgment: one grooming decision + one testable exit criterion. Done when the exit passes — no time-box. | Half-page doc in `plans/milestones/` (the why, decisions, exit) + a GitHub Milestone grouping its tasks |
| **Task** | One agent session: completable cold from the issue body + the repo, producing **one PR** for **one shippable deliverable** — usually a *vertical* slice (migration + API + wired UI, as the feature needs), not a single layer. | A GitHub Issue — acceptance criteria, boundary (touch / don't touch), dependencies, out-of-scope |
| **Queue** | Continuous pull — no cycles, no assignments handed down. You claim; nobody assigns you. | The [project board](https://github.com/users/zakinadhif/projects/8) Status field |

**One fact, one home.** Docs in git hold *intent* (why, decisions, exit). Issues hold the *contract* (what done means). The board holds *state* (who, what stage). Never write status into `plans/` files — that's how docs rot.

## Issue title tags

Every issue title opens with a bracket tag — the "what is this?" signal that shows in `gh issue list` and `/board`, where labels stay hidden. Tags split into two groups by whether the work touches **what or why we build**.

**Strategic** — shapes the product. Must clear the [issue-creation gate](#the-issue-creation-gate) before it's filed:

| Tag | Means | Claimable? |
|---|---|---|
| **`[Diskusi]`** | A question to decide *before* building — proposal, open exploration, vision input. Board = **Proposed**. | No — discuss, don't pick. |
| **`[Fitur]`** | A shippable deliverable: one agent session, one PR, built **vertically** (migration + API + wired UI as the feature needs). The default for build work. | Yes. |
| **`[UI]`** | A UI *approach* built to be reviewed before it's locked in — mockups, design directions, visual options (see [parallel-ui-exploration](parallel-ui-exploration.md)). | Yes — to explore; the winner then graduates to a `[Fitur]`. |

**Non-strategic** — keeps the product healthy without changing *what* we build. **Skips the gate**, filed directly:

| Tag | Means | Claimable? |
|---|---|---|
| **`[Bug]`** | A reproducible defect to fix — the reactive lane. Needs a repro and a regression test. | Yes. |
| **`[Security]`** | A security *hardening* task — proactive posture work where nothing is yet broken (audit, add guards, tighten config). | Yes. |

A **security bug** — a reproducible vulnerability with a fix — rides the **`[Bug]`** lane, not `[Security]`; it's a defect like any other. Flag it with a `security` label if disclosure sensitivity matters. `[Security]` is only for hardening where there's no specific defect. Tie-breaker: *is there a reproducible defect?* Yes → `[Bug]`; no → `[Security]`.

**Title shape:** `[Tag] <Area>: <brief>`. `<Area>` is the feature or milestone (e.g. `Launchpad`), so the grouping shows up in `gh issue list` where the Milestone field doesn't. `[Fitur]` covers any shippable deliverable in service of a feature — **building new or reshaping existing**.

We tag by **deliverable, not by module.** A real feature cuts through `libs/db` → `apps/api` → `apps/app` in one slice, so a `[DB]`/`[API]`/`[UI]`-per-layer split would only manufacture dependencies and half-landed entities. The one worthwhile break-out is **UI** — for a review reason (seeing options before committing), not a module reason. Titles stay in Bahasa Indonesia; `UI` keeps its English name.

## The issue-creation gate

Before a **strategic** issue is filed, it clears this gate. Its job is to stop two failures we've actually hit: a `[Fitur]` that no vision/PRD/milestone ever asked for, and a `[Fitur]` for a screen nobody has drawn yet. An agent may **warn and recommend** at each gate — it may **never** self-override. Only the maintainer overrides a gate, on their own explicit insistence.

**Step 0 — strategic or not?**

- **Non-strategic** (`[Bug]`, `[Security]`, chores, docs) → file directly, skip the gate. These fix or harden what exists; they don't change what we build.
- **Strategic** (`[Diskusi]` / `[Fitur]` / `[UI]`) → clear both gates below.

**Gate A — grounding.** Does the [Vision](../al-fath-berkarya-vision.md), [PRD](../al-fath-berkarya-prd.md), or an active [milestone doc](../milestones/) actually call for this?

- **Grounded** → cite *where* (the citation goes in `## Kenapa`), continue to Gate B.
- **Outside the boundary of all three** → **stop and warn.** Prefer a `[Diskusi]` in **Proposed** to ratify the direction first (see [the proposal gate](#the-proposal-gate-vision--prd-changes)) — don't manufacture a `[Fitur]` for undecided scope. File build work only if the maintainer insists, recorded in the issue as an ungrounded exception.

**Gate B — mockup.** Only for a **non-trivial** user-facing surface.

- **A graduated `[UI]` mockup exists in `apps/mockups/`** → file the `[Fitur]`, reference the mockup in `## Kenapa`.
- **No mockup yet** → **don't jump to `[Fitur]`.** File a `[UI]` exploration first, or point at the existing one that should graduate.
- **Trivial surface** (a settings toggle, a copy tweak) **or no surface at all** (pure backend/infra) → Gate B is N/A; file the `[Fitur]`.

## Scope treatments — how much a feature gets *right now*

Priority (**P0 / P1**, set in the [PRD](../al-fath-berkarya-prd.md) and [roadmap](../roadmap.md)) says how much a feature *matters*. It does **not** say how finished it should be in the build we're shipping this week. That's a second, independent axis — the **treatment** — and naming it lets us shrink scope ruthlessly without lying about a feature's importance.

| Treatment | Real-world name | What it means | Polish budget? |
|---|---|---|---|
| **Hero** | flagship / focus | Finished to the edges — empty states, loading, error copy, the *feel*. The surface a member touches first and keeps coming back to. | Yes — this is where it all goes. |
| **Dark** | *dark launch* / *walking skeleton* | Shipped and integrated — data model, shell slot, route all present — but the surface is stubbed, flag-gated, or deliberately thin. The scaffold is load-bearing so nothing needs re-architecting later; the polish is skipped **on purpose**. | No. |
| **Deferred** | P1 backlog | Not in the build at all. Named in the roadmap so it isn't forgotten; absent from the app. | No. |

Two ideas worth knowing by name, because they *are* the point of **Dark**:

- **Dark launch** (feature-flag / continuous-delivery practice) — code ships live to production but stays hidden from users behind a flag. You lay the plumbing early and light up the UI later, decoupling *"is it built"* from *"can users see it."*
- **Walking skeleton** (Alistair Cockburn) — a thin end-to-end slice that actually runs and proves the architecture holds, *before* any of it is fleshed out. Real, but minimal.

The failure mode of Dark: a half-lit surface that looks clickable but does nothing reads as **broken**, not *"coming soon."* Dark only works when it's honestly signposted — disabled, *"segera hadir,"* or simply absent from the nav — never present-but-hollow.

A feature carries **both** tags, e.g. *"Launchpad — P0, hero"* or *"Messaging — P1, dark."*

## Board statuses

```
Backlog ┐
        ├─(promote / ratify)─▶ Ready ─(claim)─▶ In Progress ─(PR)─▶ In Review ─(merge)─▶ Done
Proposed┘                                          ⇅
                                                Blocked   ← unmet dependency, or a blocker hit mid-task; back to the queue when cleared
```

- **Backlog** — the holding pool: accepted work that isn't on the Ready shortlist — **ungroomed** items and **groomed-but-unprioritized** ones, mixed. Claimable *only if* an item is groomed and unblocked, so read the issue before pulling one — it isn't the pre-vetted queue Ready is. Non-urgent `[Bug]`/`[Security]` and parked tasks live here too.
- **Proposed** — under discussion; **do not pick**. Vision/PRD-touching questions live here (see gate below).
- **Ready** — the maintainer's curated next-up, kept short (**around 6**) so it stays a real priority signal — a soft target, not a hard limit. Unblocked, groomed, claimable by anyone; if it's getting long, park the rest in Backlog.
- **Blocked** — **not workable right now**, for either reason: an unmet `Depends on #N`, *or* a blocker hit **mid-task**. Set at grooming (planned dependency) or from In Progress (a builder got stuck) — leave a comment saying what's stuck. Returns to Ready / In Progress when cleared. **Doesn't count** against your one-in-progress limit.
- **In Progress** — claimed (assignee set), building. One per person — though a Blocked task doesn't count, so you can pull another while it clears.
- **In Review** — PR open, linked with `Closes #N`.
- **Done** — merged.

## The proposal gate (vision / PRD changes)

Broad, open-ended direction talk (vision, ideas, sequencing debates, non-technical input) lives in the pinned [🧭 Visi & Roadmap issue (#12)](https://github.com/zakinadhif/buildersnetwork/issues/12) — always open, for everyone. When a discussion there crystallizes into a concrete change to *what we're building* — a PRD amendment, a milestone scope change, a design divergence — it graduates to its own issue in **Proposed** and is decided in that thread. Ratification means:

1. The decision is written down where it durably belongs — a PR amending the PRD / vision / milestone doc in `plans/` (docs are code: decisions merge via diff).
2. Affected task issues are created or updated, and flipped **Proposed → Ready** — only the maintainer (@zakinadhif) flips this today.
3. The proposal issue is closed with a comment linking the doc PR.

Never start building from a Proposed item.

## The loop (human + agent)

Contributor setup, once: clone, `pnpm install`, `gh auth login`, then `gh auth refresh -s project,read:project` (board access). Claude Code picks up the repo skills automatically.

1. **`/board`** — see the queue: what's Ready, who's on what, what's in review. No website needed.
2. **`/pick-task`** — claim a Ready task: assigns you, moves it to In Progress, creates a branch, and loads the issue + milestone doc + conventions into your agent's context.
3. Build. Stay inside the issue's **Boundary**. If you hit a blocker you can't clear in-session — or the task turns out bigger than one session — move the card to **Blocked**, comment what's stuck, and stop instead of sprawling.
4. **`/ship-task`** — push, open a PR with `Closes #N`, board moves to In Review.
5. Maintainer reviews (with `/code-review` as second reviewer) and merges → Done; dependents unblock → Ready (or Backlog if Ready is already long).

**Limits.** Keep **Ready short — around 6** — a curated shortlist, not a dumping ground; park the rest in **Backlog**. It's a **soft cap**: set it as the Ready column's limit in the board view (**UI only** — GitHub has no API for it), where it just shows a warning when exceeded — nothing blocks. Separately, **review is the bottleneck**: if 3+ PRs are already In Review, prefer helping review over claiming another task.

## Grooming (maintainer)

Groom one milestone at a time, straight into issues — the doc never carries a task list. **Issues (title + body) are written in Bahasa Indonesia** — the team's language; keep code identifiers, file paths, and FR/NFR codes as-is:

1. Write the half-page milestone doc (why, decisions, exit) in `plans/milestones/`.
2. Create the GitHub Milestone; decompose into session-sized issues, each a **vertical deliverable** (`[Fitur]`) — split further only when one won't fit a session, or when a **UI** approach needs review before locking (`[UI]`). Grooming from a milestone doc clears Gate A by construction, but **Gate B still holds**: a `[Fitur]` with a non-trivial surface needs a graduated mockup first — draw the `[UI]` before the build issue. Dependencies explicit (`Depends on #N`).
3. Anything contentious becomes a **Proposed** issue instead of a task.
4. Unblocked + uncontentious tasks start **Ready** (keep it to ~6) — the rest start **Backlog** (still claimable, just uncurated); dependent ones start **Blocked**.

When the milestone's exit criterion passes: close the GitHub Milestone, distill anything worth keeping into `plans/milestones/retro.txt`.
