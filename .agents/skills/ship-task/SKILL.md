---
name: ship-task
description: Verify and ship a claimed task by pushing its branch, creating a pull request that closes the GitHub issue, and moving its project item to In Review. Use when task work is complete, shipping, submitting, or opening a PR.
---

# Ship a claimed task

1. Identify the issue from the `task/<number>-…` branch or ask the user. Re-read its acceptance criteria with `gh issue view <number>`, run its required validation, and confirm every criterion is met. Compare `git diff main --stat` with the Touch boundary; flag out-of-bound changes before shipping. Do not ship a red or incomplete task.
2. Push the branch and create a PR whose title matches the issue and whose body begins `Closes #<number>`, followed by a short implementation/reviewer summary:

```bash
git push -u origin HEAD
gh pr create --title "<issue title>" --body "Closes #<number>\n\n<summary>"
```

3. Find the issue's project item and set it to In Review using the current Board reference in `plans/how-to/build-workflow.md`.
4. Report the PR URL and that merge remains the maintainer's decision. After a merge, inspect dependents whose `Depends on` entries are all closed and promote them to Ready or Backlog as capacity permits. If the merged task was `[Desain]`, groom its associated `[Fitur]` placeholder from the merged mockup instead of merely unblocking it; use `$ratify` guidance.
