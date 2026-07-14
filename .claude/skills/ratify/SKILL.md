---
name: ratify
description: Turn a decided [Diskusi] into durable docs + board tasks — write the decision into plans/ as a PR, decompose it into issues through the gate, and close the [Diskusi]. Use when the user says "ratify #N", "the [Diskusi] is decided", "accept this diskusi", or "turn this discussion into tasks".
---

# /ratify — a decided [Diskusi] becomes docs + tasks

Ratify a `[Diskusi]` sitting in **Proposed**, per the [build workflow](../../../plans/how-to/build-workflow.md#the-ratification-gate-vision--requirements--roadmap-changes). This is the one transition that used to have no skill — it's how a crystallized discussion turns into buildable work without losing the decision. **Maintainer only** (@zakinadhif curates Ready and closes the `[Diskusi]`). Issues and doc prose are written in **Bahasa Indonesia**; keep code identifiers, paths, and FR/NFR codes as-is.

## 1. Confirm the [Diskusi] is actually decided

- Identify the `[Diskusi]` issue (it's in **Proposed**) from the argument or ask. Read the whole thread: `gh issue view <n> --comments`.
- Ratify **only** if it has crystallized into a **concrete change to what we build** — a new or amended requirement, a roadmap re-ordering, a milestone scope change, a design divergence with a chosen direction. If the thread is still open-ended debate, it stays Proposed — don't ratify. If it's broad vision/sequencing talk with no concrete decision yet, it belongs in the pinned [🧭 Visi & Roadmap issue (#12)](https://github.com/zakinadhif/buildersnetwork/issues/12), not a ratification.

## 2. Write the decision down — docs are code

The decision merges as a **diff**, not a board move. Open a PR amending the durable doc where it belongs:

- A vision / requirements / roadmap change → edit `plans/vision.md`, `plans/reference/requirements.md`, or `plans/roadmap.md` (schedule).
- A milestone scope change → edit that `plans/milestones/<name>.md`; if it's a brand-new milestone, write the half-page doc (why, decisions, exit) now.

Keep the PR focused on the decision — it becomes the source of truth every resulting task cites. Note the PR URL; step 3 needs it.

## 3. Decompose — design first, then the features it grounds

The doc you just wrote **grounds** the work, so Gate A is satisfied by construction. Decompose respecting the ordering the gate implies: **a feature's scope and schema follow from its UI**, so the design leads and a UI-bearing `[Fitur]` isn't groomed until its design exists.

- **File the `[Desain]` explorations** — one per non-trivial surface the decision introduces — via the [`/new-task`](../new-task/SKILL.md) flow, and flip them **Ready**. They're the immediate, buildable output of ratification.
- **File each UI-bearing `[Fitur]` now too, but as an ungroomed stub in Backlog.** Body is minimal — a `## Kenapa` citing the doc PR + *"menunggu desain #N; skema mengikuti UI, jangan di-groom/mulai sebelum desain merge."* This is the sanctioned exception to Gate B: the stub is a deliberate placeholder, not a groomed contract.
  - Keep it **Backlog**, not Blocked and not Ready: the design→feature link is a *grooming* dependency, **not** a `Depends on #N`, so no auto-promotion fires. (Optionally tag `menunggu-desain` so it reads as "don't pull.")
- **Backend-only deliverables** (no surface, Gate B N/A) are filed as a groomed `[Fitur]` straight away, **Ready**.
- **When a `[Desain]` lands, groom its stub from the merged mockup** — rewrite the `[Fitur]` body into a real contract (Gate B now satisfied; the schema falls out of what the UI serves), then move it Backlog → Ready. That's the follow-on `/ship-task` flags — a *groom* step on an existing issue, not a new file.
- Split by **deliverable, not module** — vertical `[Fitur]` slices, not per-layer DB/API/UI issues. (Don't reach for sub-issues to organize a feature by layer — that's the same [module-splitting](../../../plans/how-to/build-workflow.md#sub-issues--one-sanctioned-use), just hierarchical.)
- Each issue's `## Kenapa` cites the doc PR / section from step 2 — the trace back to the ratified decision.
- Set real dependencies *between deliverables* (`Depends on #N`); a dependent lands **Blocked**. (The design→feature ordering is **not** such a dependency — see above.)
- Some `[Diskusi]`s **update** existing issues rather than spawn new ones — edit those bodies instead.
- **Link every spawned task — designs and feature stubs alike — as a sub-issue of the `[Diskusi]`** (flat siblings, never design-over-feature). This is the [one sanctioned use of sub-issues](../../../plans/how-to/build-workflow.md#sub-issues--one-sanctioned-use); the "Auto-add sub-issues" workflow lands each child on the board. `gh` has no sub-issue command yet, so use the GraphQL mutation with each issue's node id:
  ```bash
  PARENT=$(gh issue view <diskusi-n> --json id --jq .id)    # the [Diskusi]
  CHILD=$(gh issue view <task-n> --json id --jq .id)         # the new [Desain]/[Fitur]
  gh api graphql -f query='mutation($p:ID!,$c:ID!){addSubIssue(input:{issueId:$p,subIssueId:$c}){issue{number}}}' -f p="$PARENT" -f c="$CHILD"
  ```

## 4. Curate, then close the [Diskusi]

- Flip the `[Desain]` explorations (and any backend `[Fitur]`) **Proposed → Ready**, keeping **Ready short (~6)** — park overflow in **Backlog**. Only the maintainer flips into Ready ([who curates](../../../plans/how-to/build-workflow.md#who-curates--the-one-authority-rule)). The UI-bearing `[Fitur]` **stubs** stay in **Backlog** — they reach Ready only once their `[Desain]` lands and they're groomed from the mockup (§3). The item-edit call and every option id are in the [Board reference](../../../plans/how-to/build-workflow.md#board-reference).
- **Close the `[Diskusi]`** with a comment linking the doc PR — the sub-issue links from step 3 already carry the task lineage, so the comment is a human-readable backstop, not the only thread:

```bash
gh issue close <n> --comment "Diratifikasi di <doc-PR-url>. Task turunan: #<a>, #<b>, … (tertaut sebagai sub-issue)."
```

  Closing now is fine — every spawned task is already linked, so the progress bar shows the full decided scope from day one. (If a design later reveals a feature nobody foresaw, **sub-issues can be added to a closed parent**, so link it then too.)

  **Leave the board item in place — closed, not archived**, per the [ratification gate](../../../plans/how-to/build-workflow.md#the-ratification-gate-vision--requirements--roadmap-changes). Don't `gh project item-archive` it. (Project #8's "Item closed" and auto-archive workflows are **disabled**, so closing won't move or remove it — if a maintainer ever enables one, flag that rather than working around it.)

Then report: the doc PR, each spawned/updated issue with its Status, and confirm the `[Diskusi]` is closed (and still on the board).
