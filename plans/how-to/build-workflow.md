# How we build — the workflow

*How work is defined, discussed, claimed, built, and merged. Written for both humans and their coding agents — the `.claude/skills/` in this repo encode the routine parts of this document.*

## The three units

| Unit | Criterion | Lives in |
|---|---|---|
| **Milestone** | One human judgment: one grooming decision + one testable exit criterion. Done when the exit passes — no time-box. | Half-page doc in `plans/milestones/` (the why, decisions, exit) + a GitHub Milestone grouping its tasks |
| **Task** | One agent session: completable cold from the issue body + the repo, producing **one PR** inside **one module boundary** (`libs/db` / `apps/api` / `apps/app`). | A GitHub Issue — acceptance criteria, boundary (touch / don't touch), dependencies, out-of-scope |
| **Queue** | Continuous pull — no cycles, no assignments handed down. You claim; nobody assigns you. | The [project board](https://github.com/users/zakinadhif/projects/8) Status field |

**One fact, one home.** Docs in git hold *intent* (why, decisions, exit). Issues hold the *contract* (what done means). The board holds *state* (who, what stage). Never write status into `plans/` files — that's how docs rot.

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

Broad, open-ended direction talk (vision, ideas, sequencing debates, non-technical input) lives in the pinned [🧭 Visi & Roadmap issue (#12)](https://github.com/zakinadhif/buildersnetwork/issues/12) — always open, for everyone. When a discussion there crystallizes into a concrete change to *what we're building* — a PRD amendment, a milestone scope change, a design divergence — it graduates to its own issue in **Proposed** and is decided in that thread. Ratification means:

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
