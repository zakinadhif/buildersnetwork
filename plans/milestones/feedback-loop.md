# Milestone: Feedback loop — the community's response

*Part of the [Roadmap](../roadmap.md). Requirements: [requirements.md](../reference/requirements.md) · Vision: [vision.md](../vision.md). Non-authoritative working knowledge — trust the code when they diverge.*

**Tasks & status:** on GitHub once groomed (no GitHub milestone yet). This doc holds only the why, the decisions, and the exit — never the task list.

## Why

The P0 core loop is *create karya → post → **community responds** → post again*, and "responds" needs a channel. Today a post is a broadcast: authored, displayed, and then nothing comes back. A post is a whole object only through its first layer of response — so the feedback/validation channel (FR-42), and the comments (FR-21) that power it, are **P0**, not fast-follow.

This is also the [vision](../vision.md)'s validation promise: a karya page is where builders meet their *early users* and collect honest feedback at every stage — from conception through active building. Without it, the platform hosts work but never helps it get better, and the "%" who post a *second* update — the flywheel's leading indicator — has nothing pulling it.

## Decisions

- **Comments attach to the post (the event), not the karya page.** This follows the ratified [content-model](../reference/content-model.md): *the feed carries events that point at pages*, and conversation lands naturally on the update. **One** comment system, not two. Page-level (whole-karya) feedback is a later add on the same system — not a second one.
- **The first layer only.** Comments on a post, visible on the karya page's timeline and on the feed teaser. Deliberately *above* the line and therefore **P1**: likes (FR-20), threading, replies-to-replies, notifications, reactions. This is what keeps the P0/P1 boundary principled rather than re-cut later as if it were arbitrary.
- **Any community member can respond**, not just karya members (FR-42) — unlike posting, which stays member-only (FR-18). The authz asymmetry is the point: the channel exists to bring the *wider* community in.
- **Post and Comment stay separate.** The minimum records are `Post = id, karyaId, authorId, body, createdAt` and `Comment = id, postId, authorId, body, createdAt`. P0 does not add `parentCommentId`; if nesting later earns scope, it is a nullable self-reference on `Comment`, not a reason to merge both entities.

## Open decisions (settle at grooming)

- **Surface treatment** — needs a `[Desain]` before the `[Fitur]` is groomed (Gate B): how first-layer comments render on the karya timeline, and what (if anything) the feed teaser shows about them.
- **Page-level feedback** — whether the "validation channel" needs a whole-karya entry point in P0, or whether comments-on-posts alone satisfy FR-42's early-user loop. Lean: posts alone; revisit after real use.
- **Moderation** — the repo has no moderation surface at all (see [retro](../archive/retro.txt), *Admin / moderation UI*). A comment channel is the first place that gap bites, since it's the first content non-members can author. Decide the minimum (author-delete? owner-remove?) at grooming; don't build a moderation system.

## Exit

A community member who is *not* on a karya leaves a comment on one of its update posts; the comment is visible on the karya page's timeline; the karya's members can see and reply to it. Server-side authz is exercised by a test (the wider-community-can-comment / only-members-can-post asymmetry), per the repo's authz-suite convention.
