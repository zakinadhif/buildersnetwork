import type { AIProvider } from "@myapp/ai";
import type { createAuth } from "@myapp/auth";
import type { createDb } from "@myapp/db";
import { type Context, Hono } from "hono";
import { cors } from "hono/cors";

import aiRouter from "./routes/ai";

export type AppVariables = {
  auth: ReturnType<typeof createAuth>;
  db: ReturnType<typeof createDb>;
  ai: AIProvider;
};

export type AppEnv = { Variables: AppVariables };

export interface AppServices {
  db: ReturnType<typeof createDb>;
  auth: ReturnType<typeof createAuth>;
  ai: AIProvider;
  allowedOrigins: string[];
  gitSha?: string;
}

export function createApp(services: AppServices) {
  const { db, auth, ai, allowedOrigins, gitSha } = services;

  const app = new Hono<AppEnv>();

  const health = (c: Context) =>
    c.json({ ok: true, version: gitSha ?? "dev" });
  app.get("/healthz", health);
  app.get("/api/healthz", health);

  app.use(
    "/api/*",
    cors({
      origin: (origin) => {
        if (!origin) return undefined;
        return allowedOrigins.includes(origin) ? origin : undefined;
      },
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      exposeHeaders: ["Content-Length"],
      maxAge: 600,
      credentials: true,
    }),
  );

  app.use("*", async (c, next) => {
    c.set("db", db);
    c.set("auth", auth);
    c.set("ai", ai);
    await next();
  });

  app.all("/api/auth/*", async (c) => auth.handler(c.req.raw));
  app.route("/api/ai", aiRouter);

  return app;
}
