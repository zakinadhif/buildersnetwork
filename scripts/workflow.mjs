import { spawnSync } from "node:child_process";
import process from "node:process";

import { INITIAL_STATUSES, WORKFLOW } from "./workflow-config.mjs";

export class WorkflowError extends Error {}

function defaultRun(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    ...options,
  });
  if (result.error) throw result.error;
  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

export function createContext({
  run = defaultRun,
  dryRun = false,
  log = console.log,
  warn = console.error,
} = {}) {
  return { run, dryRun, log, warn };
}

function printable(command, args) {
  return [command, ...args]
    .map((part) => (/[\s"']/u.test(part) ? JSON.stringify(part) : part))
    .join(" ");
}

function execute(ctx, command, args, { json = false, mutate = false } = {}) {
  if (mutate && ctx.dryRun) {
    ctx.log(`[dry-run] ${printable(command, args)}`);
    return json ? {} : "";
  }

  const result = ctx.run(command, args);
  if (result.status !== 0) {
    const detail = [result.stdout, result.stderr]
      .filter(Boolean)
      .join("\n")
      .trim();
    throw new WorkflowError(
      `${printable(command, args)} failed${detail ? `:\n${detail}` : ""}`,
    );
  }

  if (!json) return result.stdout.trim();
  try {
    return JSON.parse(result.stdout || "null");
  } catch (error) {
    throw new WorkflowError(
      `${printable(command, args)} returned invalid JSON: ${error.message}`,
    );
  }
}

function probe(ctx, command, args) {
  return ctx.run(command, args);
}

export function issueNumber(value) {
  const normalized = String(value ?? "").replace(/^#/, "");
  if (!/^[1-9][0-9]*$/u.test(normalized)) {
    throw new WorkflowError(
      `issue number must be a positive integer, got ${JSON.stringify(value)}`,
    );
  }
  return Number(normalized);
}

export function slugifyIssueTitle(title) {
  const slug = String(title)
    .replace(/^\[[^\]]+\]\s*/u, "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-+|-+$/gu, "")
    .slice(0, 48)
    .replace(/-+$/u, "");
  return slug || "task";
}

export function parseDependencies(body) {
  const dependencies = new Set();
  for (const clause of String(body ?? "").matchAll(/Depends on([^\r\n]*)/giu)) {
    for (const match of clause[1].matchAll(/#([0-9]+)/gu)) {
      dependencies.add(Number(match[1]));
    }
  }
  return [...dependencies];
}

function relationshipNodes(value) {
  if (Array.isArray(value)) return value;
  return Array.isArray(value?.nodes) ? value.nodes : [];
}

export function dependencyNumbers(issue) {
  const dependencies = new Set(
    relationshipNodes(issue?.blockedBy)
      .map((dependency) => Number(dependency?.number))
      .filter(Number.isInteger),
  );

  // Migration fallback for issue contracts authored before GitHub exposed
  // native dependencies in gh. Remove after every historical open contract
  // has been migrated and the fallback has stayed unused.
  for (const dependency of parseDependencies(issue?.body)) {
    dependencies.add(dependency);
  }
  return [...dependencies];
}

export function isColdCompletable(body) {
  const text = String(body ?? "");
  const required = [
    /(?:^|\n)##\s+Kenapa\s*(?:\n|$)/iu,
    /(?:^|\n)##\s+Ruang lingkup\s*(?:\n|$)/iu,
    /(?:^|\n)##\s+Batas(?:\s|\(|$)/iu,
    /(?:^|\n)##\s+Kriteria terima\s*(?:\n|$)/iu,
    /(?:^|\n)##\s+Di luar lingkup\s*(?:\n|$)/iu,
  ];
  return required.every((pattern) => pattern.test(text));
}

function assigneeLogins(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((assignee) =>
      typeof assignee === "string" ? assignee : assignee?.login,
    )
    .filter(Boolean);
}

export function findBoardItem(items, number) {
  return (
    items.find((item) => Number(item?.content?.number) === Number(number)) ??
    null
  );
}

function boardAssignees(item) {
  return assigneeLogins(item?.assignees ?? item?.content?.assignees);
}

function getIssue(ctx, number) {
  return execute(
    ctx,
    "gh",
    [
      "issue",
      "view",
      String(number),
      "--repo",
      WORKFLOW.repository,
      "--json",
      "id,number,title,body,state,url,assignees,blockedBy,blocking",
    ],
    { json: true },
  );
}

function getOpenIssues(ctx) {
  return execute(
    ctx,
    "gh",
    [
      "issue",
      "list",
      "--repo",
      WORKFLOW.repository,
      "--state",
      "open",
      "--limit",
      "1000",
      "--json",
      "number,title,body,state,blockedBy,blocking",
    ],
    { json: true },
  );
}

function getBoardItems(ctx) {
  const response = execute(
    ctx,
    "gh",
    [
      "project",
      "item-list",
      String(WORKFLOW.projectNumber),
      "--owner",
      WORKFLOW.owner,
      "--limit",
      "1000",
      "--format",
      "json",
    ],
    { json: true },
  );
  return response?.items ?? [];
}

function getLogin(ctx) {
  return execute(ctx, "gh", ["api", "user", "--jq", ".login"]);
}

async function requireClosedDependencies(ctx, issue) {
  const dependencies = resolveDependencies(ctx, issue);
  const open = dependencies
    .filter((dependency) => dependency.state !== "CLOSED")
    .map((dependency) => dependency.number);
  if (open.length > 0) {
    throw new WorkflowError(
      `issue #${issue.number} has open dependencies: ${open
        .map((number) => `#${number}`)
        .join(", ")}`,
    );
  }
}

function resolveDependencies(ctx, issue) {
  const dependencies = new Map(
    relationshipNodes(issue?.blockedBy)
      .map((dependency) => [
        Number(dependency?.number),
        {
          number: Number(dependency?.number),
          state: dependency?.state ?? null,
          source: "native",
        },
      ])
      .filter(([number]) => Number.isInteger(number)),
  );

  for (const number of dependencyNumbers(issue)) {
    const existing = dependencies.get(number);
    if (existing?.state) continue;
    const dependencyIssue = getIssue(ctx, number);
    dependencies.set(number, {
      number,
      state: dependencyIssue.state,
      source: existing?.source ?? "markdown",
    });
  }
  return [...dependencies.values()];
}

function requireCleanWorktree(ctx) {
  const status = execute(ctx, "git", ["status", "--porcelain"]);
  if (status) {
    throw new WorkflowError(
      "worktree is not clean; commit, stash, or remove task-local changes before changing workflow branches",
    );
  }
}

function currentBranch(ctx) {
  return execute(ctx, "git", ["branch", "--show-current"]);
}

function localBranchExists(ctx, branch) {
  return (
    probe(ctx, "git", [
      "show-ref",
      "--verify",
      "--quiet",
      `refs/heads/${branch}`,
    ]).status === 0
  );
}

function ensureTaskBranch(ctx, branch) {
  if (currentBranch(ctx) === branch) {
    ctx.log(`Branch ${branch} already active.`);
    return;
  }
  if (localBranchExists(ctx, branch)) {
    execute(ctx, "git", ["switch", branch], { mutate: true });
    return;
  }
  execute(ctx, "git", ["fetch", "origin", "main"], { mutate: true });
  execute(ctx, "git", ["switch", "-c", branch, "origin/main"], {
    mutate: true,
  });
}

function boardOption(status) {
  const option = WORKFLOW.statuses[status];
  if (!option) {
    throw new WorkflowError(
      `unknown status ${JSON.stringify(status)}; expected one of ${Object.keys(
        WORKFLOW.statuses,
      ).join(", ")}`,
    );
  }
  return option;
}

export function setBoardStatus(ctx, item, status) {
  if (!item?.id) throw new WorkflowError("issue is not on the project board");
  boardOption(status);
  if (item.status === status) {
    ctx.log(`Board item already ${status}.`);
    return false;
  }
  execute(
    ctx,
    "gh",
    [
      "project",
      "item-edit",
      "--id",
      item.id,
      "--project-id",
      WORKFLOW.projectId,
      "--field-id",
      WORKFLOW.statusFieldId,
      "--single-select-option-id",
      WORKFLOW.statuses[status],
    ],
    { mutate: true },
  );
  ctx.log(`Board item moved ${item.status ?? "(unset)"} → ${status}.`);
  return true;
}

function ensureBoardItem(ctx, issue, items = getBoardItems(ctx)) {
  const existing = findBoardItem(items, issue.number);
  if (existing) return existing;

  const added = execute(
    ctx,
    "gh",
    [
      "project",
      "item-add",
      String(WORKFLOW.projectNumber),
      "--owner",
      WORKFLOW.owner,
      "--url",
      issue.url,
      "--format",
      "json",
    ],
    { json: true, mutate: true },
  );
  return {
    id: added.id ?? (ctx.dryRun ? "(dry-run item)" : null),
    status: null,
    content: { number: issue.number },
  };
}

export async function placeTask(ctx, rawNumber, status) {
  const number = issueNumber(rawNumber);
  if (!INITIAL_STATUSES.includes(status)) {
    throw new WorkflowError(
      `place only accepts initial statuses: ${INITIAL_STATUSES.join(", ")}`,
    );
  }
  const issue = getIssue(ctx, number);
  if (issue.state !== "OPEN") {
    throw new WorkflowError(`cannot place closed issue #${number}`);
  }
  if (status === "Proposed" && !issue.title.startsWith("[Diskusi]")) {
    throw new WorkflowError("only [Diskusi] issues may start in Proposed");
  }
  if (status === "Ready") {
    const login = getLogin(ctx);
    if (login !== WORKFLOW.owner) {
      throw new WorkflowError(
        "only the maintainer may curate an issue into Ready",
      );
    }
    if (!isColdCompletable(issue.body)) {
      throw new WorkflowError(
        "Ready requires a cold-completable issue contract",
      );
    }
    await requireClosedDependencies(ctx, issue);
  }

  const items = getBoardItems(ctx);
  const item = ensureBoardItem(ctx, issue, items);
  const changed = setBoardStatus(ctx, item, status);
  return { issue, status, changed };
}

export async function claimTask(ctx, rawNumber, { allowSecond = false } = {}) {
  const number = issueNumber(rawNumber);
  const issue = getIssue(ctx, number);
  const items = getBoardItems(ctx);
  const item = findBoardItem(items, number);
  const login = getLogin(ctx);

  if (issue.state !== "OPEN") {
    throw new WorkflowError(`cannot claim closed issue #${number}`);
  }
  if (!item) throw new WorkflowError(`issue #${number} is not on the board`);
  if (!["Ready", "Backlog", "In Progress"].includes(item.status)) {
    throw new WorkflowError(
      `issue #${number} is ${item.status}; only Ready or eligible Backlog work is claimable`,
    );
  }
  if (item.status === "Backlog" && !isColdCompletable(issue.body)) {
    throw new WorkflowError(
      `Backlog issue #${number} is not cold-completable; groom it before claiming`,
    );
  }
  await requireClosedDependencies(ctx, issue);

  const issueAssignees = assigneeLogins(issue.assignees);
  const otherAssignees = issueAssignees.filter(
    (assignee) => assignee !== login,
  );
  if (otherAssignees.length > 0) {
    throw new WorkflowError(
      `issue #${number} is already assigned to ${otherAssignees.join(", ")}`,
    );
  }

  const otherInProgress = items.filter(
    (candidate) =>
      candidate.status === "In Progress" &&
      Number(candidate?.content?.number) !== number &&
      boardAssignees(candidate).includes(login),
  );
  if (otherInProgress.length > 0 && !allowSecond) {
    throw new WorkflowError(
      `@${login} already owns In Progress ${otherInProgress
        .map((candidate) => `#${candidate.content.number}`)
        .join(", ")}; pass --allow-second only with explicit user approval`,
    );
  }

  requireCleanWorktree(ctx);
  const branch = `task/${number}-${slugifyIssueTitle(issue.title)}`;

  if (!issueAssignees.includes(login)) {
    execute(
      ctx,
      "gh",
      [
        "issue",
        "edit",
        String(number),
        "--repo",
        WORKFLOW.repository,
        "--add-assignee",
        login,
      ],
      { mutate: true },
    );
  } else {
    ctx.log(`Issue #${number} already assigned to @${login}.`);
  }
  ensureTaskBranch(ctx, branch);
  setBoardStatus(ctx, item, "In Progress");
  ctx.log(`Claimed #${number} on ${branch}.`);
  return { issue, branch };
}

function issueFromBranch(branch) {
  const match = /^task\/([1-9][0-9]*)-/u.exec(branch);
  return match ? Number(match[1]) : null;
}

function getPullRequestsForBranch(ctx, branch, state = "all") {
  return execute(
    ctx,
    "gh",
    [
      "pr",
      "list",
      "--repo",
      WORKFLOW.repository,
      "--head",
      branch,
      "--state",
      state,
      "--limit",
      "20",
      "--json",
      "number,title,url,state,isDraft,body,mergedAt",
    ],
    { json: true },
  );
}

function closesIssue(body, number) {
  return new RegExp(
    `(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\\s+#${number}(?:\\D|$)`,
    "iu",
  ).test(String(body ?? ""));
}

export async function shipTask(
  ctx,
  rawNumber,
  { verified = false, summary = "" } = {},
) {
  if (!verified) {
    throw new WorkflowError(
      "ship requires --verified after acceptance criteria and validation pass",
    );
  }
  requireCleanWorktree(ctx);
  const branch = currentBranch(ctx);
  const branchNumber = issueFromBranch(branch);
  const number =
    rawNumber === undefined ? branchNumber : issueNumber(rawNumber);
  if (!number) {
    throw new WorkflowError(
      "cannot infer the issue; run from task/<number>-... or provide a number",
    );
  }
  if (branchNumber !== number) {
    throw new WorkflowError(
      `current branch ${branch} does not match issue #${number}`,
    );
  }

  const issue = getIssue(ctx, number);
  const item = findBoardItem(getBoardItems(ctx), number);
  if (issue.state !== "OPEN") {
    throw new WorkflowError(`issue #${number} is already closed`);
  }
  if (!item || !["In Progress", "In Review"].includes(item.status)) {
    throw new WorkflowError(
      `issue #${number} must be In Progress before shipping`,
    );
  }

  let pullRequest = getPullRequestsForBranch(ctx, branch).find(
    (candidate) => candidate.state === "OPEN",
  );
  if (pullRequest && !closesIssue(pullRequest.body, number)) {
    throw new WorkflowError(
      `existing PR #${pullRequest.number} does not close issue #${number}`,
    );
  }
  if (!pullRequest && !summary.trim()) {
    throw new WorkflowError(
      "creating a PR requires --summary with a concise reviewer-facing implementation summary",
    );
  }

  execute(ctx, "git", ["push", "-u", "origin", "HEAD"], { mutate: true });
  if (!pullRequest) {
    const url = execute(
      ctx,
      "gh",
      [
        "pr",
        "create",
        "--repo",
        WORKFLOW.repository,
        "--title",
        issue.title,
        "--body",
        `Closes #${number}\n\n${summary.trim()}`,
      ],
      { mutate: true },
    );
    pullRequest = { url: url || "(dry-run)", state: "OPEN" };
  } else {
    ctx.log(`Reusing open PR ${pullRequest.url}.`);
  }
  setBoardStatus(ctx, item, "In Review");
  ctx.log(`Shipped #${number}: ${pullRequest.url}`);
  return { issue, pullRequest };
}

function findMergedClosingPullRequest(ctx, number) {
  const pullRequests = execute(
    ctx,
    "gh",
    [
      "pr",
      "list",
      "--repo",
      WORKFLOW.repository,
      "--state",
      "merged",
      "--limit",
      "1000",
      "--json",
      "number,title,url,body,mergedAt",
    ],
    { json: true },
  );
  return (
    pullRequests.find((pullRequest) => closesIssue(pullRequest.body, number)) ??
    null
  );
}

export async function reconcileTask(ctx, rawNumber) {
  const number = issueNumber(rawNumber);
  const issue = getIssue(ctx, number);
  const items = getBoardItems(ctx);
  const pullRequest = findMergedClosingPullRequest(ctx, number);
  if (issue.state !== "CLOSED" || !pullRequest) {
    throw new WorkflowError(
      `#${number} is not proven merged and closed; reconciliation is premature`,
    );
  }
  const item = ensureBoardItem(ctx, issue, items);
  setBoardStatus(ctx, item, "Done");

  const openIssues = getOpenIssues(ctx);
  const openNumbers = new Set(openIssues.map((candidate) => candidate.number));
  const dependents = openIssues
    .filter((candidate) => dependencyNumbers(candidate).includes(number))
    .map((candidate) => ({
      number: candidate.number,
      title: candidate.title,
      openDependencies: dependencyNumbers(candidate).filter((dependency) =>
        openNumbers.has(dependency),
      ),
    }));
  const designWaiters = openIssues
    .filter((candidate) =>
      new RegExp(`menunggu desain\\s+#${number}(?:\\D|$)`, "iu").test(
        candidate.body,
      ),
    )
    .map((candidate) => ({ number: candidate.number, title: candidate.title }));

  for (const dependent of dependents) {
    if (dependent.openDependencies.length === 0) {
      ctx.log(
        `Eligible for maintainer curation: #${dependent.number} ${dependent.title}`,
      );
    } else {
      ctx.log(
        `Still blocked: #${dependent.number} (${dependent.openDependencies
          .map((dependency) => `#${dependency}`)
          .join(", ")})`,
      );
    }
  }
  for (const waiter of designWaiters) {
    ctx.log(
      `Needs grooming from merged design: #${waiter.number} ${waiter.title}`,
    );
  }
  return { issue, pullRequest, dependents, designWaiters };
}

function repositoryParts() {
  const [owner, name] = WORKFLOW.repository.split("/");
  return { owner, name };
}

export async function linkSubissue(ctx, rawParent, rawChild) {
  const parent = issueNumber(rawParent);
  const child = issueNumber(rawChild);
  if (parent === child) {
    throw new WorkflowError("an issue cannot be its own sub-issue");
  }
  const parentIssue = getIssue(ctx, parent);
  const childIssue = getIssue(ctx, child);
  const items = getBoardItems(ctx);
  const parentItem = findBoardItem(items, parent);
  const childItem = findBoardItem(items, child);
  if (
    parentIssue.state !== "OPEN" ||
    !parentIssue.title.startsWith("[Diskusi]") ||
    parentItem?.status !== "Proposed"
  ) {
    throw new WorkflowError(
      `parent #${parent} must be an open Proposed [Diskusi]`,
    );
  }
  if (childIssue.state !== "OPEN" || childItem?.status !== "Backlog") {
    throw new WorkflowError(
      `child #${child} must be open and Backlog while ratification is pending`,
    );
  }

  const { owner, name } = repositoryParts();
  const query = `query($owner:String!,$name:String!,$number:Int!){repository(owner:$owner,name:$name){issue(number:$number){subIssues(first:100){nodes{number}}}}}`;
  const response = execute(
    ctx,
    "gh",
    [
      "api",
      "graphql",
      "-f",
      `query=${query}`,
      "-F",
      `owner=${owner}`,
      "-F",
      `name=${name}`,
      "-F",
      `number=${parent}`,
    ],
    { json: true },
  );
  const children =
    response?.data?.repository?.issue?.subIssues?.nodes?.map(
      (node) => node.number,
    ) ?? [];
  if (children.includes(child)) {
    ctx.log(`#${child} is already a sub-issue of #${parent}.`);
    return false;
  }

  const mutation = `mutation($issueId:ID!,$subIssueId:ID!){addSubIssue(input:{issueId:$issueId,subIssueId:$subIssueId}){issue{id}subIssue{id}}}`;
  execute(
    ctx,
    "gh",
    [
      "api",
      "graphql",
      "-f",
      `query=${mutation}`,
      "-F",
      `issueId=${parentIssue.id}`,
      "-F",
      `subIssueId=${childIssue.id}`,
    ],
    { json: true, mutate: true },
  );
  ctx.log(`Linked #${child} as a sub-issue of #${parent}.`);
  return true;
}

export async function doctorTask(ctx, rawNumber) {
  const number = issueNumber(rawNumber);
  const issue = getIssue(ctx, number);
  const item = findBoardItem(getBoardItems(ctx), number);
  const dependencies = resolveDependencies(ctx, issue);
  const branches = execute(ctx, "git", [
    "branch",
    "--list",
    `task/${number}-*`,
    "--format",
    "%(refname:short)",
  ])
    .split("\n")
    .filter(Boolean);
  const branchPullRequests = branches.flatMap((branch) =>
    getPullRequestsForBranch(ctx, branch),
  );
  const closingPullRequests = execute(
    ctx,
    "gh",
    [
      "pr",
      "list",
      "--repo",
      WORKFLOW.repository,
      "--state",
      "all",
      "--limit",
      "1000",
      "--json",
      "number,title,url,state,isDraft,body,mergedAt",
    ],
    { json: true },
  ).filter((pullRequest) => closesIssue(pullRequest.body, number));
  const pullRequests = [
    ...new Map(
      [...branchPullRequests, ...closingPullRequests].map((pullRequest) => [
        pullRequest.number,
        pullRequest,
      ]),
    ).values(),
  ];
  const findings = [];
  const nativeDependencies = new Set(
    relationshipNodes(issue.blockedBy).map((dependency) => dependency.number),
  );
  const legacyDependencies = parseDependencies(issue.body);

  if (!item) findings.push("missing from project board");
  const legacyOnly = legacyDependencies.filter(
    (dependency) => !nativeDependencies.has(dependency),
  );
  if (legacyOnly.length > 0) {
    findings.push(
      `legacy Markdown dependencies not mirrored natively: ${legacyOnly
        .map((dependency) => `#${dependency}`)
        .join(", ")}`,
    );
  }
  if (
    item?.status === "In Progress" &&
    assigneeLogins(issue.assignees).length === 0
  ) {
    findings.push("In Progress without an assignee");
  }
  if (
    item?.status === "In Review" &&
    !pullRequests.some((pullRequest) => pullRequest.state === "OPEN")
  ) {
    findings.push("In Review without an open PR");
  }
  const openDependencies = dependencies.filter(
    (dependency) => dependency.state !== "CLOSED",
  );
  if (
    ["Ready", "In Progress"].includes(item?.status) &&
    openDependencies.length > 0
  ) {
    findings.push(
      `workable status despite open dependencies: ${openDependencies
        .map((dependency) => `#${dependency.number}`)
        .join(", ")}`,
    );
  }
  if (issue.state === "CLOSED" && item?.status !== "Done") {
    findings.push(
      "closed issue is not Done; run reconcile after verifying merge",
    );
  }

  ctx.log(
    JSON.stringify(
      {
        issue: `#${number} ${issue.title}`,
        issueState: issue.state,
        boardStatus: item?.status ?? null,
        assignees: assigneeLogins(issue.assignees),
        dependencies,
        branches,
        pullRequests: pullRequests.map(({ number: pr, state, url }) => ({
          number: pr,
          state,
          url,
        })),
        findings,
      },
      null,
      2,
    ),
  );
  return { issue, item, dependencies, branches, pullRequests, findings };
}

function parseCli(argv) {
  const positionals = [];
  const flags = new Set();
  const options = new Map();
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--summary") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new WorkflowError("--summary requires a value");
      }
      options.set("summary", value);
      index += 1;
    } else if (argument.startsWith("--summary=")) {
      options.set("summary", argument.slice("--summary=".length));
    } else if (argument.startsWith("--")) {
      flags.add(argument);
    } else {
      positionals.push(argument);
    }
  }
  return { positionals, flags, options };
}

