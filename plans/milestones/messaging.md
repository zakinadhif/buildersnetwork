# Milestone: Messaging

*Part of the [Roadmap](../roadmap.md). Requirements: [requirements.md](../reference/requirements.md) · Vision: [vision.md](../vision.md). Non-authoritative working knowledge — trust the code when they diverge.*

**Tasks & status:** on GitHub once groomed (no GitHub milestone yet). This doc holds only the why, the decisions, and the exit — never the task list.

## Why

The connect action that closes the loop (FR-31, FR-32): basic async 1:1 DMs, with "request to join" + "message" as *the* connect actions across the app. Matchmaking without messaging is a dead end.

**Priority: P1** (per the [roadmap](../roadmap.md)). The ruthless shrink moved it out of P0: it only earns its polish once matchmaking — its reason to exist — is validated, and matchmaking is itself P1 now.

## Decisions

- New `messages` table; plain async 1:1 — no realtime, no group chats (kept minimal even when it lands).
- Success metric: *messages sent*, *teammate matches*.

## Exit

Badge → DM → conversation works end to end.
