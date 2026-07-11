// Shared preview-environment reaping logic for BOTH the teardown workflow
// (preview-teardown.yml, one PR on close) and the scheduled reaper
// (preview-reaper.yml, a sweep of everything that escaped teardown). It exists
// as one module, imported by both, because two copies of bucket-deletion logic
// means two places to get the guard wrong — and the guard being wrong deletes
// production, permanently, for both D1 and R2 (Time Travel does not resurrect a
// deleted database; R2 does not version objects).
//
// The credential this runs under CANNOT be narrowed: Cloudflare's `D1:Edit` is
// account-scoped, and an R2 token cannot be scoped to buckets that do not exist
// yet (preview buckets are born per-PR). So `CLOUDFLARE_API_TOKEN` can already
// `d1 delete buildersnetwork`, and the R2 S3 token can purge
// `buildersnetwork-uploads`. The only guard is here, in the names this module
// will act on: every destructive op asserts an ANCHORED per-PR pattern first
// and refuses anything else — including, explicitly, the production names. This
// is why the assert functions are exported and tested directly.

import { spawnSync } from "node:child_process";

// Production resources the guard must never let a destructive op touch. Listed
// for belt-and-braces tests; the anchored patterns below already exclude them,
// since none match `buildersnetwork-pr-<n>`.
export const PROD_DATABASE_NAME = "buildersnetwork";
export const PROD_BUCKET_NAME = "buildersnetwork-uploads";
export const PROD_WORKER_NAMES = ["buildersnetwork", "buildersnetwork-mockups"];

// Anchored (`^…$`), not `startsWith`, not glob. `buildersnetwork-pr-1-uploads`
// is a valid bucket but an INVALID database/worker name; `buildersnetwork` and
// `buildersnetwork-uploads` (production) match neither.
const DB_NAME_RE = /^buildersnetwork-pr-[0-9]+$/;
const BUCKET_NAME_RE = /^buildersnetwork-pr-[0-9]+-uploads$/;

// A database and its Worker share the exact same per-PR name.
export function assertPreviewDatabaseName(name) {
  if (typeof name !== "string" || !DB_NAME_RE.test(name)) {
    throw new Error(
      `refusing to act on a non-preview database/worker name: ${JSON.stringify(name)}`,
    );
  }
  return name;
}
export const assertPreviewWorkerName = assertPreviewDatabaseName;

export function assertPreviewBucketName(name) {
  if (typeof name !== "string" || !BUCKET_NAME_RE.test(name)) {
    throw new Error(
      `refusing to act on a non-preview bucket name: ${JSON.stringify(name)}`,
    );
  }
  return name;
}

// The three names for one PR, all computed from the number — never from
// anything an author can influence.
export function previewNames(pr) {
  const n = String(pr);
  if (!/^[0-9]+$/.test(n)) {
    throw new Error(
      `PR number is not a positive integer: ${JSON.stringify(pr)}`,
    );
  }
  const base = `buildersnetwork-pr-${n}`;
  return { number: n, database: base, worker: base, bucket: `${base}-uploads` };
}

