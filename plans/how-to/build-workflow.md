# How we build — the workflow

*How work is defined, discussed, claimed, built, and merged. Written for both humans and their coding agents — the `.claude/skills/` in this repo encode the routine parts of this document.*

## The three units

| Unit | Criterion | Lives in |
|---|---|---|
| **Milestone** | One human judgment: one grooming decision + one testable exit criterion. Done when the exit passes — no time-box. | Half-page doc in `plans/milestones/` (the why, decisions, exit) + a GitHub Milestone grouping its tasks |
| **Task** | One agent session: completable cold from the issue body + the repo, producing **one PR** inside **one module boundary** (`libs/db` / `apps/api` / `apps/app`). | A GitHub Issue — acceptance criteria, boundary (touch / don't touch), dependencies, out-of-scope |
| **Queue** | Continuous pull — no cycles, no assignments handed down. You claim; nobody assigns you. | The [project board](https://github.com/users/zakinadhif/projects/8) Status field |

**One fact, one home.** Docs in git hold *intent* (why, decisions, exit). Issues hold the *contract* (what done means). The board holds *state* (who, what stage). Never write status into `plans/` files — that's how docs rot.

## Board statuses

```
Proposed ──(discussion + ratification)──▶ Ready ──(claim)──▶ In Progress ──(PR)──▶ In Review ──(merge)──▶ Done
                                            ▲
              Blocked ──(dependency merges)─┘
```

- **Proposed** — under discussion; **do not pick**. Vision/PRD-touching questions live here (see gate below).
- **Ready** — ratified, unblocked, claimable by anyone.
- **Blocked** — ratified but waiting on a `Depends on #N` task. Flips to Ready when the dependency merges.
- **In Progress** — claimed (assignee set). One task per person at a time.
- **In Review** — PR open, linked with `Closes #N`.
- **Done** — merged.

## The proposal gate (vision / PRD changes)

Anything that changes *what we're building* — a PRD amendment, a milestone scope change, a design divergence (e.g. [#6](https://github.com/zakinadhif/buildersnetwork/issues/6)) — enters as an issue in **Proposed** and is discussed in its comment thread. Ratification means:

1. The decision is written down where it durably belongs — a PR amending the PRD / vision / milestone doc in `plans/` (docs are code: decisions merge via diff).
2. Affected task issues are created or updated, and flipped **Proposed → Ready** — only the maintainer (@zakinadhif) flips this today.
3. The proposal issue is closed with a comment linking the doc PR.

Never start building from a Proposed item.

## The loop (human + agent)

Contributor setup, once: clone, `pnpm install`, `gh auth login`, then `gh auth refresh -s project,read:project` (board access). Claude Code picks up the repo skills automatically.

1. **`/board`** — see the queue: what's Ready, who's on what, what's in review. No website needed.
2. **`/pick-task`** — claim a Ready task: assigns you, moves it to In Progress, creates a branch, and loads the issue + milestone doc + conventions into your agent's context.
3. Build. Stay inside the issue's **Boundary**; if the task turns out bigger than one session, stop and comment on the issue instead of sprawling.
4. **`/ship-task`** — push, open a PR with `Closes #N`, board moves to In Review.
5. Maintainer reviews (with `/code-review` as second reviewer) and merges → Done, dependents flip to Ready.

**WIP limit:** review capacity is the bottleneck — if 3+ PRs are already In Review, prefer helping review over claiming another task.

## Grooming (maintainer)

Groom one milestone at a time, straight into issues — the doc never carries a task list. **Issues (title + body) are written in Bahasa Indonesia** — the team's language; keep code identifiers, file paths, and FR/NFR codes as-is:

1. Write the half-page milestone doc (why, decisions, exit) in `plans/milestones/`.
2. Create the GitHub Milestone; decompose into 3–6 session-sized issues sliced along module boundaries, dependencies explicit (`Depends on #N`).
3. Anything contentious becomes a **Proposed** issue instead of a task.
4. Unblocked + uncontentious tasks start **Ready**; dependent ones start **Blocked**.

When the milestone's exit criterion passes: close the GitHub Milestone, distill anything worth keeping into `plans/milestones/retro.txt`.