function usage() {
  return `Usage:
  pnpm workflow doctor <issue>
  pnpm workflow place <issue> <Backlog|Proposed|Ready|Blocked> [--dry-run]
  pnpm workflow claim <issue> [--allow-second] [--dry-run]
  pnpm workflow ship [issue] --verified --summary "<reviewer summary>" [--dry-run]
  pnpm workflow reconcile <issue> [--dry-run]
  pnpm workflow link-subissue <parent> <child> [--dry-run]`;
}

async function main() {
  const { positionals, flags, options } = parseCli(process.argv.slice(2));
  const [command, ...args] = positionals;
  const allowedFlags = new Set([
    "--dry-run",
    ...(command === "claim" ? ["--allow-second"] : []),
    ...(command === "ship" ? ["--verified"] : []),
  ]);
  const unknownFlags = [...flags].filter((flag) => !allowedFlags.has(flag));
  if (
    unknownFlags.length > 0 ||
    (options.has("summary") && command !== "ship")
  ) {
    throw new WorkflowError(
      `unsupported option for ${command ?? "(missing command)"}: ${
        unknownFlags[0] ?? "--summary"
      }`,
    );
  }
  const ctx = createContext({ dryRun: flags.has("--dry-run") });

  if (command === "doctor" && args.length === 1) {
    await doctorTask(ctx, args[0]);
  } else if (command === "place" && args.length === 2) {
    await placeTask(ctx, args[0], args[1]);
  } else if (command === "claim" && args.length === 1) {
    await claimTask(ctx, args[0], {
      allowSecond: flags.has("--allow-second"),
    });
  } else if (command === "ship" && args.length <= 1) {
    await shipTask(ctx, args[0], {
      verified: flags.has("--verified"),
      summary: options.get("summary"),
    });
  } else if (command === "reconcile" && args.length === 1) {
    await reconcileTask(ctx, args[0]);
  } else if (command === "link-subissue" && args.length === 2) {
    await linkSubissue(ctx, args[0], args[1]);
  } else {
    throw new WorkflowError(usage());
  }
}

if (
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith("workflow.mjs")
) {
  main().catch((error) => {
    console.error(error.stack || error.message);
    process.exit(1);
  });
}