// A destructive op is idempotent only when "the resource is already gone" reads
// as success. Kept deliberately NARROW: an unknown failure (auth, network, a
// non-empty bucket) must stay loud — silently treating a failed delete as done
// is the single slipperiest bug in this task. Anything not matched here rethrows.
const ALREADY_GONE_RE =
  /not\s*found|does(?:n['’]?t| not) exist|no such (?:bucket|database|key)|couldn['’]?t find|nosuchbucket|resource_?not_?found|\[code:\s*100(?:00|06|07)\]|code:\s*100(?:00|06|07)|10006|10007/i;

function isAlreadyGone(text) {
  return ALREADY_GONE_RE.test(text || "");
}

// Default command runners. Injected in tests so no real wrangler/aws is spawned
// — which is also what lets the guard tests prove "no purge was called".
function makeDefaultRun() {
  return (cmd, args, opts = {}) => {
    const res = spawnSync(cmd, args, { encoding: "utf8", ...opts });
    if (res.error) throw res.error;
    return {
      status: res.status ?? 1,
      stdout: res.stdout ?? "",
      stderr: res.stderr ?? "",
    };
  };
}

// Build the execution context from the environment. Tests pass their own.
export function createContext(env = process.env) {
  const run = makeDefaultRun();
  const accountId = env.CLOUDFLARE_ACCOUNT_ID || "";
  const endpoint =
    env.R2_S3_ENDPOINT ||
    (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : "");

  // The S3 credentials live ONLY in this closure's env, so they reach the aws
  // process and nothing else in the job. Checksum knobs work around aws-cli v2
  // sending integrity headers R2 historically rejected.
  const s3Env = {
    ...env,
    AWS_DEFAULT_REGION: "auto",
    AWS_REGION: "auto",
    AWS_REQUEST_CHECKSUM_CALCULATION: "when_required",
    AWS_RESPONSE_CHECKSUM_VALIDATION: "when_required",
  };
  const runS3 = (args, opts = {}) => run("aws", args, { ...opts, env: s3Env });

  return { run, runS3, endpoint, log: (m) => console.error(m) };
}

// --- individual resource ops (each guards, each idempotent) -----------------

export function deleteDatabase(name, ctx) {
  assertPreviewDatabaseName(name);
  const r = ctx.run("pnpm", ["exec", "wrangler", "d1", "delete", name, "-y"]);
  if (r.status === 0) {
    ctx.log(`Deleted D1 database ${name}.`);
    return;
  }
  const out = `${r.stdout}\n${r.stderr}`;
  if (isAlreadyGone(out)) {
    ctx.log(`D1 database ${name} already gone.`);
    return;
  }
  throw new Error(`d1 delete ${name} failed (status ${r.status}):\n${out}`);
}

export function deleteWorker(name, ctx) {
  assertPreviewWorkerName(name);
  // `--force` here means "delete even if another Worker depends on this one",
  // not "skip empty checks"; harmless for an isolated preview Worker and avoids
  // a rare interactive prompt. stdin "y" covers the confirmation on older
  // wrangler builds that ask despite non-TTY.
  const r = ctx.run("pnpm", ["exec", "wrangler", "delete", name, "--force"], {
    input: "y\n",
  });
  if (r.status === 0) {
    ctx.log(`Deleted Worker ${name}.`);
    return;
  }
  const out = `${r.stdout}\n${r.stderr}`;
  if (isAlreadyGone(out)) {
    ctx.log(`Worker ${name} already gone.`);
    return;
  }
  throw new Error(`worker delete ${name} failed (status ${r.status}):\n${out}`);
}

// Empty the bucket over the S3 API, then delete it via wrangler. Two phases,
// because R2 refuses to delete a non-empty bucket and wrangler has no bulk
// object delete. Synchronous and loud: if emptying fails for any reason other
// than "the bucket is already gone", it throws.
export function reapBucket(name, ctx) {
  assertPreviewBucketName(name);
  if (!ctx.endpoint) {
    throw new Error(
      "no R2 S3 endpoint configured (need CLOUDFLARE_ACCOUNT_ID or R2_S3_ENDPOINT)",
    );
  }

  const rm = ctx.runS3([
    "s3",
    "rm",
    `s3://${name}`,
    "--recursive",
    "--endpoint-url",
    ctx.endpoint,
  ]);
  if (rm.status !== 0) {
    const out = `${rm.stdout}\n${rm.stderr}`;
    if (isAlreadyGone(out)) {
      ctx.log(`R2 bucket ${name} already gone.`);
      return;
    }
    throw new Error(
      `emptying bucket ${name} failed (status ${rm.status}):\n${out}`,
    );
  }
  ctx.log(`Emptied R2 bucket ${name}.`);

  const del = ctx.run(
    "pnpm",
    ["exec", "wrangler", "r2", "bucket", "delete", name],
    {
      input: "y\n",
    },
  );
  if (del.status === 0) {
    ctx.log(`Deleted R2 bucket ${name}.`);
    return;
  }
  const out = `${del.stdout}\n${del.stderr}`;
  if (isAlreadyGone(out)) {
    ctx.log(`R2 bucket ${name} already gone.`);
    return;
  }
  throw new Error(
    `r2 bucket delete ${name} failed (status ${del.status}):\n${out}`,
  );
}

// Reap all three resources for one PR. Each resource is attempted independently
// — a failure on one is collected, not thrown, so the others still run (the
// half-done states: DB gone but bucket left, bucket gone but Worker left, …).
// Returns the list of failures; the caller decides the exit code.
export function reapPreview(pr, ctx) {
  const names = previewNames(pr);
  const failures = [];
  const step = (label, fn) => {
    try {
      fn();
    } catch (err) {
      ctx.log(`::error::${label}: ${err.message}`);
      failures.push({ label, error: err });
    }
  };

  step(`database ${names.database}`, () => deleteDatabase(names.database, ctx));
  step(`bucket ${names.bucket}`, () => reapBucket(names.bucket, ctx));
  step(`worker ${names.worker}`, () => deleteWorker(names.worker, ctx));

  return failures;
}

// --- enumeration (reaper sweep) ---------------------------------------------

// Extract every `buildersnetwork-pr-<n>` database name from `d1 list --json`,
// tolerating both shapes wrangler has emitted (bare array, or `{result:[…]}`).
export function previewNumbersFromD1(json) {
  const list = Array.isArray(json) ? json : json?.result || [];
  const out = new Set();
  for (const db of list) {
    const m = /^buildersnetwork-pr-([0-9]+)$/.exec(db?.name);
    if (m) out.add(m[1]);
  }
  return out;
}

// `wrangler r2 bucket list` has NO --json flag, so parse its text output. Each
// bucket is a `name:  <bucket>` line; extract the per-PR numbers.
export function previewNumbersFromBucketList(text) {
  const out = new Set();
  for (const line of String(text || "").split("\n")) {
    const m = /^\s*name:\s*(\S+)\s*$/.exec(line);
    if (!m) continue;
    const b = /^buildersnetwork-pr-([0-9]+)-uploads$/.exec(m[1]);
    if (b) out.add(b[1]);
  }
  return out;
}

// The stale set: every PR number that owns a preview resource (DB or bucket)
// and whose PR is no longer open. Union on the resource side so an orphaned
// bucket (its DB already reaped) is still found; difference against open PRs so
// a live preview is never touched.
export function staleNumbers({ dbNumbers, bucketNumbers, openNumbers }) {
  const open = new Set([...openNumbers].map(String));
  const stale = new Set();
  for (const n of [...dbNumbers, ...bucketNumbers]) {
    if (!open.has(String(n))) stale.add(String(n));
  }
  return [...stale].sort((a, b) => Number(a) - Number(b));
}

// --- CLI --------------------------------------------------------------------

function teardown(ctx) {
  const pr = process.env.PR_NUMBER;
  const failures = reapPreview(pr, ctx);
  if (failures.length) {
    throw new Error(`teardown for PR #${pr} had ${failures.length} failure(s)`);
  }
}

function sweep(ctx) {
  const d1 = ctx.run("pnpm", ["exec", "wrangler", "d1", "list", "--json"]);
  if (d1.status !== 0) {
    throw new Error(`wrangler d1 list failed:\n${d1.stdout}\n${d1.stderr}`);
  }
  const buckets = ctx.run("pnpm", ["exec", "wrangler", "r2", "bucket", "list"]);
  if (buckets.status !== 0) {
    throw new Error(
      `wrangler r2 bucket list failed:\n${buckets.stdout}\n${buckets.stderr}`,
    );
  }
  const openRaw = ctx.run("gh", [
    "pr",
    "list",
    "--state",
    "open",
    "--json",
    "number",
    "--limit",
    "1000",
    "--jq",
    ".[].number",
  ]);
  if (openRaw.status !== 0) {
    throw new Error(`gh pr list failed:\n${openRaw.stdout}\n${openRaw.stderr}`);
  }

  const dbNumbers = previewNumbersFromD1(JSON.parse(d1.stdout || "[]"));
  const bucketNumbers = previewNumbersFromBucketList(buckets.stdout);
  const openNumbers = new Set(
    openRaw.stdout
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
  );

  const stale = staleNumbers({ dbNumbers, bucketNumbers, openNumbers });
  if (stale.length === 0) {
    ctx.log("No stale preview environments to reap.");
    return;
  }
  ctx.log(
    `Reaping ${stale.length} stale preview environment(s): ${stale.join(", ")}`,
  );

  let failed = 0;
  for (const n of stale) {
    const failures = reapPreview(n, ctx);
    failed += failures.length;
  }
  if (failed) {
    throw new Error(
      `reaper finished with ${failed} resource failure(s) across the sweep`,
    );
  }
}

async function main() {
  const cmd = process.argv[2];
  const ctx = createContext();
  if (cmd === "teardown") {
    teardown(ctx);
  } else if (cmd === "reap") {
    sweep(ctx);
  } else {
    console.error(`usage: preview-reaper.mjs <teardown|reap>`);
    process.exit(2);
  }
}

// Run only when invoked directly, not when imported by the test file.
if (
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith("preview-reaper.mjs")
) {
  main().catch((err) => {
    console.error(err.stack || err.message);
    process.exit(1);
  });
}
