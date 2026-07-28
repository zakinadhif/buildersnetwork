import type { Page } from "@playwright/test";
import { authed, expect, unauthed } from "./fixtures";

// Auth / entry-routing acceptance against the real app: unauthenticated users
// land on /welcome, and an authenticated member with a profile lands on the
// feed-first home (not the old template "My App" shell).

const PROFILE = {
  id: "test-user-id",
  name: "Test User",
  handle: "test",
  bio: null,
  interests: [],
  year: "Tingkat 2",
  major: "Informatika",
  skills: [],
};

// The Launchpad home fetches the viewer's profile + the curated featured list +
// the global feed. Empty bodies are enough to render.
async function mockHome(page: Page) {
  await page.route("**/api/me", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(PROFILE),
    }),
  );
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

unauthed("unauthenticated: / redirects to /welcome", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/welcome/);
});

authed(
  "authenticated with a profile: / lands on the feed-first home",
  async ({ page }) => {
    await mockHome(page);
    await page.goto("/");
    await expect(page).toHaveURL(/\/home/);
    await expect(page).not.toHaveURL(/\/welcome/);
    await expect(page.getByRole("heading", { name: "Scroll" })).toBeVisible();
  },
);

authed(
  "authenticated without a profile: / redirects to the minimal start (not the AI chat)",
  async ({ page }) => {
    await page.route("**/api/me", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "null",
      }),
    );
    await page.goto("/");
    // Onboarding is no longer a gate (issue #8): a profile-less member lands on
    // the quick one-field start, never forced through the AI chat.
    await expect(page).toHaveURL(/\/mulai/);
    await expect(page).not.toHaveURL(/\/onboarding/);
  },
);
