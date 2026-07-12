# CLAUDE.md

## The `plans/` Folder

The `plans/` directory is a loose collection of project knowledge — vision docs, copy drafts, design references, domain concepts, how-to guides, and implementation plans. It is the workspace for thinking about the project, not a source of truth about it.

**Treat all content as non-authoritative.** These files are maintained informally and can fall out of date quickly. When a `plans/` file conflicts with the actual code, config, or git history, trust the code.

**Keep referenced files in sync.** When a file from `plans/` is referenced in a chat and a codebase change affects the correctness or validity of that file's content, update the file to reflect the change before closing out the task.

## Team workflow

Work is coordinated per `plans/how-to/build-workflow.md`: milestone docs in `plans/milestones/` hold intent (why/decisions/exit), GitHub Issues hold task contracts, and the GitHub project board holds live status. **Never write task lists or status into `plans/` files.** The repo skills `/project-status`, `/pick-task`, and `/ship-task` drive the loop.
