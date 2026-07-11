---
name: ratify-proposal
description: Turn a decided [Diskusi] proposal into durable docs + board tasks — write the decision into plans/ as a PR, decompose it into issues through the gate, and close the proposal. Use when the user says "ratify #N", "the proposal is decided", "accept this proposal", or "turn this discussion into tasks".
---

# /ratify-proposal — a decided [Diskusi] becomes docs + tasks

Ratify a **Proposed** item per the [build workflow](../../../plans/how-to/build-workflow.md#the-proposal-gate-vision--prd-changes). This is the one transition that used to have no skill — it's how a crystallized discussion turns into buildable work without losing the decision. **Maintainer only** (@zakinadhif curates Ready and closes the proposal). Issues and doc prose are written in **Bahasa Indonesia**; keep code identifiers, paths, and FR/NFR codes as-is.

## 1. Confirm the proposal is actually decided

- Identify the `[Diskusi]` issue (it's in **Proposed**) from the argument or ask. Read the whole thread: `gh issue view <n> --comments`.
- Ratify **only** if it has crystallized into a **concrete change to what we build** — a PRD amendment, a milestone scope change, a design divergence with a chosen direction. If the thread is still open-ended debate, it stays Proposed — don't ratify. If it's broad vision/sequencing talk with no concrete decision yet, it belongs in the pinned [🧭 Visi & Roadmap issue (#12)](https://github.com/zakinadhif/buildersnetwork/issues/12), not a ratification.

## 2. Write the decision down — docs are code

The decision merges as a **diff**, not a board move. Open a PR amending the durable doc where it belongs:

- A PRD/vision change → edit `plans/al-fath-berkarya-prd.md` / `plans/al-fath-berkarya-vision.md`.
- A milestone scope change → edit that `plans/milestones/<name>.md`; if it's a brand-new milestone, write the half-page doc (why, decisions, exit) now.

Keep the PR focused on the decision — it becomes the source of truth every resulting task cites. Note the PR URL; step 3 needs it.

## 3. Decompose into tasks — reuse the gate

The doc you just wrote **grounds** the work, so Gate A is satisfied by construction. For **each shippable deliverable**, run the [`/new-task`](../new-task/SKILL.md) flow — decomposition re-enters the issue-creation gate rather than re-inventing it, so **Gate B still holds**: a non-trivial user-facing surface needs a graduated `[UI]` mockup first (draw it before the `[Fitur]`).

- Split by **deliverable, not module** — vertical `[Fitur]` slices, not per-layer DB/API/UI issues.
- Each new issue's `## Kenapa` cites the doc PR / section from step 2 — that's the trace back to the ratified decision.
- Set dependencies (`Depends on #N`); dependent tasks land **Blocked**, not Ready.
- Some proposals **update** existing issues rather than spawn new ones — edit those bodies instead.

## 4. Curate, then close the proposal

- Flip the resulting tasks **Proposed → Ready** (`177864ee`) — but keep **Ready short (~6)**; park overflow in **Backlog** (`d9a7d606`). Only the maintainer flips into Ready. (Field/project ids and the item-edit call are in [`/new-task` §4](../new-task/SKILL.md); status option ids: Ready `177864ee` · Backlog `d9a7d606` · Blocked `0b102e6a`.)
- **Close the `[Diskusi]`** with a comment linking the doc PR and listing the issues it spawned — so the decision is never orphaned:

```bash
gh issue close <n> --comment "Diratifikasi di <doc-PR-url>. Task turunan: #<a>, #<b>, …"
```

  **Leave the board item in place — closed, not archived.** A ratified proposal is the durable record of *why* the tasks exist; it stays on the board (in **Proposed**, now showing closed) so the decision remains visible. Don't `gh project item-archive` it. (If project #8 has an auto-archive-on-close workflow, it would defeat this — flag that to the maintainer rather than working around it.)

Then report: the doc PR, each spawned/updated issue with its Status, and confirm the proposal is closed (and still on the board).
