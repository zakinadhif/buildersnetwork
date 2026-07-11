// Run with: node --test .github/scripts/
//
// The load-bearing tests here are the guard tests: they feed the PRODUCTION
// database and bucket names to the reaping ops and assert the op throws WITHOUT
// ever invoking a delete/purge command. A regression here deletes production,
// permanently, so these run in CI on every PR (ci.yml).

import assert from "node:assert/strict";
import { test } from "node:test";

import {
  assertPreviewBucketName,
  assertPreviewDatabaseName,
  assertPreviewWorkerName,
  deleteDatabase,
  deleteWorker,
  PROD_BUCKET_NAME,
  PROD_DATABASE_NAME,
  PROD_WORKER_NAMES,
  previewNames,
  previewNumbersFromBucketList,
  previewNumbersFromD1,
  reapBucket,
  reapPreview,
  staleNumbers,
} from "./preview-reaper.mjs";

// A context whose runners RECORD calls instead of spawning anything. If a guard
// works, these arrays stay empty for production names.
function recordingCtx() {
  const calls = [];
  const s3Calls = [];
  return {
    calls,
    s3Calls,
    ctx: {
      endpoint: "https://acct.r2.cloudflarestorage.com",
      log: () => {},
      run: (cmd, args) => {
        calls.push([cmd, ...args]);
        return { status: 0, stdout: "", stderr: "" };
      },
      runS3: (args) => {
        s3Calls.push(["aws", ...args]);
        return { status: 0, stdout: "", stderr: "" };
      },
    },
  };
}

// --- name guards ------------------------------------------------------------

test("bucket-name guard accepts only anchored per-PR bucket names", () => {
  for (const ok of [
    "buildersnetwork-pr-1-uploads",
    "buildersnetwork-pr-42-uploads",
    "buildersnetwork-pr-1000000-uploads",
  ]) {
    assert.equal(assertPreviewBucketName(ok), ok);
  }
  for (const bad of [
    PROD_BUCKET_NAME, // buildersnetwork-uploads — production
    "buildersnetwork-pr-1-uploads-evil", // trailing junk: not $-anchored
    "xbuildersnetwork-pr-1-uploads", // leading junk: not ^-anchored
    "buildersnetwork-pr--uploads", // no number
    "buildersnetwork-pr-1", // db name, not a bucket
    "buildersnetwork-pr-1-uploads\n", // newline slips past a non-anchored regex
    "",
    null,
    undefined,
  ]) {
    assert.throws(() => assertPreviewBucketName(bad), /refusing to act/);
  }
});

test("database/worker-name guard accepts only anchored per-PR names", () => {
  for (const ok of ["buildersnetwork-pr-1", "buildersnetwork-pr-999"]) {
    assert.equal(assertPreviewDatabaseName(ok), ok);
    assert.equal(assertPreviewWorkerName(ok), ok);
  }
  for (const bad of [
    PROD_DATABASE_NAME, // buildersnetwork — production DB and Worker
    ...PROD_WORKER_NAMES, // buildersnetwork, buildersnetwork-mockups
    "buildersnetwork-pr-1-uploads", // bucket name, not a db/worker
    "buildersnetwork-pr-1x",
    "xbuildersnetwork-pr-1",
    "buildersnetwork-pr-",
    "",
    null,
  ]) {
    assert.throws(() => assertPreviewDatabaseName(bad), /refusing to act/);
    assert.throws(() => assertPreviewWorkerName(bad), /refusing to act/);
  }
});

// --- the critical property: prod names never reach a destructive command ----

test("reapBucket on the production bucket throws and NEVER runs aws or wrangler", () => {
  const { ctx, calls, s3Calls } = recordingCtx();
  assert.throws(() => reapBucket(PROD_BUCKET_NAME, ctx), /refusing to act/);
  assert.deepEqual(s3Calls, [], "no aws purge may be attempted");
  assert.deepEqual(calls, [], "no wrangler delete may be attempted");
});

test("deleteDatabase on the production database throws and NEVER runs wrangler", () => {
  const { ctx, calls } = recordingCtx();
  assert.throws(
    () => deleteDatabase(PROD_DATABASE_NAME, ctx),
    /refusing to act/,
  );
  assert.deepEqual(calls, []);
});

test("deleteWorker on each production Worker throws and NEVER runs wrangler", () => {
  for (const prod of PROD_WORKER_NAMES) {
    const { ctx, calls } = recordingCtx();
    assert.throws(() => deleteWorker(prod, ctx), /refusing to act/);
    assert.deepEqual(calls, [], `refused ${prod} without a wrangler call`);
  }
});

// --- names derive from the PR number, and only from a numeric one -----------

test("previewNames derives all three names from a numeric PR", () => {
  assert.deepEqual(previewNames(45), {
    number: "45",
    database: "buildersnetwork-pr-45",
    worker: "buildersnetwork-pr-45",
    bucket: "buildersnetwork-pr-45-uploads",
  });
});

test("previewNames rejects anything non-numeric", () => {
  for (const bad of ["", "1a", "-1", "1; rm -rf", "uploads", null, undefined]) {
    assert.throws(() => previewNames(bad), /not a positive integer/);
  }
});

