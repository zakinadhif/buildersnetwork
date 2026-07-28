---
name: pick-task
description: Claim a Ready or eligible Backlog GitHub project task, assign it, move it to In Progress, create a branch, and load its implementation context. Use when picking, claiming, or starting the next task.
---

# Claim and load a task

Follow `plans/how-to/build-workflow.md`. Prefer the maintained Ready shortlist. Never claim Proposed or Blocked work.

1. List Ready and Backlog work:

```bash
gh project item-list 8 --owner zakinadhif --format json --jq '.items[] | select(.status=="Ready" or .status=="Backlog") | "[\(.status)] #\(.content.number)\t\(.title)"'
```

If the user named an issue, verify eligibility. For Backlog, read the issue and query `gh issue view <number> --json blockedBy`; ensure it is complete enough to build cold and has no open native blocker, then move genuinely blocked work to Blocked. Check whether the current user already owns In Progress work and ask before taking a second task.

2. Run `pnpm workflow claim <number>`. It verifies eligibility and dependencies, enforces the one-In-Progress rule, assigns the issue, creates or resumes `task/<number>-<short-slug>` from `origin/main`, then moves the board item to In Progress. The command is safe to rerun after a partial failure. Use `--allow-second` only after the user explicitly approves taking a second active task. If state looks inconsistent, run `pnpm workflow doctor <number>` first.
3. Read the issue body, linked milestone document, `plans/archive/retro.txt`, and boundary-relevant how-to documents. For UI work, inspect the actual mockups and design sources: `apps/mockups/src/lib/tokens.ts`, `apps/mockups/src/components/`, and `apps/app/src/index.css`.
4. Restate acceptance criteria and Touch/Don't touch boundaries briefly before coding. If the task cannot be cleared within the session or is too large, set it Blocked, comment the blocker, and stop rather than expanding scope.
