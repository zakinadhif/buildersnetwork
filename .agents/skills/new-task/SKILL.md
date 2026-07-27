---
name: new-task
description: Create a GitHub issue and add it to the project board with the correct Status. Use when creating issues, filing tasks, grooming work into tasks, or adding tasks to the board. Enforces the repository's grounding and mockup gate for strategic work.
---

# Create and place a task

Create the issue and add it to the board in the same workflow. Write issue titles and prose in Bahasa Indonesia; preserve code identifiers, paths, and FR/NFR IDs.

1. Read `plans/how-to/build-workflow.md` and clear the issue-creation gate before shaping each issue.
   - `[Bug]`, `[Security]`, chores, and docs are non-strategic; file directly.
   - `[Diskusi]`, `[Fitur]`, and `[Desain]` need Gate A: a concrete citation in vision, requirements, or active milestone documentation.
   - A non-trivial UI `[Fitur]` also needs Gate B: a matching mockup in `apps/mockups/`. If absent, recommend `[Desain]` first. Only an explicit maintainer override may bypass a gate; record it in the issue.
2. Choose the tag and initial Status: `[Fitur]` for one vertical, shippable deliverable; `[Diskusi]` for an undecided question (Proposed); `[Desain]` for a reviewable design exploration; `[Bug]` for a reproducible defect; `[Security]` for hardening without a known defect. Use Ready only for unblocked, current, maintainer-curated work; otherwise use Backlog, Proposed, or Blocked.
3. Author the cold-completable contract in this order: `## Kenapa`, `## Ruang lingkup`, `## Batas (touch / don't touch)`, `## Kriteria terima`, optional `## Dependensi`, and `## Di luar lingkup`. Include relevant treatment/milestone and required Vitest or Playwright validation. Split by vertical deliverable, not DB/API/UI layers.
4. Create the issue, then place it idempotently through the repository workflow command. If issue creation succeeds but placement fails, rerun only `place`; it will add or repair the existing board item without duplication.

```bash
gh issue create --title "[Tag] <Area>: <brief>" --milestone "<milestone>" --body "<body>"
pnpm workflow place <number> <Backlog|Proposed|Ready|Blocked>
```

5. For a batch, complete creation, board addition, and status setting for every issue. Report `#number — title — Status`, including dependency status.
