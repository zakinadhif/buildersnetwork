import type { PutOptions, StorageProvider } from "./index";

/**
 * Minimal shape of the Cloudflare Workers R2 binding this adapter uses. Declared
 * locally so `@myapp/storage` needn't depend on `@cloudflare/workers-types`; the
 * Worker passes its real `R2Bucket` binding, which is structurally compatible.
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

/**
 * Storage adapter over a native Workers R2 binding — no AWS SDK, no credentials,
 * no network round-trip to sign requests. Use this on Cloudflare Workers; the
 * S3 adapter (see {@link createS3Storage}) covers Node/dev, talking to the same
 * R2 bucket over its S3-compatible API.
 *
 * `getSignedUrl` is intentionally unsupported: R2 bindings don't presign, and
 * this app serves objects through an API proxy route instead.
 */
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
      const obj = await bucket.get(key);
      if (!obj) return null;
      return Buffer.from(await obj.arrayBuffer());
    },

    async delete(key) {
      await bucket.delete(key);
    },

    async getSignedUrl() {
      throw new Error(
        "getSignedUrl is not supported by the R2 binding adapter; serve objects through the API proxy route instead.",
      );
    },
  };
}