// --- reapPreview: happy path runs exactly the three guarded ops -------------

test("reapPreview reaps DB, bucket (empty+delete), and worker for one PR", () => {
  const { ctx, calls, s3Calls } = recordingCtx();
  const failures = reapPreview(7, ctx);
  assert.deepEqual(failures, []);

  assert.deepEqual(s3Calls, [
    [
      "aws",
      "s3",
      "rm",
      "s3://buildersnetwork-pr-7-uploads",
      "--recursive",
      "--endpoint-url",
      "https://acct.r2.cloudflarestorage.com",
    ],
  ]);
  const wrangler = calls.map((c) => c.join(" "));
  assert.deepEqual(wrangler, [
    "pnpm exec wrangler d1 delete buildersnetwork-pr-7 -y",
    "pnpm exec wrangler r2 bucket delete buildersnetwork-pr-7-uploads",
    "pnpm exec wrangler delete buildersnetwork-pr-7 --force",
  ]);
});

// --- idempotency: "already gone" is success; a real failure is loud ---------

test("an already-gone resource is treated as success", () => {
  const ctx = {
    endpoint: "https://acct.r2.cloudflarestorage.com",
    log: () => {},
    run: () => ({
      status: 1,
      stdout: "",
      stderr: "D1 database not found [code: 10006]",
    }),
    runS3: () => ({ status: 0, stdout: "", stderr: "" }),
  };
  assert.doesNotThrow(() => deleteDatabase("buildersnetwork-pr-3", ctx));
});

test("a NON-empty bucket delete stays loud (does not get swallowed as idempotent)", () => {
  const ctx = {
    endpoint: "https://acct.r2.cloudflarestorage.com",
    log: () => {},
    // emptying succeeds, but the delete fails for a reason that is NOT gone.
    run: () => ({
      status: 1,
      stdout: "",
      stderr: "The bucket you tried to delete is not empty",
    }),
    runS3: () => ({ status: 0, stdout: "", stderr: "" }),
  };
  assert.throws(
    () => reapBucket("buildersnetwork-pr-3-uploads", ctx),
    /failed/,
  );
});

test("reapPreview collects a failure on one resource without stopping the others", () => {
  const calls = [];
  const ctx = {
    endpoint: "https://acct.r2.cloudflarestorage.com",
    log: () => {},
    run: (_cmd, args) => {
      calls.push(args.join(" "));
      // Make the D1 delete fail hard; bucket delete + worker delete still run.
      if (args.includes("d1")) {
        return { status: 1, stdout: "", stderr: "network unreachable" };
      }
      return { status: 0, stdout: "", stderr: "" };
    },
    runS3: () => ({ status: 0, stdout: "", stderr: "" }),
  };
  const failures = reapPreview(9, ctx);
  assert.equal(failures.length, 1);
  assert.match(failures[0].label, /database/);
  // The bucket and worker deletes ran despite the DB failure.
  assert.ok(
    calls.some((c) =>
      c.includes("r2 bucket delete buildersnetwork-pr-9-uploads"),
    ),
  );
  assert.ok(
    calls.some((c) =>
      c.includes("wrangler delete buildersnetwork-pr-9 --force"),
    ),
  );
});

// --- enumeration & stale set ------------------------------------------------

test("previewNumbersFromD1 tolerates array and {result} shapes, ignores prod", () => {
  const rows = [
    { name: "buildersnetwork" }, // prod
    { name: "buildersnetwork-pr-1" },
    { name: "buildersnetwork-pr-12" },
    { name: "buildersnetwork-mockups" },
  ];
  assert.deepEqual([...previewNumbersFromD1(rows)].sort(), ["1", "12"]);
  assert.deepEqual([...previewNumbersFromD1({ result: rows })].sort(), [
    "1",
    "12",
  ]);
});

test("previewNumbersFromBucketList parses the text listing, ignores prod bucket", () => {
  const text = [
    "name:           buildersnetwork-uploads",
    "creation_date:  2024-01-01",
    "",
    "name:           buildersnetwork-pr-3-uploads",
    "creation_date:  2024-02-02",
    "",
    "name:           buildersnetwork-pr-8-uploads",
  ].join("\n");
  assert.deepEqual([...previewNumbersFromBucketList(text)].sort(), ["3", "8"]);
});

test("staleNumbers unions DB+bucket and subtracts open PRs (finds orphan bucket)", () => {
  const stale = staleNumbers({
    dbNumbers: new Set(["1", "2", "5"]),
    bucketNumbers: new Set(["2", "7"]), // 7 is a bucket whose DB is already gone
    openNumbers: new Set([2, 5]), // PRs 2 and 5 still open
  });
  // 1 (db, closed), 7 (orphan bucket, closed). 2 & 5 open → spared.
  assert.deepEqual(stale, ["1", "7"]);
});

test("staleNumbers spares everything when all PRs are open", () => {
  assert.deepEqual(
    staleNumbers({
      dbNumbers: new Set(["3", "4"]),
      bucketNumbers: new Set(["3"]),
      openNumbers: new Set([3, 4]),
    }),
    [],
  );
});
