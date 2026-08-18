import "dotenv/config";
import { readFile } from "node:fs/promises";
import { loadConfig } from "@myapp/config";
import { createDb, runSeedCli, seeders } from "@myapp/db";
import { createD1HttpDb } from "@myapp/db/d1-http";
import {
  MOCKUP_IMAGE_FILENAMES,
  type MockupCoverTheme,
} from "@myapp/mockup-data";
import {
  createS3Storage,
  createStorageFromEnv,
  type StorageProvider,
} from "@myapp/storage";

/**
 * Seed CLI. Dispatches to the seed runner in @myapp/db, which parses flags from
 * process.argv:
 *
 *   pnpm db:seed                           # run all seeders
 *   pnpm db:seed -- --only items           # run a single seeder
 *   pnpm db:seed -- --reset --yes          # empty tables then re-seed
 *   pnpm db:seed -- --list                 # list registered seeders
 *   pnpm db:seed -- --help                 # full usage
 *
 * Two targets, chosen by which env vars are set:
 *
 *   D1 over HTTP — when D1_DATABASE_ID, CLOUDFLARE_ACCOUNT_ID and
 *     CLOUDFLARE_API_TOKEN are all present. This is how CI seeds a per-PR
 *     preview database. Nothing else reaches a remote D1 from Node:
 *     @libsql/client cannot dial it, and drizzle-orm/d1 wants a Worker binding.
 *     DATABASE_URL is not read on this path.
 *
 *   libSQL — otherwise, from DATABASE_URL: `file:./local.db` for local dev,
 *     `libsql://…` for a remote Turso database.
 *
 * Production safety: refuses to run when NODE_ENV=production unless `--force` is
 * also passed. Seeding D1 additionally gives up transactional rollback (D1 has
 * no interactive transactions) — see `supportsTransactions` in the runner.
 */
const d1DatabaseId = process.env.D1_DATABASE_ID;
const cloudflareAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const cloudflareApiToken = process.env.CLOUDFLARE_API_TOKEN;

function previewStorage(): StorageProvider | undefined {
  const bucket = process.env.R2_BUCKET;
  const accessKey = process.env.R2_S3_ACCESS_KEY_ID;
  const secretKey = process.env.R2_S3_SECRET_ACCESS_KEY;
  if (!bucket && !accessKey && !secretKey) return undefined;
  if (!bucket || !accessKey || !secretKey || !cloudflareAccountId) {
    throw new Error(
      "seed: preview image upload requires R2_BUCKET, R2_S3_ACCESS_KEY_ID, R2_S3_SECRET_ACCESS_KEY, and CLOUDFLARE_ACCOUNT_ID.",
    );
  }
  return createS3Storage({
    bucket,
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
    region: "auto",
    endpoint: `https://${cloudflareAccountId}.r2.cloudflarestorage.com`,
    forcePathStyle: false,
  });
}

const previewSeedStorage = previewStorage();

async function uploadMockupImage(
  storage: StorageProvider | undefined,
  theme: MockupCoverTheme,
  key: string,
): Promise<void> {
  if (!storage) return;
  const image = await readFile(
    new URL(
      `../../../mockups/src/images/${MOCKUP_IMAGE_FILENAMES[theme]}`,
      import.meta.url,
    ),
  );
  await storage.put(key, image, { contentType: "image/jpeg" });
}

await runSeedCli({
  loadConfig: () => {
    if (d1DatabaseId) {
      if (!cloudflareAccountId || !cloudflareApiToken) {
        throw new Error(
          "seed: D1_DATABASE_ID is set, so CLOUDFLARE_ACCOUNT_ID and " +
            "CLOUDFLARE_API_TOKEN are required to reach it.",
        );
      }
      return {
        db: createD1HttpDb({
          accountId: cloudflareAccountId,
          databaseId: d1DatabaseId,
          apiToken: cloudflareApiToken,
        }),
        // Same NODE_ENV gate as below: the id is just a uuid, and nothing here
        // can tell a preview database from the production one.
        isProduction: process.env.NODE_ENV === "production",
        supportsTransactions: false,
        uploadMockupImage: previewSeedStorage
          ? (theme: MockupCoverTheme, key: string) =>
              uploadMockupImage(previewSeedStorage, theme, key)
          : undefined,
      };
    }

    const config = loadConfig();
    const db = createDb(config.DATABASE_URL, {
      authToken: config.DATABASE_AUTH_TOKEN,
    });
    const storage = createStorageFromEnv(config);
    return {
      db,
      isProduction: config.NODE_ENV === "production",
      uploadMockupImage: storage
        ? (theme: MockupCoverTheme, key: string) =>
            uploadMockupImage(storage, theme, key)
        : undefined,
      close: () => db.$client.close(),
    };
  },
  seeders,
});
