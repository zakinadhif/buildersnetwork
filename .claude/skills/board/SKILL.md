---
name: board
description: Show the project board — ready tasks, who's building what, PRs in review, milestone progress — without opening the GitHub website. Use when the user asks "what's on the board", "what can I work on", "status of the milestone", or similar.
---

# /board — surface the queue

Render the live state of the [build workflow](../../../plans/how-to/build-workflow.md) in the terminal.

## Gather (run in parallel)

```bash
gh project item-list 8 --owner zakinadhif --format json --jq '.items[] | "\(.status)\t#\(.content.number)\t\(.title)\t\(.assignees // [] | join(","))"'
gh pr list --json number,title,author,url --jq '.[] | "#\(.number) \(.title) (@\(.author.login))"'
gh api repos/zakinadhif/buildersnetwork/milestones --jq '.[] | "\(.title): \(.closed_issues)/\(.closed_issues + .open_issues) closed"'
```

If `gh project` fails with a scope error, tell the user to run `gh auth refresh -s project,read:project` once, then retry.

## Render

Group items by status in pipeline order — **Ready** first (that's what people came for), then In Progress, In Review, Blocked, Proposed; skip Done unless asked. For each: `#N title — @assignee`. Follow with open PRs and milestone progress lines.

Close with one actionable sentence, e.g. "Ready to claim: #1 — run /pick-task 1" or, if 3+ PRs are In Review, note that reviewing beats claiming (WIP limit).

## Extra asks

- "what am I working on" → filter In Progress by `gh api user --jq .login`.
- Details of one task → `gh issue view <n>`.
- Proposals ("what's being discussed") → Proposed items + `gh issue view <n> --comments`.
