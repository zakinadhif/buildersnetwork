---
name: ratify
description: Turn a decided Proposed [Diskusi] GitHub issue into durable plans documentation, linked board tasks, and a closed discussion. Use when ratifying, accepting, or turning a decided discussion into tasks.
---

# Ratify a decision

This is a maintainer workflow. Write issues and documentation prose in Bahasa Indonesia.

## Authorization gate

Before changing any external or repository state, obtain the user's **explicit authorization to ratify**. A request to audit, investigate, resolve questions, recommend, prepare, or draft is **not** authorization to ratify.

State the concrete decision and ask whether the user wants ratification, including that it will write durable documentation, create or update GitHub issues and board items, and close the `[Diskusi]`. Do not create or switch branches, edit documentation, push or open a PR, create/update/close issues, change the board, or link sub-issues until the user clearly agrees. Never infer this authority from repository ownership, GitHub login, or the ability to execute the commands.

An explicit request such as `$ratify #N`, “ratify #N”, or “turn this decided discussion into tasks” satisfies this gate.

1. Identify the Proposed `[Diskusi]`, read its complete thread with `gh issue view <number> --comments`, and confirm it contains a concrete decision about requirements, roadmap, milestone scope, or a chosen design direction. Do not ratify open-ended debate.
2. Put the decision in the durable source of truth first. Make a focused PR updating `plans/vision.md`, `plans/reference/requirements.md`, `plans/roadmap.md`, or the appropriate `plans/milestones/<name>.md`. A new milestone needs why, decisions, and exit criteria. Capture the PR URL.
3. Decompose through `$new-task`:
   - Create a `[Desain]` item for each non-trivial new surface.
   - Create UI `[Fitur]` placeholders in Backlog with a minimal `Kenapa`, the document PR citation, and “menunggu desain #N; jangan di-groom/mulai sebelum desain merge.” These are intentionally ungroomed, not Blocked.
   - Create backend-only `[Fitur]` items as complete Ready contracts.
   - Use real `Depends on #N` only between deliverables; update existing issues when appropriate.
   - Link every spawned issue as a flat sub-issue of the `[Diskusi]` using the GitHub GraphQL `addSubIssue` mutation documented in `plans/how-to/build-workflow.md`.
4. Curate: place immediately buildable design/backend items in Ready only if the shortlist remains short; keep UI feature placeholders in Backlog. Close the discussion with a comment that links the docs PR and child issues. Leave its board item unarchived.

Report the docs PR, each created or updated issue and Status, and confirmation that the discussion closed. When a linked design later merges, groom its feature placeholder from the mockup before moving it toward Ready.
