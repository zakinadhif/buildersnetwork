import { cp, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";
import process from "node:process";

const root = resolve(import.meta.dirname, "..");
const sourceGuidance = join(root, "AGENTS.md");
const sourceSkills = join(root, ".agents", "skills");
const targetGuidance = join(root, "CLAUDE.md");
const targetSkills = join(root, ".claude", "skills");
const check = process.argv.slice(2).join(" ") === "--check";

async function listFiles(directory, root = directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return listFiles(path, root);
      if (entry.isFile()) return [relative(root, path)];
      return [];
    }),
  );
  return files.flat();
}

async function matches(source, target) {
  try {
    return (await readFile(source)).equals(await readFile(target));
  } catch {
    return false;
  }
}

async function generatedMatches() {
  if (!(await matches(sourceGuidance, targetGuidance))) return false;

  const sourceFiles = await listFiles(sourceSkills);
  const targetFiles = await listFiles(targetSkills).catch(() => []);
  if (sourceFiles.length !== targetFiles.length) return false;

  for (const file of sourceFiles) {
    if (!targetFiles.includes(file) || !(await matches(join(sourceSkills, file), join(targetSkills, file)))) {
      return false;
    }
  }
  return true;
}

if (check) {
  if (!(await generatedMatches())) {
    console.error("Generated Claude Code configuration is stale. Run: pnpm sync:agent-config");
    process.exitCode = 1;
  }
} else {
  const staging = await mkdtemp(join(tmpdir(), "buildersnetwork-agent-config-"));
  try {
    await cp(sourceSkills, join(staging, "skills"), { recursive: true });
    await rm(targetSkills, { recursive: true, force: true });
    await cp(join(staging, "skills"), targetSkills, { recursive: true });
    await writeFile(targetGuidance, await readFile(sourceGuidance));
  } finally {
    await rm(staging, { recursive: true, force: true });
  }
}
