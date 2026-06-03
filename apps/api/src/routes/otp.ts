import { users, verifications } from "@myapp/db/schema";
import { and, desc, eq, gt } from "drizzle-orm";
import { Hono } from "hono";
import type { AppEnv } from "../app";

const DOMAIN = "@student.telkomuniversity.ac.id";
const OTP_TTL_MS = 10 * 60 * 1000;

const app = new Hono<AppEnv>();

app.post("/send", async (c) => {
  const { email } = await c.req.json<{ email: string }>();

  if (!email?.endsWith(DOMAIN)) {
    return c.json({ error: `Hanya email ${DOMAIN} yang diizinkan.` }, 400);
  }

  const db = c.get("db");
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await db.delete(verifications).where(eq(verifications.identifier, email));
  await db.insert(verifications).values({
    id: crypto.randomUUID(),
    identifier: email,
    value: code,
    expiresAt,
  });

  await c.get("email").send({
    to: email,
    from: "Al-Fath Berkarya <noreply@buildersnetwork.web.id>",
    subject: "Kode verifikasi kamu",
    text: `Kode OTP kamu: ${code}\n\nBerlaku 10 menit. Jangan bagikan kode ini ke siapa pun.`,
    html: `<p>Kode OTP kamu: <strong>${code}</strong></p><p>Berlaku 10 menit. Jangan bagikan kode ini ke siapa pun.</p>`,
  });

  return c.json({ ok: true });
});

app.post("/verify", async (c) => {
  const { email, code } = await c.req.json<{ email: string; code: string }>();

  if (!email || !code) {
    return c.json({ error: "Email dan kode wajib diisi." }, 400);
  }

  const db = c.get("db");
  const now = new Date();

  const [row] = await db
    .select()
    .from(verifications)
    .where(
      and(
        eq(verifications.identifier, email),
        gt(verifications.expiresAt, now),
      ),
    )
    .orderBy(desc(verifications.createdAt))
    .limit(1);

  if (!row) {
    return c.json({ error: "Kode tidak valid atau sudah kedaluwarsa." }, 400);
  }

  if (row.value !== code) {
    return c.json({ error: "Kode salah." }, 400);
  }

  await db.delete(verifications).where(eq(verifications.identifier, email));
  await db
    .update(users)
    .set({ emailVerified: true })
    .where(eq(users.email, email));

  return c.json({ ok: true });
});

export default app;
