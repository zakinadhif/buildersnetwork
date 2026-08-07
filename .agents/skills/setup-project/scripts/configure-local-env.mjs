import { randomBytes } from "node:crypto";
import { access, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const examplePath = resolve(root, "deploy/.env.example");
const envPath = resolve(root, "apps/api/.env");

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

let contents;
let action;

if (await exists(envPath)) {
  contents = await readFile(envPath, "utf8");
  action = "updated";
} else {
  contents = await readFile(examplePath, "utf8");
  action = "created";
}

const secretLine = /^BETTER_AUTH_SECRET=(.*)$/m;
const match = contents.match(secretLine);

if (match?.[1]?.trim()) {
  console.log(
    "Local environment already has BETTER_AUTH_SECRET; left it unchanged.",
  );
  process.exit(0);
}

const secret = randomBytes(32).toString("base64url");
contents = match
  ? contents.replace(secretLine, `BETTER_AUTH_SECRET=${secret}`)
  : `${contents.trimEnd()}\nBETTER_AUTH_SECRET=${secret}\n`;

await writeFile(envPath, contents, { encoding: "utf8", mode: 0o600 });
console.log(
  `${action === "created" ? "Created" : "Updated"} apps/api/.env with a generated local auth secret.`,
);
