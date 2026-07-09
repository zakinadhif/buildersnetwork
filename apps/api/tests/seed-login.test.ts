/**
 * Seeded users must be able to log in.
 *
 * The seeder inserts `users` rows itself, but Better Auth's `emailAndPassword`
 * sign-in verifies against an `accounts` row (`providerId: "credential"`) that
 * holds the hashed password. Without it there is no credential, so every seeded
 * account is locked out — which makes per-PR preview environments useless for
 * anything behind auth.
 *
 * These tests drive the *real* rows `buildSeedCredentialAccounts()` writes
 * through a *real* Better Auth instance (backed by the in-memory adapter, so no
 * database is needed). That combination is the point: a hand-rolled hash, or a
 * drifting fixture, would store something that silently never verifies. Only an
 * end-to-end sign-in proves the credential is usable.
 *
 * The memory adapter keys by Better Auth's model names (`user`, `account`) —
 * the `usePlural` mapping to our `users`/`accounts` tables is a drizzle-adapter
 * concern and doesn't apply here.
 */

import {
  buildSeedCredentialAccounts,
  SEED_PASSWORD,
  SEED_USERS,
} from "@myapp/db";
import { betterAuth } from "better-auth";
import { type MemoryDB, memoryAdapter } from "better-auth/adapters/memory";
import { verifyPassword } from "better-auth/crypto";
import { describe, expect, it } from "vitest";

/** A Better Auth instance whose store contains exactly what the seeder writes. */
const createSeededAuth = async () => {
  const now = new Date();
  const db: MemoryDB = {
    user: SEED_USERS.map((u) => ({
      ...u,
      emailVerified: true,
      image: null,
      createdAt: now,
      updatedAt: now,
    })),
    // `createdAt` comes from a DB default in the real insert; supply it here.
    account: (await buildSeedCredentialAccounts()).map((a) => ({
      ...a,
      createdAt: now,
    })),
    session: [],
    verification: [],
  };

  const auth = betterAuth({
    baseURL: "http://localhost:3000",
    secret: "test-secret-value-at-least-32-characters",
    database: memoryAdapter(db),
    emailAndPassword: { enabled: true },
  });

  return { auth, db };
};

describe("seed account login", () => {
  it("signs in a seeded user and creates a session", async () => {
    const { auth, db } = await createSeededAuth();
    const seedUser = SEED_USERS[0];

    const result = await auth.api.signInEmail({
      body: { email: seedUser.email, password: SEED_PASSWORD },
    });

    expect(result.user.id).toBe(seedUser.id);
    expect(result.user.email).toBe(seedUser.email);
    // A session token is only issued after the password actually verified.
    expect(result.token).toEqual(expect.any(String));
    expect(result.token.length).toBeGreaterThan(0);

    // …and the session was persisted against the seeded user.
    expect(db.session).toHaveLength(1);
    expect(db.session[0].userId).toBe(seedUser.id);
  });

  it("lets every seeded user sign in", async () => {
    const { auth } = await createSeededAuth();

    for (const seedUser of SEED_USERS) {
      const result = await auth.api.signInEmail({
        body: { email: seedUser.email, password: SEED_PASSWORD },
      });
      expect(result.user.id).toBe(seedUser.id);
      expect(result.token).toBeTruthy();
    }
  });

  it("rejects a wrong password", async () => {
    const { auth, db } = await createSeededAuth();

    await expect(
      auth.api.signInEmail({
        body: { email: SEED_USERS[0].email, password: "not-the-password" },
      }),
    ).rejects.toThrow();

    expect(db.session).toHaveLength(0);
  });

  it("hashes with Better Auth's own verifier, not a bespoke scheme", async () => {
    // Guards the failure mode the sign-in tests can only catch indirectly: a
    // stored hash that no `verifyPassword` on the auth side will ever accept.
    const [account] = await buildSeedCredentialAccounts();

    expect(account.providerId).toBe("credential");
    expect(
      await verifyPassword({ hash: account.password, password: SEED_PASSWORD }),
    ).toBe(true);
    expect(
      await verifyPassword({ hash: account.password, password: "wrong" }),
    ).toBe(false);
  });

  it("builds one credential account per seed user, with stable ids", async () => {
    // `onConflictDoNothing` only makes re-seeding a no-op if the ids are
    // deterministic — a fresh `randomUUID()` each run would insert duplicates.
    const first = await buildSeedCredentialAccounts();
    const second = await buildSeedCredentialAccounts();

    expect(first).toHaveLength(SEED_USERS.length);
    expect(first.map((a) => a.id)).toEqual(second.map((a) => a.id));
    expect(new Set(first.map((a) => a.id)).size).toBe(SEED_USERS.length);
    expect(first.map((a) => a.userId)).toEqual(SEED_USERS.map((u) => u.id));
  });
});
