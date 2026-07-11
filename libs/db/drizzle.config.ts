/// <reference types="node" />
import { defineConfig } from "drizzle-kit";

// Defaults to an on-disk SQLite file so `db:generate` (which only reads the
// schema) and `db:push`/`db:studio`/`db:migrate` (which connect) work locally
// with no database server to provision. Set DATABASE_URL to target another
// database — e.g. `libsql://…` for Turso, with DATABASE_AUTH_TOKEN.
//
// The `turso` dialect is SQLite; it just tells drizzle-kit to connect over
// @libsql/client (the same driver the app uses) instead of better-sqlite3.
// Migrating a D1 database is a separate path — `wrangler d1 migrations apply`.
const databaseUrl = process.env.DATABASE_URL ?? "file:./local.db";

export default defineConfig({
  out: "./migrations",
  schema: "./src/schema/*.ts",
  dialect: "turso",
  dbCredentials: {
    url: databaseUrl,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
  tablesFilter: ["!auth_*"],
});
