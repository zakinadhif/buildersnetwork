---
name: ratify
description: Turn an open, decided, Proposed [Diskusi] GitHub issue into a merge-gated documentation PR and linked Backlog tasks; the PR closes the discussion when merged. Use only when a maintainer explicitly invokes ratify with an issue number.
---

# Ratify a decision

This is a maintainer workflow. Write issues and documentation prose in Bahasa Indonesia.

## Authorization gate

Before changing any external or repository state, obtain the user's **explicit authorization to ratify a numbered discussion**. A request to audit, investigate, resolve questions, recommend, prepare, or draft is **not** authorization to ratify.

State the concrete decision and ask whether the user wants to ratify `[Diskusi]` #N, including that it will open a merge-gated documentation PR and create or update linked Backlog tasks. Do not create or switch branches, edit documentation, push or open a PR, create/update issues, change the board, or link sub-issues until the user clearly agrees. Never infer this authority from repository ownership, GitHub login, or the ability to execute the commands.

Only an explicit request such as `$ratify #N` or “ratify #N” satisfies this gate.

1. Read issue #N and its complete thread with `gh issue view <number> --comments`. Require an **open** issue whose title starts `[Diskusi]`, whose board status is **Proposed**, and whose thread contains a concrete decision about requirements, roadmap, milestone scope, or a chosen design direction. The original issue may have been articulated through `$open-discussion`, but its draft question is not itself a decision. Stop without mutation if any condition fails or debate remains open.
2. Put the decision in the durable source of truth first. Make a focused PR updating `plans/vision.md`, `plans/reference/requirements.md`, `plans/roadmap.md`, or the appropriate `plans/milestones/<name>.md`. A new milestone needs why, decisions, and exit criteria. Put `Closes #N` in the PR body so merging the documentation is the atomic ratification event. Never close the discussion directly.
3. Decompose through `$new-task`:
   - Create a `[Desain]` item for each non-trivial new surface.
   - Create UI `[Fitur]` placeholders in Backlog with a minimal `Kenapa`, the document PR citation, and “menunggu desain #N; jangan di-groom/mulai sebelum desain merge.” These are intentionally ungroomed, not Blocked.
   - Create backend-only `[Fitur]` items as complete contracts.
   - Use real `Depends on #N` only between deliverables; update existing issues when appropriate.
   - Link every spawned issue as a flat sub-issue of the `[Diskusi]` with `pnpm workflow link-subissue <diskusi-number> <child-number>`. It checks the existing relationship before mutating and is safe to rerun.
4. Keep every spawned item in Backlog while the documentation PR is open. Comment on the discussion with links to the PR and child issues, but leave it open and Proposed. After the PR merges and GitHub closes the discussion, the maintainer may curate immediately buildable design/backend items into Ready; UI feature placeholders awaiting design stay Backlog. Leave the discussion's board item unarchived.

Report the docs PR, each created or updated issue and Status, and that the discussion remains open until the PR merges. When a linked design later merges, groom its feature placeholder from the mockup before moving it toward Ready.
