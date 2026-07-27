---
name: code-status
description: Audit one milestone's implementation against its written scope. Classify scope as Done, Partial, Missing, or Divergent with file evidence; cross-reference GitHub issues; propose correctly routed tasks; and judge exit readiness. Use for code status, milestone audits, what remains to build, or whether a milestone can close.
---

# Audit milestone implementation

Perform a read-only audit. Never edit code, plans, issues, or the project board; propose work but do not file it. Measure one milestone at a time and do not invent scope.

1. If no milestone was named, ask the user to choose one and offer the active milestone from `plans/roadmap.md`.
2. Read `plans/milestones/<name>.md` (Scope, Decisions, Exit), then its roadmap row (treatment and FR mapping), then all of its GitHub issues:

```bash
gh issue list --milestone "<title>" --state all --json number,title,state --jq '.[] | "\(.state)\t#\(.number)\t\(.title)"'
```

3. Discover the current app entry and router from `apps/app/package.json` and `apps/app/src/`, then map the route-to-surface critical path before evaluating scope bullets. Do not assume a fixed router filename. For each reachable surface on the milestone's exit path or hero funnel, inspect mockup grounding, shared design-system use, rapid-development drift (off-scale literals, missing shell, missing empty/error states), and relevant code.
4. Classify every Scope item, every Decision with a code consequence, and every flagged surface as:

| Class | Meaning |
|---|---|
| Done | Implemented as specified. |
| Partial | Present but incomplete; state what is missing. |
| Missing | No implementation evidence. |
| Divergent | Implemented in a way the milestone does not sanction. |

Give a verified file path for every finding. Treat a dark surface's intended thinness as Done. A hero must be polished along its critical path and funnels, not merely at its named route.

5. Cross-reference every non-Done result with open milestone issues. Mark it covered, stale, or an orphan. Render one table with Scope item, Class, Evidence, Board, and Proposal.
6. Draft but do not create orphan tasks. Use `[Fitur]` for missing/partial work grounded by a mockup or trivial/backend work; `[Desain]` for a non-trivial unmocked surface; `[Diskusi]` for divergence. A systemic gap gets one `[Diskusi]`, not many near-duplicate issues. Draft titles and body language in Bahasa Indonesia and cite the milestone section. End by asking which proposals to file through `$new-task`.
7. Split the Exit criterion into clauses and mark each met or unmet with evidence. Finish with one highest-leverage next action. If documentation is stale, report it as a finding rather than correcting it.
