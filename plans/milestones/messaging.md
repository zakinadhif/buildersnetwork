# Milestone: Messaging

*Part of the [Roadmap](../roadmap.md). PRD: [al-fath-berkarya-prd.md](../al-fath-berkarya-prd.md) · Vision: [al-fath-berkarya-vision.md](../al-fath-berkarya-vision.md). Non-authoritative working knowledge — trust the code when they diverge.*

**Tasks & status:** on GitHub once groomed (no GitHub milestone yet). This doc holds only the why, the decisions, and the exit — never the task list.

## Why

The connect action that closes the loop (FR-31, FR-32): basic async 1:1 DMs, with "request to join" + "message" as *the* connect actions across the app. Matchmaking without messaging is a dead end.

## Decisions

- New `messages` table; plain async 1:1 — no realtime, no group chats (P0 scope).
- Success metric: *messages sent*, *teammate matches*.

## Exit

Badge → DM → conversation works end to end.
