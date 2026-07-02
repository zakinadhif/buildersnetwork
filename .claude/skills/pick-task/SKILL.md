---
name: pick-task
description: Claim a Ready task from the project board — assign yourself, move it to In Progress, create a branch, and load the task's full context. Use when the user says "pick a task", "claim #N", "give me something to work on", or "start on the next task".
---

# /pick-task [issue-number] — claim and load context

Claim a task per the [build workflow](../../../plans/how-to/build-workflow.md). Never claim anything whose board status isn't **Ready**.

## 1. Choose

List claimable work:

```bash
gh project item-list 8 --owner zakinadhif --format json --jq '.items[] | select(.status=="Ready") | "#\(.content.number)\t\(.title)"'
```

- If the user named an issue, verify it's in that Ready list — if not, say why (Proposed = still under discussion; Blocked = name the blocking issue from its `Depends on` line) and stop.
- If they didn't, show the list; if exactly one, propose it.
- If the user already has an In Progress item (assignee = `gh api user --jq .login`), point at it and ask before claiming a second (one task per person).

## 2. Claim

```bash
gh issue edit <n> --add-assignee @me
git checkout main && git pull && git checkout -b task/<n>-<short-slug>
```

Move the board item to **In Progress**: find the item id via `gh project item-list 8 --owner zakinadhif --format json --jq '.items[] | select(.content.number==<n>) | .id'`, then:

```bash
gh project item-edit --id <item-id> --project-id PVT_kwHOA14JB84BcRLr --field-id PVTSSF_lAHOA14JB84BcRLrzhW7QCc --single-select-option-id 2f8ef994
```

(Status option ids: Proposed `e1ac50ba` · Ready `177864ee` · Blocked `0b102e6a` · In Progress `2f8ef994` · In Review `5ec27823` · Done `0f0738c1`.)

## 3. Load context, then build

Read, in order: the issue body (`gh issue view <n>`) — the contract; the milestone doc it links in `plans/milestones/` — the why; `plans/milestones/retro.txt` — repo principles; plus README sections the boundary touches (OpenAPI-first workflow for API tasks, Design system for UI tasks).

Then restate the acceptance criteria and boundary in one short summary and start. Stay inside **Boundary — Touch**; if the task can't fit one session, stop and comment findings on the issue rather than sprawl.
