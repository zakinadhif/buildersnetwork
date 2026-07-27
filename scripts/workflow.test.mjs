import assert from "node:assert/strict";
import { test } from "node:test";

import {
  claimTask,
  createContext,
  findBoardItem,
  isColdCompletable,
  issueNumber,
  linkSubissue,
  parseDependencies,
  placeTask,
  reconcileTask,
  setBoardStatus,
  shipTask,
  slugifyIssueTitle,
  WorkflowError,
} from "./workflow.mjs";

const completeBody = `## Kenapa
Grounded.

## Ruang lingkup
One vertical slice.

## Batas (touch / don't touch)
Touch the named files.

## Kriteria terima
- Tests pass.

## Di luar lingkup
Unrelated work.`;

function response(stdout = "", status = 0, stderr = "") {
  return { status, stdout, stderr };
}

function fakeContext(handler) {
  const calls = [];
  const logs = [];
  const ctx = createContext({
    log: (message) => logs.push(message),
    warn: (message) => logs.push(message),
    run: (command, args) => {
      calls.push([command, ...args]);
      return handler(command, args, calls);
    },
  });
  return { ctx, calls, logs };
}

test("issueNumber and slugifyIssueTitle normalize workflow identifiers", () => {
  assert.equal(issueNumber("#42"), 42);
  assert.equal(
    slugifyIssueTitle("[Fitur] Launchpad: Kartu aktivitas"),
    "launchpad-kartu-aktivitas",
  );
  assert.throws(() => issueNumber("0"), WorkflowError);
  assert.throws(() => issueNumber("12x"), WorkflowError);
});

test("parseDependencies deduplicates dependencies and cold-completable checks headings", () => {
  assert.deepEqual(
    parseDependencies("Depends on #12\nDepends on #9 and #12"),
    [12, 9],
  );
  assert.equal(isColdCompletable(completeBody), true);
  assert.equal(
    isColdCompletable(completeBody.replace("## Kriteria terima", "## Notes")),
    false,
  );
});

test("findBoardItem matches by issue number", () => {
  const item = { id: "item-1", content: { number: 8 } };
  assert.equal(findBoardItem([item], "8"), item);
  assert.equal(findBoardItem([item], 9), null);
});

test("setBoardStatus is idempotent", () => {
  const { ctx, calls } = fakeContext(() => response());
  assert.equal(
    setBoardStatus(ctx, { id: "item-1", status: "In Review" }, "In Review"),
    false,
  );
  assert.deepEqual(calls, []);
});

test("place repairs an existing board item without adding a duplicate", async () => {
  const issue = {
    id: "issue-42",
    number: 42,
    title: "[Bug] Launchpad: Perbaiki kartu",
    body: completeBody,
    state: "OPEN",
    url: "https://example.test/issues/42",
    assignees: [],
  };
  const item = {
    id: "item-42",
    status: "Backlog",
    content: { number: 42 },
  };
  const { ctx, calls } = fakeContext((command, args) => {
    const line = [command, ...args].join(" ");
    if (line.startsWith("gh issue view 42")) {
      return response(JSON.stringify(issue));
    }
    if (line.startsWith("gh project item-list")) {
      return response(JSON.stringify({ items: [item] }));
    }
    return response();
  });

  await placeTask(ctx, 42, "Blocked");
  assert.equal(
    calls.some((call) => call.join(" ").includes("gh project item-add")),
    false,
  );
  assert.equal(
    calls.filter((call) => call.join(" ").includes("gh project item-edit"))
      .length,
    1,
  );
});

