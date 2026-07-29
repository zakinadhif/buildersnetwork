import type { StorageProvider } from "@myapp/storage";

/**
 * In-memory app storage provider for route tests. Deliberately knows nothing
 * about FlyDrive so the vendor boundary remains enforced by the test shape.
 */
export function fakeStorage() {
  const store = new Map<string, Buffer>();
  const puts: { key: string; contentType?: string }[] = [];
  const deletes: string[] = [];
  const storage: StorageProvider = {
    async put(key, body, options) {
      store.set(key, Buffer.from(body));
      puts.push({ key, contentType: options?.contentType });
    },
    async get(key) {
      return store.get(key) ?? null;
    },
    async delete(key: string) {
      store.delete(key);
      deletes.push(key);
    },
    async getSignedUrl() {
      return "unused";
    },
  };

  return { storage, store, puts, deletes };
}
