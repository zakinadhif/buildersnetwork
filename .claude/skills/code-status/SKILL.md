---
name: code-status
description: Audit the code against what a milestone doc says it should be — classify every scope item Done/Partial/Missing/Divergent with file evidence, cross-reference the board, propose tasks for the gaps, and judge exit readiness. Use for "code status", "audit <milestone>", "is the code where the docs say it is", "what's left to build for <milestone>", "check the milestone against the code", or "is <milestone> ready to close".
---

# /code-status — what's *true*, measured against what's *written*

The mirror of [`/project-status`](../project-status/SKILL.md). That skill reports **what we believe** — the board and the GitHub milestones. This one reports **what's true** — the repo — measured against one milestone's written target.

It exists because every doc in `plans/` carries the same disclaimer — *"non-authoritative working knowledge — trust the code when they diverge"* — and until now nothing ever went and checked. Issue counts measure board hygiene, not code reality: a milestone can read 90% done while its exit criterion is unmet. This skill is the third vertex — **docs/board ↔ code** — and the way divergence gets detected at all.

**Boundary — read this first.** This skill is **read-only**. It **proposes, never files**: no `gh issue create`, no board mutation, no edit to `plans/`. It **measures distance to written scope, never invents scope** — the milestone doc is the target, and code doing something the doc doesn't sanction is a *finding*, not a feature. The one sanctioned write-adjacent act is §7's opt-in offer, and only on the user's explicit yes.

**Scope is one milestone**, not the whole roadmap — that's what keeps the audit session-sized and precise. "Where's the whole phase?" = run this down the roadmap order, one milestone at a time.

## 1. Load the target

Take the milestone from the argument; if none was given, ask which (offer the **active** one from [`plans/roadmap.md`](../../../plans/roadmap.md)). Then read, in this order:

- **`plans/milestones/<name>.md`** — its **Scope** bullets, **Decisions**, and **Exit** criterion. **This is the target.** Everything downstream is measured against it and nothing else.
- **`plans/roadmap.md`** — the milestone's row (treatment, FR mapping) and the *"Where the code actually is today"* table: the last recorded grounding pass, and your baseline for what's changed since.
- The milestone's issues, open and closed — closed ones tell you what *should* already be in the code:

```bash
gh issue list --milestone "<title>" --state all --json number,title,state \
  --jq '.[] | "\(.state)\t#\(.number)\t\(.title)"'
```

The doc's **treatment** ([hero / dark / deferred](../../../plans/how-to/build-workflow.md#scope-treatments--how-much-a-feature-gets-right-now)) sets the bar you audit against. A **dark** surface that is thin is **Done**, not Partial — thin is the spec. Only a **hero** surface owes polish, empty states, and error copy. Grading a walking skeleton as if it were the hero manufactures fake gaps.

## 2. Audit the repo against each scope item

For every **Scope** bullet and every **Decision with a code consequence**, go read the actual code. Classify with the vocabulary the roadmap table already uses:

| Class | Means |
|---|---|
| **Done** | Implemented as the doc describes. |
| **Partial** | Started, incomplete — say exactly what's missing. |
| **Missing** | No trace in the code. |
| **Divergent** | Code exists and does something the doc doesn't sanction. |

**No claim without a path.** Every classification carries file-path evidence — `"sidebar shell: Done — apps/app/src/components/Shell.tsx, every logged-in route wraps in it (App.tsx:52)"`. A verdict you can't point at is a guess, and a guess in this report is worse than no report. Verify paths against the repo as you go; the docs' own examples go stale (they cite `apps/web/`; the app is `apps/app/`).

## 3. Cross-reference the board

For each **non-Done** item, ask whether an open issue on the milestone already covers it:

- **Scope orphan** — a gap with **no** covering issue → becomes a task proposal in §4. These are the ones the board is blind to.
- **Covered** — an open issue already owns it → name it (`covered by #N`), propose nothing.
- **Stale issue** — an open issue whose scope the code **already satisfies** → recommend closing it.

## 4. Propose tasks for the gaps — pre-routed through the gates

The actionable half of the report. For each scope orphan, draft a ready-to-file task whose **tag is determined by the gap type**, mirroring the [issue-creation gate](../../../plans/how-to/build-workflow.md#the-issue-creation-gate):

| Gap type | Tag | Why |
|---|---|---|
| Missing/Partial; a mockup exists in `apps/mockups/`, **or** the surface is trivial / backend-only | **`[Fitur]`** | Both gates pass: the milestone doc grounds it (Gate A by construction), the mockup grounds the surface (Gate B). |
| Missing; a **non-trivial user-facing surface** with **no mockup** in `apps/mockups/` | **`[Desain]`** | Gate B would block a `[Fitur]`. Design leads, the feature follows and is groomed from the merged mockup. |
| **Divergent** | **`[Diskusi]`** | Keep-or-replace is a *decision*, not a build task. **Never** auto-suggest building over a divergence. |

Each suggestion carries a draft title (`[Tag] <Area>: <brief>` — [title shape](../../../plans/how-to/build-workflow.md#issue-title-tags), body language Bahasa Indonesia per house convention) and the milestone-doc section its `## Kenapa` would cite. Render the whole audit as one table:

| Scope item | Class | Evidence | Board | Proposal |
|---|---|---|---|---|
| … | Partial | `apps/app/src/pages/X.tsx` — no empty state | covered by #21 | — |
| … | Missing | no route, no component | **orphan** | `[Desain] <Area>: …` |

**Then stop and ask.** End the section with: *"file these via `/new-task`? (y/n per item)"*. On a yes, hand each accepted item to [`/new-task`](../new-task/SKILL.md), which owns the gate, `gh issue create`, the board-add, and the Status — so maintainer Ready-curation stays intact. **This skill never runs `gh issue create` itself.**

## 5. Exit readiness

Break the milestone doc's **Exit** paragraph into its individual clauses — it's usually one sentence carrying three or four separable promises. Mark each **met / unmet**, with file evidence:

```
Exit — 3/4 clauses met
  ✓ new user lands on the home without the AI chat gate — App.tsx:77 → /mulai (MinimalStart), not /onboarding
  ✗ home renders the curated feed — Partial: Launchpad.tsx has featured+feed, Spotlight card unbuilt (#21)
```

A milestone closes when its **exit** passes, never when its issue count hits zero ([workflow](../../../plans/how-to/build-workflow.md#the-three-units)) — so this section, not `/project-status`'s percentage, is the honest read on "can we close it?". It's also the section a future `/close-milestone` will consume.

## 6. Next line

One actionable sentence, same convention as `/project-status`: *"file the 2 proposed tasks"*, *"close stale #N — the code already does it"*, *"exit met — close the milestone"*, or *"divergence found — raise a `[Diskusi]` before building over it"*.

## 7. The one write, and it's opt-in

The roadmap's *"Where the code actually is today"* table is a hand-written grounding pass that rots with every merged PR — and this audit has just re-derived it. If the audit contradicts that table, **offer** to refresh it **as a PR** (docs are code here — decisions merge via diff), and only on the user's explicit yes. Never edit it silently, never edit anything else in `plans/`, and never treat this offer as licence to fix up the milestone doc: if the *doc* is wrong rather than the code, that's a **`[Diskusi]`**, not a cleanup commit.
