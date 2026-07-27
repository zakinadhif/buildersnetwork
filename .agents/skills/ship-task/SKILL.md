---
name: ship-task
description: Verify and ship a claimed task by pushing its branch, creating a closing pull request, and moving its project item to In Review; after merge, reconcile Done and surface newly actionable dependents. Use when task work is complete, shipping, submitting, opening a PR, or reconciling a merged task.
---

# Ship a claimed task

1. Identify the issue from the `task/<number>-…` branch or ask the user. Re-read its acceptance criteria with `gh issue view <number>`, run its required validation, and confirm every criterion is met. Compare `git diff main --stat` with the Touch boundary; flag out-of-bound changes before shipping. Do not ship a red or incomplete task.
2. Run the idempotent ship command only after validation passes. It pushes the branch, creates or reuses a closing PR, and moves the item to In Review:

```bash
pnpm workflow ship <number> --verified --summary "<concise reviewer summary>"
```

3. Report the PR URL and that merge remains the maintainer's decision. Do not perform post-merge work before the merge exists.
4. After merge, run `pnpm workflow reconcile <number>`. It proves the closing PR merged, repairs Done, reports newly unblocked dependents for maintainer curation, and identifies `[Fitur]` placeholders that need grooming from a merged `[Desain]`. Promote nothing automatically.
