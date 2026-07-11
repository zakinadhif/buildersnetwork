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

## 3. Decompose into tasks — design-first, reuse the gate

The doc you just wrote **grounds** the work, so Gate A is satisfied by construction. For **each shippable deliverable**, run the [`/new-task`](../new-task/SKILL.md) flow — decomposition re-enters the issue-creation gate rather than re-inventing it, so **Gate B still holds**. Gate B is design-first *on purpose*: the data schema should take the shape the UI needs, so a UI-heavy feature is authored **around** its mockup, never before one exists.

- **UI-heavy deliverable → file a `[Desain]`, not a `[Fitur]`.** No mockup is decided yet, so a `[Fitur]` now would be a hollow, ungroomable placeholder (its scope, criteria, and schema-touch list are all outputs of the design). File the `[Desain]` exploration now and record its intended `[Fitur]` in the **doc PR** from step 2 — the durable list (*one fact, one home*), not a checklist in the proposal's issue body. Put a pointer on the `[Desain]` body: *"Setelah desain ini diputuskan, buat `[Fitur]` yang membangunnya, grounded di mockup ini."* The feature gets authored later, once the mockup lands — that's Gate B doing its job on the next pass, not a dependency to auto-flip.
- **Trivial-surface or pure-backend deliverable → file the `[Fitur]` now.** Gate B is N/A; these don't wait on a design.
- Split by **deliverable, not module** — vertical `[Fitur]` slices, not per-layer DB/API/UI issues. (Don't reach for sub-issues to organize a feature by layer — that's the same [module-splitting](../../../plans/how-to/build-workflow.md#sub-issues--one-sanctioned-use), just hierarchical.)
- Each new issue's `## Kenapa` cites the doc PR / section from step 2 — that's the trace back to the ratified decision.
- Set real dependencies (`Depends on #N`); dependent tasks land **Blocked**, not Ready. The design→feature link is *not* one of these — the `[Fitur]` isn't filed yet, so there's nothing to mark Blocked.
- Some proposals **update** existing issues rather than spawn new ones — edit those bodies instead.
- **Link each spawned task as a sub-issue of the proposal.** This makes the lineage structural and bidirectional — the proposal (which stays on the board as the *why* record) points to the tasks it spawned and each task back to it, instead of a closing comment that rots — and the "Auto-add sub-issues" workflow lands the child on the board. `gh` has no sub-issue command yet; use the GraphQL mutation with each issue's node id:
  ```bash
  PARENT=$(gh issue view <proposal-n> --json id --jq .id)   # the [Diskusi]
  CHILD=$(gh issue view <task-n> --json id --jq .id)         # the new [Desain]/[Fitur]
  gh api graphql -f query='mutation($p:ID!,$c:ID!){addSubIssue(input:{issueId:$p,subIssueId:$c}){issue{number}}}' -f p="$PARENT" -f c="$CHILD"
  ```
  This is the **only** sanctioned use of sub-issues — parent/child is reserved for proposal → tasks, never feature → layers.

## 4. Curate, then close the proposal

- Flip the resulting tasks **Proposed → Ready** (`177864ee`) — but keep **Ready short (~6)**; park overflow in **Backlog** (`d9a7d606`). Only the maintainer flips into Ready. (Field/project ids and the item-edit call are in [`/new-task` §4](../new-task/SKILL.md); status option ids: Ready `177864ee` · Backlog `d9a7d606` · Blocked `0b102e6a`.)
- **Close the `[Diskusi]`** with a comment linking the doc PR — the sub-issue links from step 3 already carry the task lineage, so the comment is a human-readable backstop, not the only thread:

```bash
gh issue close <n> --comment "Diratifikasi di <doc-PR-url>. Task turunan: #<a>, #<b>, … (tertaut sebagai sub-issue)."
```

  **Leave the board item in place — closed, not archived.** A ratified proposal is the durable record of *why* the tasks exist; it stays on the board (in **Proposed**, now showing closed) so the decision remains visible. Don't `gh project item-archive` it. (Project #8's "Item closed" and auto-archive workflows are **disabled**, so closing won't move or remove it — if a maintainer ever enables one, flag that rather than working around it.)

Then report: the doc PR, each spawned/updated issue with its Status, and confirm the proposal is closed (and still on the board).
