import type { Page } from "@playwright/test";
import { authed, expect } from "./fixtures";

// Exit criterion for the Launchpad milestone: a new verified member completes
// the bounded profile form, lands in the shell without an AI gate, and can still
// opt into the assistant later. Feed/featured are mocked.

/** Stateful profile: null until the minimal-start (or assistant) saves one. */
function profileState(page: Page) {
  let profile: Record<string, unknown> | null = null;
  const saved: Record<string, unknown>[] = [];

  page.route("**/api/me", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: profile ? JSON.stringify(profile) : "null",
    }),
  );
  page.route("**/api/profile", async (route) => {
    const body = route.request().postDataJSON() as Record<string, unknown>;
    saved.push(body);
    profile = {
      id: "test-user-id",
      name: body.name ?? "",
      handle: body.handle ?? null,
      bio: body.bio ?? null,
      interests: body.interests ?? [],
      year: body.year ?? "",
      major: body.major ?? "",
      skills: body.skills ?? [],
    };
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });

  return { saved: () => saved };
}

async function mockFeed(page: Page) {
  for (const path of ["**/api/featured", "**/api/feed"]) {
    await page.route(path, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
      }),
    );
  }
}

authed(
  "new member: profile setup → Launchpad shell (no forced chat) → AI tab enriches profile",
  async ({ page }) => {
    const state = profileState(page);
    await mockFeed(page);

    // The chat stream replies with the end signal; the extraction call returns a
    // profile draft. (useStream reads /api/ai/stream as plain text.)
    await page.route("**/api/ai/stream", (route) =>
      route.fulfill({
        status: 200,
        contentType: "text/plain",
        body: "mantap! oke, biar aku susun profil kamu sekarang.",
      }),
    );
    await page.route("**/api/ai/complete", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          text: JSON.stringify({
            name: "Test User",
            handle: "testu",
            bio: "lagi bikin app buat komunitas kampus",
            year: "Tingkat 2",
            major: "Informatika",
            skills: ["React"],
            interests: ["Komunitas"],
          }),
        }),
      }),
    );

    // 1) A profile-less member is sent to the minimal start, not the AI chat.
    await page.goto("/");
    await expect(page).toHaveURL(/\/mulai/);
    await expect(page).not.toHaveURL(/\/onboarding/);

    // 2) The ratified bounded form → into the Launchpad shell.
    const nameField = page.getByLabel("Nama", { exact: true });
    await expect(nameField).toHaveValue("Test User"); // prefilled from auth
    await expect(page.getByLabel("Handle")).toHaveValue("test_user");
    await page.getByLabel("Program studi").selectOption("Teknik Informatika");
    await page.getByLabel("Angkatan").selectOption("2023");
    await page.getByRole("button", { name: "React" }).click();
    await page.getByRole("button", { name: "Komunitas" }).click();
    await page.getByRole("button", { name: "Simpan & masuk" }).click();

    await expect(page).toHaveURL(/\/home/);
    await expect(page.getByRole("heading", { name: "Scroll" })).toBeVisible();
    await expect(
      page.locator(".bn-nav-user", { hasText: "Test User" }),
    ).toBeVisible();

    // 3) Open the optional AI assistant from Scroll (not primary navigation).
    await page.getByRole("button", { name: /Butuh teman berpikir/ }).click();
    await expect(page).toHaveURL(/\/assistant/);

    // 4) Run one turn — the reply carries the end signal, so a draft is built.
    const input = page.locator(".chat-textarea");
    await input.fill("aku lagi bikin app komunitas kampus");
    await input.press("Enter");

    // 5) The editable draft review appears (AI-2: not written straight through).
    await expect(
      page.getByRole("button", { name: /Terapkan ke profil/ }),
    ).toBeVisible();
    await expect(
      page
        .locator(".pf", { hasText: "Bio" })
        .getByText("lagi bikin app buat komunitas kampus"),
    ).toBeVisible();

    // 6) Apply → profile updates.
    await page.getByRole("button", { name: /Terapkan ke profil/ }).click();
    await expect(page.getByText("Profil kamu ke-update ✓")).toBeVisible();

    // The last saved payload is the enriched profile (merged onto the minimal one).
    const saved = state.saved();
    const last = saved[saved.length - 1];
    expect(last).toMatchObject({ name: "Test User", major: "Informatika" });
    expect(last.interests).toContain("Komunitas");
    expect(last.skills).toContain("React");
  },
);
