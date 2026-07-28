import { resolve } from "node:path";
import { type Config, loadConfig, loadStorageConfig } from "@myapp/config";
import { createGcsStorage } from "./gcs";
import { createLocalStorage } from "./local";
import type { StorageProvider } from "./provider";
import { createS3Storage } from "./s3";

const DEFAULT_LOCAL_ROOT = new URL(
  "../../../apps/api/.data/uploads/",
  import.meta.url,
);

/**
 * Resolves the Node runtime's app-owned provider. Development defaults to a
 * persistent local FlyDrive filesystem disk; production stays opt-in.
 */
export function createStorageFromEnv(
  config: Config = loadConfig(),
): StorageProvider | undefined {
  const storage = loadStorageConfig(config);

  switch (storage.driver) {
    case "disabled":
      return undefined;
    case "fs":
      return createLocalStorage(
        storage.root ? resolve(storage.root) : DEFAULT_LOCAL_ROOT,
      );
    case "s3":
      return createS3Storage({
        bucket: storage.bucket,
        region: storage.region,
        accessKeyId: storage.accessKey,
        secretAccessKey: storage.secretKey,
        endpoint: storage.endpoint,
        forcePathStyle: storage.forcePathStyle,
      });
    case "gcs":
      return createGcsStorage({
        bucket: storage.bucket,
        projectId: storage.projectId,
        keyFilename: storage.keyFilename,
      });
  }
}
