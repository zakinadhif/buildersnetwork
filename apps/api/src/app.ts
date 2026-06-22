import type { AIProvider } from "@myapp/ai";
import type { createAuth } from "@myapp/auth";
import type { createDb } from "@myapp/db";
import type { EmailProvider } from "@myapp/email";
import { type Context, Hono } from "hono";
import { cors } from "hono/cors";

import aiRouter from "./routes/ai";
import { featuredRouter, feedRouter } from "./routes/feed";
import interestsRouter from "./routes/interests";
import karyaRouter from "./routes/karya";
import membersRouter from "./routes/members";
import otpRouter from "./routes/otp";
import profileRouter from "./routes/profile";

export type AppVariables = {
  auth: ReturnType<typeof createAuth>;
  db: ReturnType<typeof createDb>;
  ai: AIProvider;
  email: EmailProvider;
  // Sender address for outgoing email (EMAIL_FROM, with a default).
  emailFrom: string;
  // Team emails allowed to feature karya (DECISION-A) — env allowlist, not RBAC.
  adminEmails: string[];
};

export type AppEnv = { Variables: AppVariables };

export interface AppServices {
  db: ReturnType<typeof createDb>;
  auth: ReturnType<typeof createAuth>;
  ai: AIProvider;
  email: EmailProvider;
  emailFrom: string;
  allowedOrigins: string[];
  adminEmails: string[];
  gitSha?: string;
}

export function createApp(services: AppServices) {
  const {
    db,
    auth,
    ai,
    email,
    emailFrom,
    allowedOrigins,
    adminEmails,
    gitSha,
  } = services;

  const app = new Hono<AppEnv>();

  const health = (c: Context) => c.json({ ok: true, version: gitSha ?? "dev" });
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
    c.set("email", email);
    c.set("emailFrom", emailFrom);
    c.set("adminEmails", adminEmails);
    await next();
  });

  // Block sign-up for non-student emails before Better Auth processes the request.
  app.use("/api/auth/sign-up/email", async (c, next) => {
    if (c.req.method === "POST") {
      const body = (await c.req.raw
        .clone()
        .json()
        .catch(() => ({}))) as { email?: string };
      if (
        !String(body.email ?? "").endsWith("@student.telkomuniversity.ac.id")
      ) {
        return c.json(
          {
            message:
              "Hanya email @student.telkomuniversity.ac.id yang diizinkan.",
          },
          400,
        );
      }
    }
    return next();
  });

  // Gate all non-auth API routes for users who haven't verified their email yet.
  app.use("/api/*", async (c, next) => {
    const path = c.req.path;
    if (
      path === "/api/healthz" ||
      path.startsWith("/api/auth/") ||
      path.startsWith("/api/otp/")
    ) {
      return next();
    }
    const session = await c
      .get("auth")
      .api.getSession({ headers: c.req.raw.headers });
    if (session?.user && !session.user.emailVerified) {
      return c.json({ error: "email_not_verified" }, 403);
    }
    return next();
  });

  app.all("/api/auth/*", async (c) => auth.handler(c.req.raw));
  app.route("/api/otp", otpRouter);
  app.route("/api/ai", aiRouter);
  app.route("/api", profileRouter);
  app.route("/api/members", membersRouter);
  app.route("/api/interests", interestsRouter);
  app.route("/api/karya", karyaRouter);
  app.route("/api/feed", feedRouter);
  app.route("/api/featured", featuredRouter);

  return app;
}
