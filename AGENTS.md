# Repository guidance

## `plans/` is working knowledge

Treat the `plans/` directory as a loose collection of vision documents, copy drafts, design references, domain concepts, how-to guides, and implementation plans. It is a workspace for thinking about the project, not a source of truth.

- Treat `plans/` content as non-authoritative. When it conflicts with code, configuration, or Git history, trust the implementation.
- When a task changes the correctness of a `plans/` file referenced in the task, update that file before completing the task.
- Do not write task lists or live status into `plans/` files.

## Team workflow

Follow `plans/how-to/build-workflow.md`: milestone documents in `plans/milestones/` hold intent (why, decisions, exit criteria); GitHub Issues hold task contracts; the GitHub Project board holds live status. Use `open-discussion` and `ratify` for the decision loop; use `new-task`, `project-status`, `pick-task`, and `ship-task` for the task loop.

## Claude Code compatibility

`AGENTS.md` and `.agents/skills/` are the canonical agent configuration. Run `pnpm sync:agent-config` (also run by `pnpm install`) to generate the equivalent Claude Code files. Do not edit `CLAUDE.md` or `.claude/skills/` directly.

## Windows / Codex toolchain

This repo expects Node `>=24` and pnpm `11.9.0` (`packageManager` in `package.json`). In the Codex desktop app, the sandbox may prepend Codex's bundled Node/pnpm instead of the host toolchain. On Windows this is especially easy to hit when the project uses fnm: a sandboxed `pnpm install` can fail with `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY` or leave workspace links incomplete. See the upstream reference: [Codex issue #30440 — Codex uses bundled pnpm instead of host toolchain](https://github.com/openai/codex/issues/30440).

Before installing or validating, run the command in the host/elevated PowerShell environment so the fnm profile is loaded, then verify:

```powershell
node --version # v24.x
pnpm --version # 11.9.0
Get-Command node, pnpm -All | Select-Object Name, Source
```

If resolution points into `.cache\\codex-runtimes`, stop using that shell for pnpm and switch to the host environment. Repair the workspace with `pnpm install --frozen-lockfile`; do not update the lockfile or use a different pnpm major. If a sandboxed attempt already removed links, `pnpm install --frozen-lockfile --ignore-scripts` is a safe first repair, followed by `pnpm sync:agent-config`.

For Playwright, do not reuse an occupied default port that may belong to another checkout. Use a clean port and disable server reuse, for example:

```powershell
$env:PLAYWRIGHT_PORT = "5187"
$env:CI = "true"
pnpm --filter app exec playwright test e2e/entry.spec.ts
```

## CI-aligned validation

Before pushing, run the same validation commands that the CI runs.
