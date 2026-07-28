import type { PutOptions, StorageProvider } from "./provider";

/**
 * Minimal native Workers binding surface. Kept as a separate export so the
 * Worker does not bundle FlyDrive's Node-only filesystem/cloud drivers.
 */
export interface R2BucketLike {
  put(
    key: string,
    value: ArrayBuffer | ArrayBufferView | string,
    options?: {
      httpMetadata?: { contentType?: string };
      customMetadata?: Record<string, string>;
    },
  ): Promise<unknown>;
  get(key: string): Promise<{ arrayBuffer(): Promise<ArrayBuffer> } | null>;
  delete(key: string): Promise<void>;
}

export function createR2Storage(bucket: R2BucketLike): StorageProvider {
  return {
    async put(key, body, options?: PutOptions) {
      await bucket.put(key, body, {
        httpMetadata: options?.contentType
          ? { contentType: options.contentType }
          : undefined,
        customMetadata: options?.metadata,
      });
    },
    async get(key) {
      const object = await bucket.get(key);
      return object ? Buffer.from(await object.arrayBuffer()) : null;
    },
    async delete(key) {
      await bucket.delete(key);
    },
    async getSignedUrl() {
      throw new Error(
        "Native R2 bindings cannot create signed URLs; serve objects through the API proxy route.",
      );
    },
  };
}
