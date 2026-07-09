/**
 * Email provider selection in the Workers entrypoint.
 *
 * Providers are identified by behaviour, not by mocking the factories: the noop
 * one logs and resolves, the Workers one calls its binding, the Resend one POSTs
 * to api.resend.com. That keeps the test honest about what each branch actually
 * does when `send()` is called — which is where the bug lived: the Worker booted
 * fine and only threw on the first send.
 *
 * See plans/how-to/preview-environments.md ("side effects are absent, not
 * trapped") for why the no-binding branch exists.
 */

import type { SendEmailOptions, WorkersEmailBinding } from "@myapp/email";
import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AppEnv } from "../src/app";
import { selectEmail } from "../src/lib/email";
import otpRouter from "../src/routes/otp";
import { createDbMock } from "./helpers/harness";

const OPTIONS: SendEmailOptions = {
  to: "mahasiswa@student.telkomuniversity.ac.id",
  from: "Al-Fath Berkarya <noreply@buildersnetwork.web.id>",
  subject: "Kode verifikasi kamu",
  text: "Kode OTP kamu: 123456",
};

/** A stand-in for the [[send_email]] binding, recording what it was handed. */
const createBindingMock = () => {
  const sent: SendEmailOptions[] = [];
  const binding: WorkersEmailBinding = {
    send: async (message) => {
      sent.push(message);
      return { messageId: "test-message-id" };
    },
  };
  return { binding, sent };
};

/** Stubs global fetch so the Resend branch never reaches the network. */
const stubFetchOk = () => {
  const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

beforeEach(() => {
  vi.unstubAllGlobals();
});

// ── Provider selection ──────────────────────────────────────────────────────

describe("selectEmail", () => {
  it("falls back to the noop provider when neither RESEND_API_KEY nor the EMAIL binding is present", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});

    const email = selectEmail({});

    // The regression: this used to be createWorkersEmail(undefined), which
    // built fine and threw `binding.send is not a function` right here.
    await expect(email.send(OPTIONS)).resolves.toBeUndefined();
    expect(log).toHaveBeenCalledWith(
      "[email:noop] send suppressed",
      expect.objectContaining({ subject: OPTIONS.subject }),
    );
  });

  it("uses the Workers binding when it is present", async () => {
    const { binding, sent } = createBindingMock();

    await selectEmail({ EMAIL: binding }).send(OPTIONS);

    expect(sent).toEqual([OPTIONS]);
  });

  it("prefers Resend over the Workers binding when RESEND_API_KEY is set", async () => {
    const fetchMock = stubFetchOk();
    const { binding, sent } = createBindingMock();

    await selectEmail({ RESEND_API_KEY: "re_test_key", EMAIL: binding }).send(
      OPTIONS,
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer re_test_key",
        }),
      }),
    );
    expect(sent).toEqual([]); // binding untouched — Resend won
  });

  it("uses Resend when RESEND_API_KEY is set and no binding exists", async () => {
    const fetchMock = stubFetchOk();

    await selectEmail({ RESEND_API_KEY: "re_test_key" }).send(OPTIONS);

    expect(fetchMock).toHaveBeenCalledOnce();
  });
});

// ── The route that motivated the fallback ───────────────────────────────────

describe("POST /otp/send with email delivery disabled", () => {
  it("returns 200 and records the code, without sending mail", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    const { db, writes } = createDbMock();
    const email = selectEmail({}); // preview: no key, no binding

    const app = new Hono<AppEnv>();
    app.use("*", async (c, next) => {
      c.set("db", db as never);
      c.set("email", email);
      c.set("emailFrom", "Al-Fath Berkarya <noreply@buildersnetwork.web.id>");
      await next();
    });
    app.route("/otp", otpRouter);

    const res = await app.request("/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "mahasiswa@student.telkomuniversity.ac.id",
      }),
    });

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });

    // The verification row is still written — delivery is suppressed, not the
    // signup step. `/verify` reads this row back.
    const insert = writes.find((w) => w.op === "insert");
    expect(insert?.values).toMatchObject({
      identifier: "mahasiswa@student.telkomuniversity.ac.id",
      value: expect.stringMatching(/^\d{6}$/),
    });
  });
});
