import type { Disk } from "flydrive";
import type { WriteOptions } from "flydrive/types";
import type { PutOptions, StorageProvider } from "./provider";

type WriteOptionsMapper = (options?: PutOptions) => WriteOptions | undefined;

/**
 * Narrows FlyDrive's broad Disk API to the stable semantics used by the app.
 */
export function createFlyDriveStorage(
  disk: Disk,
  mapWriteOptions: WriteOptionsMapper = (options) => options,
): StorageProvider {
  return {
    async put(key, body, options) {
      await disk.put(key, body, mapWriteOptions(options));
    },
    async get(key) {
      if (!(await disk.exists(key))) return null;
      return Buffer.from(await disk.getBytes(key));
    },
    async delete(key) {
      await disk.delete(key);
    },
    async getSignedUrl(key, expiresInSeconds = 3600) {
      return disk.getSignedUrl(key, { expiresIn: expiresInSeconds });
    },
  };
}
