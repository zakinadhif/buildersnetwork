---
name: open-discussion
description: Turn a developer's rough concern, observation, product tension, or unanswered question into a clear Bahasa Indonesia discussion draft or an open Proposed [Diskusi] GitHub issue. Use when someone needs help articulating reasoning, exploring trade-offs, challenging current direction, drafting a decision question, or opening/publishing a discussion before ratification.
---

# Articulate and open a discussion

Act as the developer's mouthpiece, not the decision-maker. Preserve uncertainty and intent; never invent agreement, evidence, or a preferred option.

1. Read `plans/how-to/build-workflow.md`, then inspect the relevant plans, code, Git history, issues, or mockups before asking the developer to explain context the repository can answer.
2. Route the input before drafting:
   - Reproducible defect → recommend `$new-task` as `[Bug]`.
   - Already-decided, grounded deliverable → recommend `$new-task` as `[Fitur]` or `[Desain]`.
   - Broad vision input without a concrete decision question → draft a comment for pinned issue #12; publish it only on explicit request.
   - Concrete unresolved product, architecture, scope, sequencing, or design question → continue as `[Diskusi]`.
3. Ground the discussion in current reality. Cite affected code, current documentation, user feedback supplied by the developer, or a visible mismatch. A `[Diskusi]` may challenge existing plans; the proposed direction does not need prior approval.
4. Elicit only meaning that evidence cannot supply. Ask at most one focused question at a time. Separate:
   - verified observations;
   - the developer's interpretation or preference;
   - assumptions that need validation;
   - the decision maintainers must make.
   If the input and repository already answer these, draft without interrogation.
5. Write the title as `[Diskusi] <Area>: <brief>` and the body in Bahasa Indonesia using exactly:

```markdown
## Konteks

## Yang diamati

## Mengapa ini penting

## Pertanyaan keputusan

## Opsi dan trade-off

## Batas keputusan

## Bukti terkait
```

Frame one answerable decision question. Include only supported options; label agent-suggested alternatives as suggestions rather than the developer's position. Keep implementation tasks and acceptance criteria out of the discussion.

6. Respect publication authority:
   - “Help articulate,” “draft,” “explore,” or “review” → return a draft only; mutate nothing.
   - “Open,” “create,” “file,” or “publish the discussion” → authorization to create the issue and place it in Proposed.
   - If publication would require materially inferring the developer's stance, show the draft and obtain confirmation first.
   - Never ratify, create implementation tasks, or move the item to Ready from this skill.
7. When authorized, create and place the issue:

```bash
gh issue create --title "[Diskusi] <Area>: <brief>" --body "<body>"
pnpm workflow place <number> Proposed
```

If creation succeeds but placement fails, rerun only `pnpm workflow place <number> Proposed`. Report the issue number, URL, and Proposed status. The discussion remains open until its thread reaches a concrete decision and the maintainer explicitly invokes `$ratify`.
