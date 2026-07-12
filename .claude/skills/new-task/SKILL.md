---
name: new-task
description: Create a GitHub issue AND put it on the project board with the right Status — the two-step no agent should split. Use when the user says "create an issue", "file a task", "open issues for X", "groom this into tasks", or "add these to the board". Runs the issue-creation gate (grounding + mockup checks) first. Covers [Fitur], [Diskusi], [Desain], [Bug], and [Security] issues.
---

# /new-task — create an issue *and* land it on the board

Author a well-formed issue per the [build workflow](../../../plans/how-to/build-workflow.md), then **add it to the board and set its Status**. Creating the issue is only half the job — an issue that isn't on the board is invisible to `/board` and unclaimable by `/pick-task`. Never stop after `gh issue create`.

This is normally a **maintainer grooming** activity. Issue title + body are written in **Bahasa Indonesia** (the team's language); keep code identifiers, file paths, and FR/NFR codes as-is.

## 0. Clear the issue-creation gate — do this *before* shaping anything

The [issue-creation gate](../../../plans/how-to/build-workflow.md#the-issue-creation-gate) exists to stop two real failures: a `[Fitur]` no vision/PRD/milestone asked for, and a `[Fitur]` for a screen nobody has drawn. **Warn and recommend — never self-override.** Only the maintainer overrides, on their explicit say-so.

1. **Strategic or non-strategic?**
   - **Non-strategic** (`[Bug]`, `[Security]`, chore, docs) → skip to §1 and file directly. No grounding, no mockup check.
   - **Strategic** (`[Diskusi]` / `[Fitur]` / `[Desain]`) → clear the gates before filing: **Gate A grounds all three**; **Gate B is `[Fitur]`-only** (a `[Diskusi]` is a question, a `[Desain]` *is* the mockup — neither needs one).
2. **Gate A — grounding.** Read the [Vision](../../../plans/al-fath-berkarya-vision.md) / [PRD](../../../plans/al-fath-berkarya-prd.md) / active [milestone doc](../../../plans/milestones/) and confirm they actually call for this. If yes, note *where* — it becomes the `## Kenapa` citation. If it falls outside all three, **stop**: recommend a `[Diskusi]` in **Proposed** instead of a `[Fitur]`. File build work only if the maintainer insists, and record the ungrounded exception in the body.
3. **Gate B — mockup** (only for a non-trivial user-facing surface). Check `apps/mockups/` for a `[Desain]` mockup of this surface. If one exists, cite it in `## Kenapa` — it grounds the feature, so scope and schema follow from what the UI needs to serve. If none exists, **don't file a groomed `[Fitur]`** — recommend a `[Desain]` exploration first (or point at the one that should be built); the feature's contract is written only *after* the design lands. (One exception: during a ratification a feature may be filed now as an ungroomed **Backlog stub** under the proposal — see [`/ratify-proposal`](../ratify-proposal/SKILL.md) §3 — then groomed from the mockup when the design merges.) Trivial surfaces (a toggle, a copy tweak) and pure backend/infra skip Gate B.

For a batch (`open issues for X`, `groom this into tasks`), run this gate for **each** proposed issue — the four-`[Fitur]`-with-no-mockup dump is the exact failure this step prevents.

## 1. Shape the issue

**Title:** `[Tag] <Area>: <brief>` — pick the tag:

| Tag | For | Initial Status |
|---|---|---|
| `[Fitur]` | A shippable deliverable — one session, one PR, built **vertically** (migration + API + wired UI as the feature needs). The default. Strategic — clears the gate. | Ready / Backlog / Blocked |
| `[Diskusi]` | A question to decide *before* building — proposal, PRD/vision/milestone change. Strategic. | Proposed |
| `[Desain]` | A design *approach* built to be reviewed before it's locked in (see [parallel-ui-exploration](../../../plans/how-to/parallel-ui-exploration.md)). Grounds a later `[Fitur]`; it doesn't become one. Strategic. | Ready (or Backlog) |
| `[Bug]` | A reproducible defect to fix — the reactive lane. Non-strategic; skips the gate. A security *bug* goes here (add a `security` label if sensitive), not `[Security]`. | Ready (Backlog if not urgent) |
| `[Security]` | A security *hardening* task with no specific defect — audit, add guards, tighten config. Non-strategic; skips the gate. | Backlog (Ready if urgent) |

`<Area>` is the feature/milestone (e.g. `Launchpad`) so grouping shows in `gh issue list`. Tag by **deliverable, not module** — don't split one feature into per-layer DB/API/UI issues; that manufactures dependencies. The only worthwhile break-out is design (`[Desain]`), for review reasons — and it's a precursor that grounds the feature, not a slice of it.

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
- **Ready** `177864ee` — a `[Fitur]`/`[Desain]`/`[Bug]`/`[Security]` that's unblocked, uncontentious, and wanted *now*. Keep Ready short (**~6**, a soft cap); if it already looks long, use Backlog instead.
- **Backlog** `d9a7d606` — the holding pool: groomed-but-unprioritized work (Ready overflow), not-yet-groomed items (including ratification `[Fitur]` stubs awaiting their `[Desain]`), plus non-urgent `[Bug]`/`[Security]` and parked tasks. Claimable only once groomed and unblocked — not pre-vetted like Ready.
- **Blocked** `0b102e6a` — not workable now: a `Depends on #N` whose blocker is still open. (Flips to Ready — or Backlog if Ready is already long — when the blocker merges; `/ship-task` handles that.) Contributors also move a card here mid-task when they hit a blocker.
- **Proposed** `e1ac50ba` — every `[Diskusi]`, and anything contentious.

```bash
gh project item-edit --id "$ITEM" --project-id PVT_kwHOA14JB84BcRLr --field-id PVTSSF_lAHOA14JB84BcRLrzhW7QCc --single-select-option-id <option-id>
```

(Full status option ids: Backlog `d9a7d606` · Proposed `e1ac50ba` · Ready `177864ee` · Blocked `0b102e6a` · In Progress `2f8ef994` · In Review `5ec27823` · Done `0f0738c1`.)

> Only the maintainer (@zakinadhif) curates **Ready** (the short ~6 shortlist). If you're not the maintainer: land non-strategic work (`[Bug]`/`[Security]`) in **Backlog** — it's claimable, so it needs no Ready flip — and put strategic work in **Proposed** for ratification (the maintainer later runs [`/ratify-proposal`](../ratify-proposal/SKILL.md) to turn it into Ready tasks). Don't self-serve into Ready.

## 5. For a batch

When creating several issues at once, run steps 2–4 for **each** before reporting — a missed board-add is the exact failure this skill exists to prevent. Then confirm: list each `#N — title — Status`, and if any depend on each other, verify the blocked ones landed as **Blocked**, not Ready.
