---
name: new-task
description: Create a GitHub issue and add it to the project board with the correct Status. Use when creating implementation, design, bug, security, chore, or documentation tasks; filing already-articulated work; grooming work into tasks; or adding tasks to the board. Enforces the repository's grounding and mockup gate. Use open-discussion first for rough reasoning or a new [Diskusi].
---

# Create and place a task

Create the issue and add it to the board in the same workflow. Write issue titles and prose in Bahasa Indonesia; preserve code identifiers, paths, and FR/NFR IDs.

1. Read `plans/how-to/build-workflow.md` and clear the issue-creation gate before shaping each issue.
   - `[Bug]`, `[Security]`, chores, and docs are non-strategic; file directly.
   - `[Fitur]` and `[Desain]` need decision grounding: a concrete citation in vision, requirements, an active milestone, a ratified decision, or the active documentation PR produced by `$ratify` while its spawned work remains Backlog.
   - `[Diskusi]` needs reality grounding instead: cite the code, documentation, feedback, or observed tension being questioned. It may challenge current plans without a maintainer override. Use `$open-discussion` when the reasoning is still rough.
   - A non-trivial UI `[Fitur]` also needs Gate B: a matching mockup in `apps/mockups/`. If absent, recommend `[Desain]` first. Only an explicit maintainer override may bypass a gate; record it in the issue.
2. Choose the tag and initial Status: `[Fitur]` for one vertical, shippable deliverable; `[Diskusi]` for an undecided question (Proposed); `[Desain]` for a reviewable design exploration; `[Bug]` for a reproducible defect; `[Security]` for hardening without a known defect. Use Ready only for unblocked, current, maintainer-curated work; otherwise use Backlog, Proposed, or Blocked.
3. For buildable work, author the cold-completable contract in this order: `## Kenapa`, `## Ruang lingkup`, `## Batas (touch / don't touch)`, `## Kriteria terima`, and `## Di luar lingkup`. Include relevant treatment/milestone and required Vitest or Playwright validation. Split by vertical deliverable, not DB/API/UI layers. Record sequencing with GitHub's native `Blocked by` relationship instead of duplicating `Depends on #N` in the body; explain the reason in scope only when it is not already obvious. For `[Diskusi]`, use the canonical structure in `$open-discussion`; do not force task acceptance criteria onto an undecided question.
4. Create the issue with `--blocked-by` when it has dependencies (omit the flag when it has none), then place it idempotently through the repository workflow command. A task with any open blocker starts Blocked. If issue creation succeeds but placement fails, rerun only `place`; it will add or repair the existing board item without duplication.

```bash
gh issue create --title "[Tag] <Area>: <brief>" --milestone "<milestone>" --body "<body>" --blocked-by <issue>[,<issue>]
pnpm workflow place <number> <Backlog|Proposed|Ready|Blocked>
```

5. For a batch, complete creation, board addition, and status setting for every issue. Report `#number — title — Status`, including dependency status.
