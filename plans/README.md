# `plans/` — how to read these docs

Each doc has exactly one job. Nothing describes the same thing at the same altitude twice.

## Precedence — who wins on divergence

When two sources disagree, the higher rung is right. State it once here so no individual doc has to defend its own authority.

1. **Code** — ultimate truth for what the app actually does.
2. **[GitHub issues](https://github.com/zakinadhif/buildersnetwork/issues)** — truth for what's being built *now* and what "done" means for it.
3. **[Milestone docs](milestones/)** — truth for why a chunk of work exists, what was decided, and its exit criterion.
4. **[Roadmap](roadmap.md)** — truth for the order of milestones, and therefore the schedule.
5. **[Vision](vision.md)** — truth for the product's why.
6. **[Reference](reference/)** ([requirements](reference/requirements.md), [content-model](reference/content-model.md), [user-flow](reference/user-flow.md)) — stable definitions and IDs, cited by everything above.

Rungs 1–2 are **live truth**; rungs 3–6 are non-authoritative working knowledge, maintained informally and quick to fall stale. **When a doc disagrees with the code, the code is right.**

## Routing — where to look

| Question | Doc |
|---|---|
| Why does this product exist? | [vision.md](vision.md) |
| When does X ship? | [roadmap.md](roadmap.md) — find the milestone that cites it, see where it sits |
| Why this chunk, what was decided, when is it done? | the milestone doc in [milestones/](milestones/) |
| What *is* capability FR-22 / NFR-1 / AI-3? | [reference/requirements.md](reference/requirements.md) |
| How does the domain work? | [reference/content-model.md](reference/content-model.md) |
| What does a user actually walk through? | [reference/user-flow.md](reference/user-flow.md) — the screens, routes, and the karya → post → feed loop |
| What do I build right now? | GitHub issues + the [project board](https://github.com/users/zakinadhif/projects/8) |
| How do we operate (workflow, previews, email)? | [how-to/](how-to/) |
| How do I add an API endpoint? | [how-to/adding-an-endpoint.md](how-to/adding-an-endpoint.md) — the OpenAPI-first contract and its two exceptions |
| What did we already do? | [archive/](archive/) — frozen sprint docs + [retro.txt](archive/retro.txt) |

## Two rules that keep it from rotting

**There is one "when" system.** Milestone ordering in the roadmap *is* the schedule. The requirements catalog is a schedule-free dictionary of capabilities cited by ID — it carries no phase tags. `P0` / `P1` appear only in the roadmap, as brackets over a run of ordered milestones, never stamped on individual requirements.

**There is no per-feature PRD layer.** A feature is the set of issues sharing a roadmap line; it needs no document of its own. Live status lives on the board, never in these files.
