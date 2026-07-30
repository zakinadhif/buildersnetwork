# Content model — post, feed, karya page & articles

*Part of the [Roadmap](../roadmap.md). Requirements: [requirements.md](requirements.md) · Vision: [vision.md](../vision.md). Non-authoritative working knowledge — trust the code when they diverge.*

**Status: ratified 2026-07-03** via `[Diskusi]` [#13](https://github.com/zakinadhif/buildersnetwork/issues/13), with the P0 entity boundary refined via `[Diskusi]` [#139](https://github.com/zakinadhif/buildersnetwork/issues/139). This is the architectural spine for how content surfaces relate; the milestone docs that touch content (Launchpad, karya pages, microblog, articles) inherit it.

## The decision: A — page is the destination, feed is activity *about* it

The load-bearing distinction is **event vs. state**:

- A **feed** carries **events** — small, timestamped, append-only ("this happened").
- A **page** carries **state** — rich, composed, editable ("the current best representation of a thing").
- An **article** is a third shape — long-form authored *state* by a person, not a karya.

The rule that resolves how they interact:

> **The feed never contains pages. It contains _events that point at_ pages.**

Chosen over B (*everything is a post; a page is a filtered feed* — kills the rich-canvas vision) and C (*two separate features with two comment systems* — detaches the feed from real work and doubles the content model). A is the only option that honors the rich-page vision, keeps the feed a river of real karya progress (retention), absorbs articles cleanly, and matches the grain the schema is already cut along.

## What this means concretely

- **The karya page is a crafted destination** — the eventual creative canvas (rich text → images → polls). Today it's only metadata + a plain-text update stream; the canvas is a later *invested* layer (it stays a walking skeleton until then — see [scope treatments](../how-to/build-workflow.md#scope-treatments--how-much-a-feature-gets-right-now)).
- **A `post` is the event unit that bridges the two.** It's authored on a karya, shows on that karya page's timeline, **and** surfaces in the home feed as a teaser linking back. This is already what the schema does: `posts.karyaId` + the dual read (karya stream / global feed) in `libs/db/src/schema/app.ts` (DECISION-D).
- **The home feed** = curated destinations (`featured` karya) + the event river (posts). Unchanged in shape; what changes is that we stop conflating "page" and "feed item".
- **Articles** = another kind of page whose *publish* is a feed event. No separate feed machinery.
- **Comments** (FR-21) attach to the **event** (the update) first — where conversation lands naturally — with page-level comments as a later add. **One** comment system, not two.
- **Polls** are the heaviest creative-canvas piece (need their own votes entity: options + one-vote-per-user + tallies) → the *last* layer, not the first.

## P0 entity boundary

For P0, a post is deliberately closer to a tweet than to a typed content block. It has no title, headline, or `kind`; the body carries the update in the author's own words. A post remains karya-owned, so `karyaId` stays required until the separate microblog question is decided.

```text
Post = id, karyaId, authorId, body, createdAt
```

Comments are separate authored records attached to posts:

```text
Comment = id, postId, authorId, body, createdAt
```

Keeping the entities separate preserves their different authorization, query, and lifecycle rules. P0 supports only first-layer comments: no `parentCommentId`, threading, replies-to-replies, reactions, likes, or notifications. If nesting later earns scope, `Comment` can gain a nullable self-reference without turning posts and comments into one generic content table.

Collaboration state is neither a post type nor a karya lifecycle stage. P0 therefore has no availability, opening, match, recommendation, or event-scope entity. The implemented `matches` persistence and routes are scope leakage to remove, while profile skills and interests remain useful profile data. The future collaboration shape and its cardinalities remain undecided in Proposed discussion [#140](https://github.com/zakinadhif/buildersnetwork/issues/140).

## Deliberately still open (not blocking A)

- **Must a post always belong to a karya?** Today `posts.karyaId` is `NOT NULL`. Allowing **personal posts** (a builder musing, untethered) is the microblog seed (FR-35) and the one place A needs a small extension — make `karyaId` nullable, or add a separate personal-post path. Decided when microblog is groomed — live discussion in [#15](https://github.com/zakinadhif/buildersnetwork/issues/15).
- **Article priority** (Phase 1 vs 2) and its data shape — deferred to its own milestone.
