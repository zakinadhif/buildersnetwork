---
name: pick-task
description: Claim a Ready task from the project board — assign yourself, move it to In Progress, create a branch, and load the task's full context. Use when the user says "pick a task", "claim #N", "give me something to work on", or "start on the next task".
---

# /pick-task [issue-number] — claim and load context

Claim a task per the [build workflow](../../../plans/how-to/build-workflow.md). **Ready** (the curated ~6 shortlist) is always safe to claim; **Backlog** (the mixed holding pool) is claimable *only* once you've confirmed the item is groomed and unblocked. Prefer Ready. Never claim **Proposed** (under discussion) or **Blocked**.

## 1. Choose

List claimable work — Ready first, then Backlog:

```bash
gh project item-list 8 --owner zakinadhif --format json --jq '.items[] | select(.status=="Ready" or .status=="Backlog") | "[\(.status)] #\(.content.number)\t\(.title)"'
```

- If the user named an issue, verify it's Ready or Backlog — if not, say why (Proposed = still under discussion; Blocked = name what's stuck from its `Depends on` line or its blocker comment) and stop.
- If they didn't, show the list — **Ready first (the curated shortlist), then Backlog**; if exactly one, propose it.
- **Backlog isn't pre-vetted like Ready.** Before claiming a Backlog item, read the issue: is it groomed enough to build cold, and free of any open `Depends on #N`? If it's under-specced or actually blocked, don't claim it — say so, and if it's blocked move it to **Blocked**.
- If the user already has an In Progress item (assignee = `gh api user --jq .login`), point at it and ask before claiming a second (one task per person — a Blocked task of theirs doesn't count).

## 2. Claim

```bash
gh issue edit <n> --add-assignee @me
git checkout main && git pull && git checkout -b task/<n>-<short-slug>
```

Move the board item to **In Progress**: find the item id via `gh project item-list 8 --owner zakinadhif --format json --jq '.items[] | select(.content.number==<n>) | .id'`, then:

```bash
gh project item-edit --id <item-id> --project-id PVT_kwHOA14JB84BcRLr --field-id PVTSSF_lAHOA14JB84BcRLrzhW7QCc --single-select-option-id 2f8ef994
```

(The other status option ids are in the [Board reference](../../../plans/how-to/build-workflow.md#board-reference).)

## 3. Load context, then build

Read, in order: the issue body (`gh issue view <n>`) — the contract; the milestone doc it links in `plans/milestones/` — the why; `plans/archive/retro.txt` — repo principles; plus the docs the boundary touches ([adding-an-endpoint.md](../../../plans/how-to/adding-an-endpoint.md) for API tasks).

For **UI tasks, the mockups are the north star** — read them, not a prose description of them: `apps/mockups/src/lib/tokens.ts` (`T`) is the single source for the design system, `apps/mockups/src/components/` holds the shared chrome (`Shell`, `Avatar`, `Tag`), and `apps/app/src/index.css` is their port into the app. No doc restates those values; don't go looking for one.

Then restate the acceptance criteria and boundary in one short summary and start. Stay inside **Boundary — Touch**. If you hit a blocker you can't clear in-session, or the task can't fit one session, **move the card to Blocked** (the item-edit call and its option id are in the [Board reference](../../../plans/how-to/build-workflow.md#board-reference)), **comment what's stuck**, and stop rather than sprawl.
