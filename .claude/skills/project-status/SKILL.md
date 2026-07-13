---
name: project-status
description: Where the project stands in the grand scheme — the active phase & bet, each milestone's progress and target-date countdown, then today's board state as supporting detail. Use for "where are we", "project status", "milestone status", "how long until X", "are we on track", or "what's on the board".
---

# /project-status — where we are in the grand scheme

Answer "where's the project at?" **top-down**: the **phase & bet** first, then the **milestone ladder** (progress + target-date countdown), then **today's board** as supporting detail. The board columns are the *last* section here, not the first — this view orients you in the roadmap, then zooms into the active milestone.

**One fact, one home** ([workflow](../../../plans/how-to/build-workflow.md)): *intent* — phase, treatment, sequence — comes from [`plans/roadmap.md`](../../../plans/roadmap.md); *live state* — progress, target dates, board status — comes from GitHub. Read both and reconcile; never read status out of the roadmap doc or intent out of the board.

## Gather (run in parallel)

```bash
# live milestone state: progress + target date (include closed milestones)
gh api "repos/zakinadhif/buildersnetwork/milestones?state=all&per_page=100" \
  --jq '.[] | "\(.title)\tclosed=\(.closed_issues)\topen=\(.open_issues)\tdue=\(.due_on)\tstate=\(.state)"'
# board items — for the active-milestone detail + the judgment the website can't do
gh project item-list 8 --owner zakinadhif --format json \
  --jq '.items[] | "\(.status)\t#\(.content.number)\t\(.title)\t[\(.assignees // [] | join(","))]"'
# open PRs — the review-is-bottleneck signal
gh pr list --json number,title,author,isDraft \
  --jq '.[] | "#\(.number)\t\(.title)\t@\(.author.login)\tdraft=\(.isDraft)"'
```

Then read `plans/roadmap.md` for what GitHub doesn't carry: each milestone's **phase** (P0/P1), **treatment** (hero/dark/deferred — see [scope treatments](../../../plans/how-to/build-workflow.md#scope-treatments--how-much-a-feature-gets-right-now)), and **order**.

**Countdowns use the real current date** — compute `days left = due date − today`. If `gh project` fails with a scope error, tell the user to run `gh auth refresh -s project,read:project` once, then retry.

## Render — top-down

### 1. Phase & bet
One or two lines from the roadmap's P0 header: the phase we're in and the current bet (e.g. *"P0 — the ruthless MVP: one hero surface, Launchpad, finished to the edges. Matchmaking + messaging demoted to P1 until real users validate the hero."*). Name the **active** milestone — the one thing in flight.

### 2. Milestone ladder
In roadmap order, one line each:

```
<▶ if active> <name>  (<phase> · <treatment> · <status>)   <progress> · <timing>
```

- **Progress** — `closed/total done (NN%)` from GitHub; `✓ shipped` when 0 open and all closed.
- **Timing** — the point of this view:
  - `due` set → `target <Mon DD> · <N> days left` — or `<N> days over` (past), or `due today`.
  - `due` null → **`⚠ no target date`**. Flag it; a countdown view is only as honest as its dates. (Target dates live in each GitHub milestone's `due_on` — set them with `gh api repos/zakinadhif/buildersnetwork/milestones/<num> -X PATCH -f due_on=2026-08-15T00:00:00Z`.)
- Mark **▶ active**, and flag any milestone that is **all-closed but still `state: open`** → *"exit met — close the GitHub Milestone"* (workflow hygiene: a finished milestone should be closed and distilled into `retro.txt`).

A milestone's **target date is an aim, not a gate** — it still closes when its **exit criterion** passes, per the [workflow](../../../plans/how-to/build-workflow.md). A blown date is a planning signal (surface it), never an auto-close.

### 3. Today's board — active-milestone detail *(supporting)*
The live columns, scoped to what's workable now. For each item: `#N title — @assignee`. Apply the judgment a kanban page can't:

- **Stale-blocked** (the headline catch) — a **Blocked** item whose every `Depends on #N` is now **Done/merged**. Read each blocked issue's body for its `Depends on`; if all deps are closed, flag **`→ unblockable — promote to Ready`**. The website leaves these rotting in Blocked; this view frees them.
- **Board lying** — In Progress with **no assignee**; **In Review** status with **no linked PR**; a **Proposed** item that already has a branch/PR (being built despite "don't pick").
- **WIP guidance** — **Ready** over the ~6 soft cap (park the rest in Backlog); **3+ open PRs** in review → *review beats claiming* (review is the bottleneck).

Skip Done unless asked.

### 4. Next line
One actionable sentence — the highest-leverage move for the reader: promote a stale-blocked item, review a waiting PR, set a missing target date, close a finished milestone, or `/pick-task <N>`.

## Extra asks
- **"how long until `<milestone>`"** → its countdown line + what's left: `gh issue list --milestone "<name>" --state open`.
- **"are we on track"** → milestones with a `due` in the past, or a countdown tighter than their remaining-issue count warrants; say which are at risk and why.
- **"what am I on"** → In Progress filtered by `gh api user --jq .login`.
- **One task's detail** → `gh issue view <n>`. **Proposals** ("what's being discussed") → Proposed items + `gh issue view <n> --comments`.
