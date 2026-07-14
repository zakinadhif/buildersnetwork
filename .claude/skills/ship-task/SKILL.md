---
name: ship-task
description: Ship the claimed task — verify acceptance criteria, push the branch, open a PR that closes the issue, and move the board item to In Review. Use when the user says "ship it", "submit the task", "open the PR", or the task's work is complete.
---

# /ship-task — PR + board update

Close out a claimed task per the [build workflow](../../../plans/how-to/build-workflow.md).

## 1. Verify before shipping

- Identify the issue from the branch name (`task/<n>-…`) or ask.
- Re-read its acceptance criteria (`gh issue view <n>`); confirm each is actually met, including the required test (vitest API / Playwright e2e). Run the relevant tests. If something is unmet, say what's missing and stop — don't ship red.
- Check nothing outside **Boundary — Touch** was modified (`git diff main --stat`). If it was, flag it to the user before proceeding.

## 2. Ship

```bash
git push -u origin HEAD
gh pr create --title "<issue title>" --body "Closes #<n>

<2-4 sentences: what was built, any decision made within the boundary worth a reviewer's attention>"
```

Move the board item to **In Review**: item id via `gh project item-list 8 --owner zakinadhif --format json --jq '.items[] | select(.content.number==<n>) | .id'`, then:

```bash
gh project item-edit --id <item-id> --project-id PVT_kwHOA14JB84BcRLr --field-id PVTSSF_lAHOA14JB84BcRLrzhW7QCc --single-select-option-id 5ec27823
```

## 3. Hand off

Tell the user the PR URL and that merge is the maintainer's call. Merging auto-closes the issue; **after any dependency merges, check its dependents** — issues whose `Depends on #N` are now all closed — and flip them Blocked → **Ready** (or **Backlog**, if Ready is already long) so the queue never silently stalls. (Maintainer: move the merged item to **Done**.) The item-edit call and every option id are in the [Board reference](../../../plans/how-to/build-workflow.md#board-reference).

If the merged issue is a **`[Desain]`**, its follow-on isn't an unblock but a **groom** — the `[Fitur]` stub that design grounds gets its contract written from the merged mockup before it reaches Ready. Run that flow per [`/ratify` §3](../ratify/SKILL.md) (the rule is [the ratification gate](../../../plans/how-to/build-workflow.md#the-ratification-gate-vision--requirements--roadmap-changes)). If no stub exists — an ad-hoc design outside a ratification — file the `[Fitur]` fresh via [`/new-task`](../new-task/SKILL.md).
