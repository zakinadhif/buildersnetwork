import { Disk } from "flydrive";
import { S3Driver } from "flydrive/drivers/s3";
import { createFlyDriveStorage } from "./flydrive";
import type { StorageProvider } from "./provider";

export interface S3Config {
  bucket: string;
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  endpoint?: string;
  forcePathStyle?: boolean;
}

export function createS3Storage(config: S3Config): StorageProvider {
  return createFlyDriveStorage(
    new Disk(
      new S3Driver({
        bucket: config.bucket,
        region: config.region,
        ...(config.accessKeyId
          ? {
              credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey ?? "",
              },
            }
          : {}),
        ...(config.endpoint ? { endpoint: config.endpoint } : {}),
        forcePathStyle: config.forcePathStyle ?? false,
        supportsACL: false,
        visibility: "private",
      }),
    ),
    (options) =>
      options
        ? {
            contentType: options.contentType,
            Metadata: options.metadata,
          }
        : undefined,
  );
}
