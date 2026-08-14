import { Hono } from "hono";
import type { AppEnv } from "../app";

const app = new Hono<AppEnv>();

app.get("/", async (c) => c.json(await c.get("featureFlags").snapshot()));

export default app;
