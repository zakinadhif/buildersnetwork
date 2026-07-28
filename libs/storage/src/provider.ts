export interface PutOptions {
  /** MIME type of the object (e.g. "image/png"). */
  contentType?: string;
  /** Arbitrary key/value metadata stored alongside the object. */
  metadata?: Record<string, string>;
}

/**
 * App-owned storage port. FlyDrive remains an implementation detail so routes
 * keep stable not-found and byte semantics across runtimes and library updates.
 */
export interface StorageProvider {
  put(
    key: string,
    body: Buffer | Uint8Array | string,
    options?: PutOptions,
  ): Promise<void>;
  /** Download an object, returning null when the key does not exist. */
  get(key: string): Promise<Buffer | null>;
  /** Delete an object; missing keys are a no-op. */
  delete(key: string): Promise<void>;
  /** Generate a temporary direct-download URL when the provider supports it. */
  getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
}
