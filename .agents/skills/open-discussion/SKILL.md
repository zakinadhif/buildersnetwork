---
name: open-discussion
description: Open a Bahasa Indonesia Proposed [Diskusi] GitHub issue for an unresolved product, architecture, scope, sequencing, or design decision. Invoke only when the user explicitly asks to open, create, file, or publish a discussion, or explicitly invokes `$open-discussion` with publication intent. Do not invoke for advice, brainstorming, trade-off exploration, rough concerns, drafting, articulation, review, or ordinary questions.
---

# Open a discussion

Act as the developer's mouthpiece, not the decision-maker. Preserve uncertainty and intent; never invent agreement, evidence, or a preferred option.

Before doing anything else, confirm that the user explicitly requested publication of a discussion. If that authority is absent, stop using this skill and handle the request as ordinary conversation. Do not produce a formal discussion draft merely because the subject is unresolved.

1. Read `plans/how-to/build-workflow.md`, then inspect the relevant plans, code, Git history, issues, or mockups before asking the developer to explain context the repository can answer.
2. Route the publication request before drafting:
   - Reproducible defect → explain that it belongs in `$new-task` as `[Bug]`; do not open a discussion unless the user explicitly maintains that request after the distinction.
   - Already-decided, grounded deliverable → explain that it belongs in `$new-task` as `[Fitur]` or `[Desain]`; do not open a discussion unless the user explicitly maintains that request after the distinction.
   - Broad vision input without a concrete decision question → propose a comment for pinned issue #12 and obtain confirmation before publishing it.
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

6. Treat the explicit request to open, create, file, or publish as authority to create the issue and place it in Proposed. If publication would require materially inferring the developer's stance, show the draft and obtain confirmation first. Never ratify, create implementation tasks, or move the item to Ready from this skill.
7. Create and place the issue:

```bash
gh issue create --title "[Diskusi] <Area>: <brief>" --body "<body>"
pnpm workflow place <number> Proposed
```

If creation succeeds but placement fails, rerun only `pnpm workflow place <number> Proposed`. Report the issue number, URL, and Proposed status. The discussion remains open until its thread reaches a concrete decision and the maintainer explicitly invokes `$ratify`.
