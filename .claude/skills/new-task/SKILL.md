---
name: new-task
description: Create a GitHub issue AND put it on the project board with the right Status — the two-step no agent should split. Use when the user says "create an issue", "file a task", "open issues for X", "groom this into tasks", or "add these to the board". Covers [Fitur], [Diskusi], and [UI] issues.
---

# /new-task — create an issue *and* land it on the board

Author a well-formed issue per the [build workflow](../../../plans/how-to/build-workflow.md), then **add it to the board and set its Status**. Creating the issue is only half the job — an issue that isn't on the board is invisible to `/board` and unclaimable by `/pick-task`. Never stop after `gh issue create`.

This is normally a **maintainer grooming** activity. Issue title + body are written in **Bahasa Indonesia** (the team's language); keep code identifiers, file paths, and FR/NFR codes as-is.

## 1. Shape the issue

**Title:** `[Tag] <Area>: <brief>` — pick the tag:

| Tag | For | Initial Status |
|---|---|---|
| `[Fitur]` | A shippable deliverable — one session, one PR, built **vertically** (migration + API + wired UI as the feature needs). The default. | Ready (or Blocked) |
| `[Diskusi]` | A question to decide *before* building — proposal, PRD/vision/milestone change. | Proposed |
| `[UI]` | A UI *approach* built to be reviewed before it's locked in (see [parallel-ui-exploration](../../../plans/how-to/parallel-ui-exploration.md)). | Ready |

`<Area>` is the feature/milestone (e.g. `Launchpad`) so grouping shows in `gh issue list`. Tag by **deliverable, not module** — don't split one feature into per-layer DB/API/UI issues; that manufactures dependencies. The only worthwhile break-out is UI, for review reasons.

**Body — the contract** (a task must be completable cold from body + repo). Follow the house section order, all headings in Bahasa Indonesia:
- **`## Kenapa`** — the why: what's thin today, what mockup/source it draws from, why this slice. Every issue leads with it.
- **`## Ruang lingkup`** — the scope narrative (add `(vertikal)` when the slice cuts DB → API → UI). What actually gets built.
- **`## Batas (touch / don't touch)`** — **Touch:** / **Don't touch:** path lists.
- **`## Kriteria terima`** — acceptance criteria, incl. the required test (vitest API / Playwright e2e).
- **`## Dependensi`** — one `Depends on #N` line per blocker (drives Blocked status). Omit the heading if none.
- **`## Di luar lingkup`** — what this deliberately doesn't do.
- Treatment where relevant (Hero / Dark / Deferred) and milestone.

If the request is a broad, contentious, or vision/PRD-touching direction question, it's a `[Diskusi]` in **Proposed** — not a task. Don't manufacture acceptance criteria for something not yet decided.

## 2. Create the issue

```bash
gh issue create --title "[Fitur] <Area>: <brief>" --milestone "<milestone title>" --body "$(cat <<'EOF'
## Kenapa
…

## Ruang lingkup
- …

## Batas (touch / don't touch)
- **Touch:** …
- **Don't touch:** …

## Kriteria terima
- …

## Dependensi
Depends on #<N>   # hapus section ini kalau nggak ada

## Di luar lingkup
- …
EOF
)"
```

Note the issue number/URL it prints — you need it next. (`--milestone` requires the GitHub Milestone to already exist; create it first with `gh api repos/zakinadhif/buildersnetwork/milestones -f title=…` if needed. Omit the flag if there's no milestone yet.)

## 3. Add it to the board — the step that gets forgotten

Add the issue as a board item and capture the item id:

```bash
ITEM=$(gh project item-add 8 --owner zakinadhif --url <issue-url> --format json --jq '.id')
```

## 4. Set its Status

Choose the option id by the table in step 1 and the board rules:
- **Ready** `177864ee` — a `[Fitur]`/`[UI]` that's unblocked and uncontentious.
- **Blocked** `0b102e6a` — it has a `Depends on #N` whose blocker is still open. (Flips to Ready when the blocker merges — `/ship-task` handles that.)
- **Proposed** `e1ac50ba` — every `[Diskusi]`, and anything contentious.

```bash
gh project item-edit --id "$ITEM" --project-id PVT_kwHOA14JB84BcRLr --field-id PVTSSF_lAHOA14JB84BcRLrzhW7QCc --single-select-option-id <option-id>
```

(Full status option ids: Proposed `e1ac50ba` · Ready `177864ee` · Blocked `0b102e6a` · In Progress `2f8ef994` · In Review `5ec27823` · Done `0f0738c1`.)

> Only the maintainer (@zakinadhif) flips items to **Ready** today. If you're not the maintainer, create the issue on the board as **Proposed** and hand it off for ratification rather than self-serving it Ready.

## 5. For a batch

When creating several issues at once, run steps 2–4 for **each** before reporting — a missed board-add is the exact failure this skill exists to prevent. Then confirm: list each `#N — title — Status`, and if any depend on each other, verify the blocked ones landed as **Blocked**, not Ready.
