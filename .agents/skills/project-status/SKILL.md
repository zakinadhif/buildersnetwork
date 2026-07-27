---
name: project-status
description: Report project status from the roadmap, GitHub milestones, project board, and open pull requests. Use for where the project stands, milestone progress, target-date countdowns, on-track assessments, board status, or current work.
---

# Report project status

Report top-down: phase and bet, milestone ladder, then today's board. Intent comes from `plans/roadmap.md`; live status comes from GitHub. Never read live status from the roadmap or intent from the board.

Gather milestones (including closed), project items, and open PRs, preferably in parallel:

```bash
gh api "repos/zakinadhif/buildersnetwork/milestones?state=all&per_page=100"
gh project item-list 8 --owner zakinadhif --format json
gh pr list --json number,title,author,isDraft
```

Read the roadmap for phase (P0/P1), treatment, and order. Calculate `due date - today` using the real current date.

Render:

1. Phase & bet: one or two lines from the active roadmap phase; name the active milestone.
2. Milestone ladder in roadmap order: phase, treatment, open/total progress, status, and `N days left`, overdue, due today, or `no target date`. Flag all-closed but open milestones for exit verification/closure.
3. Active-milestone board detail: item, assignee, and status. Flag stale Blocked items whose dependencies are closed; In Progress with no assignee; In Review with no PR; Proposed work already being built; Ready lists over roughly six; and three or more PRs awaiting review. Skip Done unless asked.
4. One highest-leverage next action. When issue counts imply completion, recommend `$code-status <milestone>` before closing; only a code audit verifies exit criteria.

If `gh project` lacks scope, tell the user to run `gh auth refresh -s project,read:project` once and retry. For a named milestone's time remaining, include its open issues. For “what am I on,” filter In Progress by `gh api user --jq .login`.
