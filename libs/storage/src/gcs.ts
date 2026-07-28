import { Disk } from "flydrive";
import { GCSDriver } from "flydrive/drivers/gcs";
import { createFlyDriveStorage } from "./flydrive";
import type { StorageProvider } from "./provider";

export interface GcsConfig {
  bucket: string;
  projectId?: string;
  keyFilename?: string;
}

export function createGcsStorage(config: GcsConfig): StorageProvider {
  return createFlyDriveStorage(
    new Disk(
      new GCSDriver({
        bucket: config.bucket,
        projectId: config.projectId,
        keyFilename: config.keyFilename,
        usingUniformAcl: true,
        visibility: "private",
      }),
    ),
    (options) =>
      options
        ? {
            contentType: options.contentType,
            metadata: options.metadata,
          }
        : undefined,
  );
}
