# Repository guidance

## `plans/` is working knowledge

Treat the `plans/` directory as a loose collection of vision documents, copy drafts, design references, domain concepts, how-to guides, and implementation plans. It is a workspace for thinking about the project, not a source of truth.

- Treat `plans/` content as non-authoritative. When it conflicts with code, configuration, or Git history, trust the implementation.
- When a task changes the correctness of a `plans/` file referenced in the task, update that file before completing the task.
- Do not write task lists or live status into `plans/` files.

## Team workflow

Follow `plans/how-to/build-workflow.md`: milestone documents in `plans/milestones/` hold intent (why, decisions, exit criteria); GitHub Issues hold task contracts; the GitHub Project board holds live status. Use the workspace skills `project-status`, `pick-task`, and `ship-task` for the normal task loop.

## Claude Code compatibility

`AGENTS.md` and `.agents/skills/` are the canonical agent configuration. Run `pnpm sync:agent-config` (also run by `pnpm install`) to generate the equivalent Claude Code files. Do not edit `CLAUDE.md` or `.claude/skills/` directly.