test("claim repairs only the missing board transition when assignment and branch exist", async () => {
  const issue = {
    id: "issue-42",
    number: 42,
    title: "[Fitur] Launchpad: Kartu aktivitas",
    body: completeBody,
    state: "OPEN",
    url: "https://example.test/issues/42",
    assignees: [{ login: "zakinadhif" }],
  };
  const item = {
    id: "item-42",
    status: "Ready",
    assignees: ["zakinadhif"],
    content: { number: 42 },
  };
  const expectedBranch = "task/42-launchpad-kartu-aktivitas";
  const { ctx, calls } = fakeContext((command, args) => {
    const line = [command, ...args].join(" ");
    if (line.startsWith("gh issue view 42")) {
      return response(JSON.stringify(issue));
    }
    if (line.startsWith("gh project item-list")) {
      return response(JSON.stringify({ items: [item] }));
    }
    if (line === "gh api user --jq .login") return response("zakinadhif\n");
    if (line === "git status --porcelain") return response();
    if (line === "git branch --show-current") {
      return response(`${expectedBranch}\n`);
    }
    return response();
  });

  const result = await claimTask(ctx, 42);
  assert.equal(result.branch, expectedBranch);
  assert.equal(
    calls.some((call) => call.join(" ").includes("gh issue edit")),
    false,
  );
  assert.equal(
    calls.some((call) => call.join(" ").includes("git switch")),
    false,
  );
  assert.equal(
    calls.filter((call) => call.join(" ").includes("gh project item-edit"))
      .length,
    1,
  );
});

test("claim refuses a second In Progress task without explicit approval", async () => {
  const issue = {
    id: "issue-42",
    number: 42,
    title: "[Fitur] Launchpad: Kartu aktivitas",
    body: completeBody,
    state: "OPEN",
    url: "https://example.test/issues/42",
    assignees: [],
  };
  const items = [
    { id: "item-42", status: "Ready", content: { number: 42 } },
    {
      id: "item-7",
      status: "In Progress",
      assignees: ["zakinadhif"],
      content: { number: 7 },
    },
  ];
  const { ctx, calls } = fakeContext((command, args) => {
    const line = [command, ...args].join(" ");
    if (line.startsWith("gh issue view 42")) {
      return response(JSON.stringify(issue));
    }
    if (line.startsWith("gh project item-list")) {
      return response(JSON.stringify({ items }));
    }
    if (line === "gh api user --jq .login") return response("zakinadhif\n");
    return response();
  });

  await assert.rejects(
    () => claimTask(ctx, 42),
    /already owns In Progress #7/u,
  );
  assert.equal(
    calls.some((call) => call.join(" ").includes("gh issue edit")),
    false,
  );
});

test("ship reuses an existing closing PR and only repairs board state", async () => {
  const branch = "task/42-launchpad-kartu-aktivitas";
  const issue = {
    id: "issue-42",
    number: 42,
    title: "[Fitur] Launchpad: Kartu aktivitas",
    body: completeBody,
    state: "OPEN",
    url: "https://example.test/issues/42",
    assignees: [{ login: "zakinadhif" }],
  };
  const item = {
    id: "item-42",
    status: "In Progress",
    content: { number: 42 },
  };
  const pullRequest = {
    number: 99,
    title: issue.title,
    url: "https://example.test/pull/99",
    state: "OPEN",
    body: "Closes #42\n\nSummary",
    mergedAt: null,
  };
  const { ctx, calls } = fakeContext((command, args) => {
    const line = [command, ...args].join(" ");
    if (line === "git status --porcelain") return response();
    if (line === "git branch --show-current") return response(`${branch}\n`);
    if (line.startsWith("gh issue view 42")) {
      return response(JSON.stringify(issue));
    }
    if (line.startsWith("gh project item-list")) {
      return response(JSON.stringify({ items: [item] }));
    }
    if (line.startsWith("gh pr list")) {
      return response(JSON.stringify([pullRequest]));
    }
    return response();
  });

  const result = await shipTask(ctx, 42, { verified: true });
  assert.equal(result.pullRequest.url, pullRequest.url);
  assert.equal(
    calls.some((call) => call.join(" ").includes("gh pr create")),
    false,
  );
  assert.equal(
    calls.filter((call) => call.join(" ").includes("gh project item-edit"))
      .length,
    1,
  );
});

