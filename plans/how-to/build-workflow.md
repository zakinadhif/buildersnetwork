# How we build — the workflow

*How work is defined, discussed, claimed, built, and merged. Written for both humans and their coding agents — `.agents/skills/` is canonical, and `pnpm sync:agent-config` generates the Claude Code equivalents.*

## The three units

| Unit | Criterion | Lives in |
|---|---|---|
| **Milestone** | One human judgment: one grooming decision + one testable exit criterion. Done when the exit passes. Carries a **target date** as a planning aim (a countdown in `/project-status`), but the date is an *aim, not a gate* — closure is still exit-driven, never date-driven. | Half-page doc in `plans/milestones/` (the why, decisions, exit) + a GitHub Milestone grouping its tasks (its `due_on` holds the target date) |
| **Task** | One agent session: completable cold from the issue body + the repo, producing **one PR** for **one shippable deliverable** — usually a *vertical* slice (migration + API + wired UI, as the feature needs), not a single layer. | A GitHub Issue — acceptance criteria, boundary (touch / don't touch), dependencies, out-of-scope |
| **Queue** | Continuous pull — no cycles, no assignments handed down. You claim; nobody assigns you. | The [project board](https://github.com/users/zakinadhif/projects/8) Status field |

**One fact, one home.** Docs in git hold *intent* (why, decisions, exit). Issues hold the *contract* (what done means). The board holds *state* (who, what stage). Never write status into `plans/` files — that's how docs rot.

## Issue title tags

Every issue title opens with a bracket tag — the "what is this?" signal that shows in `gh issue list` and `/project-status`, where labels stay hidden. Tags split into two groups by whether the work touches **what or why we build**.

**Strategic** — shapes the product. Must clear the [issue-creation gate](#the-issue-creation-gate) before it's filed:

| Tag | Means | Claimable? |
|---|---|---|
| **`[Diskusi]`** | A question to decide *before* building — a decision to make, an open exploration, vision input. Board = **Proposed**. | No — discuss, don't pick. |
| **`[Fitur]`** | A shippable deliverable: one agent session, one PR, built **vertically** (migration + API + wired UI as the feature needs). The default for build work. | Yes. |
| **`[Desain]`** | A design *approach* built to be reviewed before it's locked in — mockups, directions, visual options (see [parallel-ui-exploration](parallel-ui-exploration.md)). A design *decision*, not the feature's UI layer: it **grounds** a later `[Fitur]`, it doesn't become one. | Yes — to explore; the chosen mockup then grounds a **sibling** `[Fitur]` via Gate B. |

**Non-strategic** — keeps the product healthy without changing *what* we build. **Skips the gate**, filed directly:

| Tag | Means | Claimable? |
|---|---|---|
| **`[Bug]`** | A reproducible defect to fix — the reactive lane. Needs a repro and a regression test. | Yes. |
| **`[Security]`** | A security *hardening* task — proactive posture work where nothing is yet broken (audit, add guards, tighten config). | Yes. |

A **security bug** — a reproducible vulnerability with a fix — rides the **`[Bug]`** lane, not `[Security]`; it's a defect like any other. Flag it with a `security` label if disclosure sensitivity matters. `[Security]` is only for hardening where there's no specific defect. Tie-breaker: *is there a reproducible defect?* Yes → `[Bug]`; no → `[Security]`.

**Title shape:** `[Tag] <Area>: <brief>`. `<Area>` is the feature or milestone (e.g. `Launchpad`), so the grouping shows up in `gh issue list` where the Milestone field doesn't. `[Fitur]` covers any shippable deliverable in service of a feature — **building new or reshaping existing**.

We tag by **deliverable, not by module.** A real feature cuts through `libs/db` → `apps/api` → `apps/app` in one slice, so a `[DB]`/`[API]`/UI-per-layer split would only manufacture dependencies and half-landed entities. The one worthwhile break-out is **design** — a `[Desain]` exploration, for a review reason (seeing options before committing), not a module reason. And it's a *precursor*, not a slice of the feature: it grounds the `[Fitur]`, it isn't a piece carved off it. Titles stay in Bahasa Indonesia.

## The issue-creation gate

Before a **strategic** issue is filed, it clears this gate. Its job is to stop two failures we've actually hit: a `[Fitur]` that no vision/requirements/milestone ever asked for, and a `[Fitur]` for a screen nobody has drawn yet. An agent may **warn and recommend** at each gate — it may **never** self-override. Only the maintainer overrides a gate, on their own explicit insistence.

**Step 0 — strategic or not?**

- **Non-strategic** (`[Bug]`, `[Security]`, chores, docs) → file directly, skip the gate. These fix or harden what exists; they don't change what we build.
- **Strategic** (`[Diskusi]` / `[Fitur]` / `[Desain]`) → clear Gate A using the appropriate grounding test below. Gate B is `[Fitur]`-only (a `[Diskusi]` is a question, a `[Desain]` *is* the mockup — neither needs one).

**Gate A — grounding, by issue type.**

- **`[Diskusi]` — reality-grounded.** Cite the current code, documentation, supplied user feedback, or observed tension being questioned, and name the decision boundary. A discussion may challenge the Vision, requirements, roadmap, or milestone; its proposed direction does **not** need to be pre-approved. If there is not yet a concrete decision question, keep the input in the pinned Visi & Roadmap issue #12 rather than manufacturing a standalone issue.
- **`[Fitur]` / `[Desain]` — decision-grounded.** The [Vision](../vision.md), [requirements catalog](../reference/requirements.md), an active [milestone doc](../milestones/), a ratified decision, or the active documentation PR produced by `/ratify` must actually call for the work. Work grounded only by that open PR stays Backlog until it merges. Cite *where* in `## Kenapa`, then continue to Gate B.
- **Build work outside those boundaries** → **stop and warn.** Open a `[Diskusi]` in **Proposed** to decide the direction first (see [the ratification gate](#the-ratification-gate-vision--requirements--roadmap-changes)); do not manufacture build work for undecided scope. File it only if the maintainer explicitly insists, recorded as an ungrounded exception.

**Gate B — Approved Reference mockup.** Only for a **non-trivial** user-facing surface.

- **An `Approved Reference` mockup for this surface exists in `apps/mockups/`** → file the `[Fitur]`, cite the mockup and its `groundedBy` issue in `## Kenapa`. Its `scopeNote` and `excludes` define which visible parts actually ground the feature; the scope and schema follow that approved slice, not every future-facing control on the screen.
- **No mockup yet, or the gallery marks it `Exploration` / `In Review`** → **don't groom a `[Fitur]` from a surface that is still moving.** File a `[Desain]` exploration first (or point at the one that should be completed); the feature's contract — scope, schema — is written only *after* the design becomes an `Approved Reference`. (In a ratification the feature can sit meanwhile as an ungroomed **Backlog** stub under the `[Diskusi]` — see [the ratification gate](#the-ratification-gate-vision--requirements--roadmap-changes).)
- **Trivial surface** (a settings toggle, a copy tweak) **or no surface at all** (pure backend/infra) → Gate B is N/A; file the `[Fitur]`.

## Scope treatments — how much a feature gets *right now*

Priority (**P0 / P1**, set in the [roadmap](../roadmap.md)) says how much a feature *matters*. It does **not** say how finished it should be in the build we're shipping this week. That's a second, independent axis — the **treatment** — and naming it lets us shrink scope ruthlessly without lying about a feature's importance.

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

- **Backlog** — the holding pool: accepted work that isn't on the Ready shortlist — **ungroomed** items and **groomed-but-unprioritized** ones, mixed. Claimable *only if* an item is groomed and unblocked, so read the issue before pulling one — it isn't the pre-vetted queue Ready is. Non-urgent `[Bug]`/`[Security]`, parked tasks, and ratification `[Fitur]` stubs awaiting their `[Desain]` live here too.
- **Proposed** — under discussion; **do not pick**. Vision/requirements/roadmap-touching questions live here (see gate below).
- **Ready** — the maintainer's curated next-up, kept short (**around 6**) so it stays a real priority signal — a soft target, not a hard limit. Unblocked, groomed, claimable by anyone; if it's getting long, park the rest in Backlog.
- **Blocked** — **not workable right now**, for either reason: an open native GitHub **Blocked by** relationship, *or* a blocker hit **mid-task**. Set at grooming (planned dependency) or from In Progress (a builder got stuck) — leave a comment saying what's stuck. GitHub's dependency icon makes planned blockers visible, while the board Status remains the queue state. Returns to Ready / In Progress when cleared. **Doesn't count** against your one-in-progress limit.
- **In Progress** — claimed (assignee set), building. One per person — though a Blocked task doesn't count, so you can pull another while it clears.
- **In Review** — PR open, linked with `Closes #N`.
- **Done** — merged.

## Executable workflow

The project identity and board option IDs live in `scripts/workflow-config.mjs`. Do not copy them into skills or prose. Deterministic transitions go through `pnpm workflow`, which inspects current state first and skips steps already completed. If a network or permission failure leaves a transition half-done, rerun the same command; it resumes from observable Git, issue, PR, and board state instead of duplicating work.

Task dependencies use GitHub's native issue relationships, managed with `gh issue create --blocked-by <issue>` or `gh issue edit <issue> --add-blocked-by <issue>`. They are the source of truth for sequencing; do not duplicate the edge as `Depends on #N` in the issue body. The body may explain *why* the sequencing exists when that is not already obvious from scope. Native dependency state and the Project Status are deliberately separate: an open blocker prevents Ready/claim, but closing the final blocker only makes the task eligible for maintainer curation—it does not auto-promote the task into the short Ready queue. This requires GitHub CLI 2.94.0 or newer.

| Command | Responsibility |
|---|---|
| `pnpm workflow doctor <issue>` | Read-only diagnosis across issue, dependencies, board, local task branches, and PRs. |
| `pnpm workflow place <issue> <Backlog\|Proposed\|Ready\|Blocked>` | Add a newly filed issue to the board or repair its initial Status. Ready enforces maintainer authority, grooming, and closed dependencies. |
| `pnpm workflow claim <issue>` | Verify claimability, assignment, dependencies, one-task limit, and a clean worktree; assign, create/resume the task branch, then set In Progress. |
| `pnpm workflow ship [issue] --verified --summary "<reviewer summary>"` | After the skill verifies the contract and tests, push, create/reuse a closing PR, then set In Review. |
| `pnpm workflow reconcile <issue>` | After merge, prove the closing PR and closed issue, repair Done, and report dependents or design waiters needing maintainer action. |
| `pnpm workflow link-subissue <parent> <child>` | Idempotently create the one sanctioned `[Diskusi]` → spawned-task relationship. |

Mutation commands accept `--dry-run`. `claim` accepts `--allow-second`, but only after explicit user approval; the default enforces one In Progress item per person. There is intentionally no arbitrary “set status” command: each transition carries its own guards. `ship --verified` records that the caller completed acceptance and validation checks; it does not replace them.

Board access needs the project scope once: `gh auth refresh -s project,read:project`.

## Who curates — the one authority rule

**Creation is open; curation is gated.** The Queue is continuous pull (you claim, nobody assigns), and the same openness applies to filing work — but not to prioritizing it.

- **Anyone** (contributor or maintainer, human or agent) may: file an issue; land it in **Backlog** or **Proposed**; file `[Bug]`/`[Security]` directly; claim a **Ready** task (or a **Backlog** one they've checked is groomed + unblocked); build; and open a PR.
- **Only the maintainer** (@zakinadhif) may: flip anything into **Ready** (the curated ~6 shortlist); ratify a `[Diskusi]` (`/ratify`); and merge.

So a contributor's *strategic* work waits in **Proposed** for ratification and their overflow sits in **Backlog** — never self-served into Ready. This keeps Ready a real, single-owner priority signal without gatekeeping *who can contribute* — the bar is only on *what gets called next-up*.

## Starting a discussion — the developer's mouthpiece

`/open-discussion` turns a developer's rough observation, concern, or question into a decision-ready draft without requiring them to arrive with product language. The agent inspects the repository first, asks only for meaning that evidence cannot supply, and separates verified observations from interpretation, preference, and assumptions. It **articulates; it does not decide**.

Use this structure for standalone `[Diskusi]` issues:

```markdown
## Konteks

## Yang diamati

## Mengapa ini penting

## Pertanyaan keputusan

## Opsi dan trade-off

## Batas keputusan

## Bukti terkait
```

The body frames one answerable decision question. Options suggested by the agent are labeled as suggestions, not attributed to the developer. Implementation scope and acceptance criteria belong to the tasks created after ratification, not to the discussion.

A request to **draft, articulate, explore, or review** produces text only. A request to **open, create, file, or publish the discussion** authorizes creating the issue and placing it in Proposed; if the agent would need to materially infer the developer's stance, it shows the draft and asks for confirmation first. Broad direction talk without a concrete decision question stays in pinned issue #12.

```
rough thought → /open-discussion → [Diskusi] Proposed → decision → /ratify → /new-task → /pick-task → build → /ship-task
```

## The ratification gate (vision / requirements / roadmap changes)

Broad, open-ended direction talk (vision, ideas, sequencing debates, non-technical input) lives in the pinned [🧭 Visi & Roadmap issue (#12)](https://github.com/zakinadhif/buildersnetwork/issues/12) — always open, for everyone. When a discussion there crystallizes into a concrete change to *what we're building* — a new or amended requirement, a roadmap re-ordering, a milestone scope change, a design divergence — it becomes its own `[Diskusi]` issue in **Proposed** and is decided in that thread. Once decided, the maintainer runs `/ratify`, which drives these three steps:

1. **Write the decision down** where it durably belongs — a PR amending the vision / roadmap / requirements / milestone doc in `plans/`, whichever rung of the [precedence ladder](../README.md) owns it (docs are code: decisions merge via diff). Put `Closes #N` in the PR body. The discussion remains open and Proposed while the PR is under review; merging the documentation is the atomic ratification event and closes the discussion automatically.
2. **Decompose — design first, then the features it grounds.** A feature's scope and schema follow from its UI, so the design leads. For each non-trivial surface the decision introduces, file its **`[Desain]`** exploration. File each `[Fitur]` the design will feed **now too, but as an ungroomed stub** (body just a `## Kenapa` citing the doc PR + *"menunggu desain #N"*), and link all of them — designs and stubs alike — as **sub-issues** of the `[Diskusi]`. Keep every spawned item in **Backlog while the documentation PR is open**: the proposed document is not durable grounding until it merges. After merge, the maintainer may curate immediately buildable `[Desain]` and backend-only `[Fitur]` items into Ready; UI feature stubs stay Backlog until their design lands and they are groomed from the merged mockup. The design→feature link is a *grooming* dependency, not a native **Blocked by** relationship, so nothing auto-promotes it.
3. **Link without closing early.** Comment on the `[Diskusi]` with the documentation PR and spawned issues, but do not close it directly. The PR merge closes it through `Closes #N`; leave its board item unarchived as the durable record of why those tasks exist.

Never start building from a Proposed item.

## Sub-issues — one sanctioned use

GitHub's **sub-issues** give a parent issue a live checklist of children and a progress bar. We use them for **exactly one thing**: linking a ratified `[Diskusi]` to the tasks it spawned. Because a ratified `[Diskusi]` stays on the board as the durable *why* record, making its tasks sub-issues turns that record **live** — it shows how much of the decided direction has actually shipped (e.g. "3 of 5 done"), and the link is structural and bidirectional instead of a closing comment that rots. `/ratify` wires this automatically; the project's "Auto-add sub-issues" workflow lands the children on the board.

**Do not use sub-issues to decompose a feature by module.** Giving a `[Fitur]` a DB / API / UI set of sub-issues is [module-splitting](#issue-title-tags) under a new name — it manufactures dependencies and half-landed layers, exactly what *"tag by deliverable, not module"* forbids. A `[Fitur]` stays **one vertical slice**. Real dependencies between separate deliverables use GitHub's native **Blocked by** relationship; grouping a set of tasks under a theme stays the **GitHub Milestone**. Parent/child is reserved for the diskusi → spawned-tasks relationship, nothing else.

## The loop (human + agent)

Contributor setup, once: clone, `pnpm install`, `gh auth login`, then `gh auth refresh -s project,read:project` (board access). `/setup-project` walks through and verifies the complete local setup. Claude Code picks up the repo skills automatically.

1. **`/project-status`** — where we are: the active phase & bet, each milestone's progress and target-date countdown, then today's board (Ready, who's on what, what's in review). No website needed.
2. **`/pick-task`** — claim a Ready task: after interpreting the issue, it runs `pnpm workflow claim`, which assigns you, creates or resumes the branch, and moves the item to In Progress.
3. Build. Stay inside the issue's **Boundary**. If you hit a blocker you can't clear in-session — or the task turns out bigger than one session — move the card to **Blocked**, comment what's stuck, and stop instead of sprawling.
4. **`/ship-task`** — re-check the contract and validation, then run `pnpm workflow ship --verified --summary "<reviewer summary>"`; the PR opens with `Closes #N` and the board moves to In Review.
5. Maintainer reviews and merges. Run `pnpm workflow reconcile <issue>` to repair Done and surface dependents; only the maintainer curates them into Ready (or Backlog if Ready is already long).

**The two status views.** `/project-status` reads the **plan** side — the board and the GitHub milestones, i.e. what we *believe* is true. **`/code-status <milestone>`** reads the **code** side: it takes one milestone doc's Scope, Decisions, and Exit as the target and audits the repo against them, classifying each item Done / Partial / Missing / **Divergent** with file-path evidence. Since every doc in `plans/` is non-authoritative — *trust the code when they diverge* — this is how a divergence gets **detected** rather than assumed away, and it's the honest read on whether a milestone's exit actually passes (an issue count says only that the board is tidy). It's read-only: it proposes tasks for the gaps and hands them to `/new-task` on your say-so, but files nothing itself.

**Limits.** Keep **Ready short — around 6** — a curated shortlist, not a dumping ground; park the rest in **Backlog**. It's a **soft cap**: set it as the Ready column's limit in the board view (**UI only** — GitHub has no API for it), where it just shows a warning when exceeded — nothing blocks. Separately, **review is the bottleneck**: if 3+ PRs are already In Review, prefer helping review over claiming another task.

## Grooming (maintainer)

Groom one milestone at a time, straight into issues — the doc never carries a task list. **Issues (title + body) are written in Bahasa Indonesia** — the team's language; keep code identifiers, file paths, and FR/NFR codes as-is:

1. Write the half-page milestone doc (why, decisions, exit) in `plans/milestones/`.
2. Create the GitHub Milestone; decompose into session-sized issues, each a **vertical deliverable** (`[Fitur]`) — split further only when one won't fit a session, or when a **design** approach needs review before locking (`[Desain]`). Grooming from a milestone doc clears Gate A by construction, but **Gate B still holds**: a `[Fitur]` with a non-trivial surface needs a `[Desain]` mockup first — draw the design before the build issue and let the feature's schema follow the UI. Record sequencing explicitly with native GitHub **Blocked by** relationships.
3. Anything contentious becomes a **Proposed** issue instead of a task.
4. Unblocked + uncontentious tasks start **Ready** (keep it to ~6) — the rest start **Backlog** (still claimable, just uncurated); dependent ones start **Blocked**.

When the milestone's exit criterion passes: close the GitHub Milestone, distill anything worth keeping into `plans/archive/retro.txt`.
