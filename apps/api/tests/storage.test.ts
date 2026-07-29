import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Config } from "@myapp/config";
import { createStorageFromEnv, type StorageProvider } from "@myapp/storage";
import { createR2Storage } from "@myapp/storage/r2";
import { afterEach, describe, expect, it } from "vitest";

const temporaryRoots: string[] = [];

function config(overrides: Partial<Config> = {}): Config {
  return {
    NODE_ENV: "development",
    PORT: 8080,
    APP_URL: "http://localhost:5173",
    DATABASE_URL: ":memory:",
    STORAGE_REGION: "auto",
    STORAGE_FORCE_PATH_STYLE: false,
    BETTER_AUTH_SECRET: "dev-secret-change-me-this-is-at-least-32-chars",
    ...overrides,
  };
}

async function temporaryRoot() {
  const root = await mkdtemp(join(tmpdir(), "buildersnetwork-storage-"));
  temporaryRoots.push(root);
  return root;
}

afterEach(async () => {
  await Promise.all(
    temporaryRoots
      .splice(0)
      .map((root) => rm(root, { recursive: true, force: true })),
  );
});

describe("Node FlyDrive storage", () => {
  it("defaults development to a persistent local filesystem disk", async () => {
    const root = await temporaryRoot();
    const first = createStorageFromEnv(config({ STORAGE_LOCAL_ROOT: root }));
    expect(first).toBeDefined();

    await first?.put("karya/k1/cover.png", new Uint8Array([1, 2, 3]), {
      contentType: "image/png",
    });
    expect(await first?.get("karya/k1/cover.png")).toEqual(
      Buffer.from([1, 2, 3]),
    );

    const afterRestart = createStorageFromEnv(
      config({ STORAGE_LOCAL_ROOT: root }),
    );
    expect(await afterRestart?.get("karya/k1/cover.png")).toEqual(
      Buffer.from([1, 2, 3]),
    );

    await afterRestart?.delete("karya/k1/cover.png");
    await afterRestart?.delete("karya/k1/cover.png");
    expect(await afterRestart?.get("karya/k1/cover.png")).toBeNull();
  });

  it("keeps storage opt-in in production", () => {
    expect(
      createStorageFromEnv(config({ NODE_ENV: "production" })),
    ).toBeUndefined();
  });

  it("validates an explicitly selected remote driver", () => {
    expect(() =>
      createStorageFromEnv(
        config({
          NODE_ENV: "production",
          STORAGE_DRIVER: "s3",
          STORAGE_BUCKET: "uploads",
        }),
      ),
    ).toThrow(
      "S3 storage is not configured. Missing: STORAGE_ACCESS_KEY, STORAGE_SECRET_KEY",
    );
  });

  it("constructs S3-compatible and GCS providers without leaking FlyDrive", () => {
    const s3: StorageProvider | undefined = createStorageFromEnv(
      config({
        NODE_ENV: "production",
        STORAGE_DRIVER: "s3",
        STORAGE_BUCKET: "uploads",
        STORAGE_ACCESS_KEY: "access",
        STORAGE_SECRET_KEY: "secret",
        STORAGE_REGION: "ap-southeast-1",
      }),
    );
    const gcs: StorageProvider | undefined = createStorageFromEnv(
      config({
        NODE_ENV: "production",
        STORAGE_DRIVER: "gcs",
        STORAGE_BUCKET: "uploads",
        STORAGE_GCS_PROJECT_ID: "project",
      }),
    );

    expect(s3).toBeDefined();
    expect(gcs).toBeDefined();
  });
});

describe("Workers R2 storage", () => {
  it("preserves put/get/delete behavior through the native binding", async () => {
    const objects = new Map<string, Uint8Array>();
    const bucket = {
      async get(key: string) {
        const bytes = objects.get(key);
        return bytes
          ? {
              async arrayBuffer() {
                return Uint8Array.from(bytes).buffer;
              },
            }
          : null;
      },
      async put(key: string, value: Uint8Array | string) {
        objects.set(
          key,
          typeof value === "string" ? new TextEncoder().encode(value) : value,
        );
      },
      async delete(key: string | string[]) {
        for (const item of Array.isArray(key) ? key : [key]) {
          objects.delete(item);
        }
      },
    };

    const storage: StorageProvider = createR2Storage(bucket);
    await storage.put("karya/k1/cover.png", new Uint8Array([4, 5, 6]), {
      contentType: "image/png",
    });
    expect(await storage.get("karya/k1/cover.png")).toEqual(
      Buffer.from([4, 5, 6]),
    );
    await storage.delete("karya/k1/cover.png");
    expect(await storage.get("karya/k1/cover.png")).toBeNull();
  });
});