test("ship requires a reviewer summary before pushing a new PR", async () => {
  const branch = "task/42-launchpad-kartu-aktivitas";
  const issue = {
    id: "issue-42",
    number: 42,
    title: "[Fitur] Launchpad: Kartu aktivitas",
    body: completeBody,
    state: "OPEN",
    url: "https://example.test/issues/42",
    assignees: [{ login: "zakinadhif" }],
  };
  const item = {
    id: "item-42",
    status: "In Progress",
    content: { number: 42 },
  };
  const { ctx, calls } = fakeContext((command, args) => {
    const line = [command, ...args].join(" ");
    if (line === "git status --porcelain") return response();
    if (line === "git branch --show-current") return response(`${branch}\n`);
    if (line.startsWith("gh issue view 42")) {
      return response(JSON.stringify(issue));
    }
    if (line.startsWith("gh project item-list")) {
      return response(JSON.stringify({ items: [item] }));
    }
    if (line.startsWith("gh pr list")) return response("[]");
    return response();
  });

  await assert.rejects(
    () => shipTask(ctx, 42, { verified: true }),
    /requires --summary/u,
  );
  assert.equal(
    calls.some((call) => call.join(" ").includes("git push")),
    false,
  );
});

test("reconcile repairs a missing board item only after merge is proven", async () => {
  const issue = {
    id: "issue-42",
    number: 42,
    title: "[Bug] Launchpad: Perbaiki kartu",
    body: completeBody,
    state: "CLOSED",
    url: "https://example.test/issues/42",
    assignees: [{ login: "zakinadhif" }],
  };
  const pullRequest = {
    number: 99,
    title: issue.title,
    url: "https://example.test/pull/99",
    body: "Closes #42",
    mergedAt: "2026-07-28T00:00:00Z",
  };
  const { ctx, calls } = fakeContext((command, args) => {
    const line = [command, ...args].join(" ");
    if (line.startsWith("gh issue view 42")) {
      return response(JSON.stringify(issue));
    }
    if (line.startsWith("gh project item-list")) {
      return response(JSON.stringify({ items: [] }));
    }
    if (line.startsWith("gh pr list")) {
      return response(JSON.stringify([pullRequest]));
    }
    if (line.startsWith("gh project item-add")) {
      return response(JSON.stringify({ id: "item-42" }));
    }
    if (line.startsWith("gh issue list")) return response("[]");
    return response();
  });

  await reconcileTask(ctx, 42);
  assert.equal(
    calls.filter((call) => call.join(" ").includes("gh project item-add"))
      .length,
    1,
  );
  assert.equal(
    calls.filter((call) => call.join(" ").includes("gh project item-edit"))
      .length,
    1,
  );
});

test("linkSubissue skips an existing relationship", async () => {
  const parent = {
    id: "issue-10",
    number: 10,
    title: "[Diskusi] Launchpad: Arah baru",
    body: "",
    state: "OPEN",
    url: "https://example.test/issues/10",
    assignees: [],
  };
  const child = {
    id: "issue-22",
    number: 22,
    title: "[Desain] Launchpad: Eksplorasi",
    body: "",
    state: "OPEN",
    url: "https://example.test/issues/22",
    assignees: [],
  };
  const graph = {
    data: {
      repository: {
        issue: { subIssues: { nodes: [{ number: 22 }] } },
      },
    },
  };
  const { ctx, calls } = fakeContext((command, args) => {
    const line = [command, ...args].join(" ");
    if (line.startsWith("gh issue view 10")) {
      return response(JSON.stringify(parent));
    }
    if (line.startsWith("gh issue view 22")) {
      return response(JSON.stringify(child));
    }
    if (line.startsWith("gh project item-list")) {
      return response(
        JSON.stringify({
          items: [
            { id: "item-10", status: "Proposed", content: { number: 10 } },
            { id: "item-22", status: "Backlog", content: { number: 22 } },
          ],
        }),
      );
    }
    if (line.startsWith("gh api graphql")) {
      return response(JSON.stringify(graph));
    }
    return response();
  });

  assert.equal(await linkSubissue(ctx, 10, 22), false);
  assert.equal(
    calls.filter((call) => call.join(" ").includes("gh api graphql")).length,
    1,
  );
  assert.equal(
    calls.some((call) =>
      call.join(" ").includes("mutation($issueId:ID!,$subIssueId:ID!)"),
    ),
    false,
  );
});
