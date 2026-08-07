import { spawnSync } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const args = new Set(process.argv.slice(2));
let failures = 0;

function report(kind, label, detail) {
  const marker = kind === "ok" ? "OK" : kind === "warn" ? "WARN" : "FAIL";
  console.log(`[${marker}] ${label}${detail ? `: ${detail}` : ""}`);
  if (kind === "fail") failures += 1;
}

function major(version) {
  return Number(version.match(/\d+/)?.[0] ?? 0);
}

async function exists(relativePath) {
  try {
    await access(resolve(root, relativePath));
    return true;
  } catch {
    return false;
  }
}

function runCommand(command, commandArgs = []) {
  if (process.platform !== "win32") {
    return spawnSync(command, commandArgs, { cwd: root, encoding: "utf8" });
  }

  const located = spawnSync("where.exe", [command], { encoding: "utf8" });
  const executable =
    located.status === 0 ? located.stdout.split(/\r?\n/)[0]?.trim() : null;
  if (!executable)
    return { status: 1, stdout: "", stderr: `${command} not found` };

  if (!/\.(cmd|bat)$/i.test(executable)) {
    return spawnSync(executable, commandArgs, { cwd: root, encoding: "utf8" });
  }

  return spawnSync(
    process.env.ComSpec ?? "cmd.exe",
    ["/d", "/c", "call", executable, ...commandArgs],
    {
      cwd: root,
      encoding: "utf8",
    },
  );
}

function commandVersion(command, versionArgs = ["--version"]) {
  const result = runCommand(command, versionArgs);
  return result.status === 0
    ? result.stdout.trim() || result.stderr.trim()
    : null;
}

const nodeVersion = process.versions.node;
report(
  major(nodeVersion) >= 24 ? "ok" : "fail",
  "Node.js",
  `${nodeVersion} (need >=24)`,
);

const pnpmVersion = commandVersion("pnpm");
report(
  pnpmVersion && major(pnpmVersion) >= 10 ? "ok" : "fail",
  "pnpm",
  pnpmVersion ? `${pnpmVersion} (need >=10)` : "not found",
);

const envRelative = "apps/api/.env";
if (!(await exists(envRelative))) {
  report("fail", envRelative, "missing; run configure-local-env.mjs");
} else {
  const env = Object.fromEntries(
    (await readFile(resolve(root, envRelative), "utf8"))
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const separator = line.indexOf("=");
        return [line.slice(0, separator), line.slice(separator + 1).trim()];
      }),
  );
  report(
    env.APP_URL ? "ok" : "fail",
    "APP_URL",
    env.APP_URL ? "configured" : "blank",
  );
  report(
    env.DATABASE_URL ? "ok" : "fail",
    "DATABASE_URL",
    env.DATABASE_URL ? "configured" : "blank",
  );
  report(
    (env.BETTER_AUTH_SECRET?.length ?? 0) >= 32 ? "ok" : "fail",
    "BETTER_AUTH_SECRET",
    (env.BETTER_AUTH_SECRET?.length ?? 0) >= 32
      ? "configured"
      : "missing or shorter than 32 characters",
  );
}

for (const output of [
  "libs/api-client-react/src/generated/api.ts",
  "libs/api-zod/src/generated/api.ts",
]) {
  const present = await exists(output);
  report(
    present ? "ok" : "fail",
    output,
    present ? "generated" : "missing; run pnpm codegen",
  );
}

const databasePresent = await exists("libs/db/local.db");
report(
  databasePresent ? "ok" : "fail",
  "libs/db/local.db",
  databasePresent ? "present" : "missing; run pnpm db:push and pnpm db:seed",
);

async function checkUrl(label, url, expectedText) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(5_000) });
    const body = await response.text();
    const healthy =
      response.ok && (!expectedText || body.includes(expectedText));
    report(healthy ? "ok" : "fail", label, `${response.status} ${url}`);
  } catch (error) {
    report("fail", label, `${url} (${error.cause?.code ?? error.message})`);
  }
}

if (args.has("--running")) {
  await checkUrl("API health", "http://localhost:8080/healthz", '"ok":true');
  await checkUrl("SPA", "http://localhost:5173/app/", "<html");
  await checkUrl(
    "SPA API proxy",
    "http://localhost:5173/api/healthz",
    '"ok":true',
  );
}

if (args.has("--github")) {
  const ghVersionOutput = commandVersion("gh");
  const ghVersion = ghVersionOutput?.match(/gh version\s+(\d+\.\d+\.\d+)/)?.[1];
  const [ghMajor = 0, ghMinor = 0] = (ghVersion ?? "0.0")
    .split(".")
    .map(Number);
  report(
    ghMajor > 2 || (ghMajor === 2 && ghMinor >= 94) ? "ok" : "fail",
    "GitHub CLI",
    ghVersion ? `${ghVersion} (need >=2.94.0)` : "not found",
  );
  const auth = runCommand("gh", ["auth", "status"]);
  report(
    auth.status === 0 ? "ok" : "fail",
    "GitHub authentication",
    auth.status === 0 ? "authenticated" : "run gh auth login",
  );
}

if (failures > 0) {
  console.error(`\nSetup doctor found ${failures} blocking problem(s).`);
  process.exitCode = 1;
} else {
  console.log("\nSetup doctor passed.");
}
