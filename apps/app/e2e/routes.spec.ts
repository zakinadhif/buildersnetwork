import type { Page } from "@playwright/test";
import { authed, expect, unauthed } from "./fixtures";

// Route-protection + home-content acceptance against the real app. Replaces the
// original template tests (which asserted a "My App" shell, an /api/items list,
// and a 404 page that this app never had).

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

async function mockHome(
  page: Page,
  { featured = "[]", feed = "[]" }: { featured?: string; feed?: string } = {},
) {
  await page.route("**/api/me", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(PROFILE),
    }),
  );
  await page.route("**/api/featured", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: featured,
    }),
  );
  await page.route("**/api/feed", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: feed }),
  );
}

// ---------------------------------------------------------------------------
// Unauthenticated users are redirected to /welcome (the entry screen)
// ---------------------------------------------------------------------------

unauthed("/ redirects to /welcome when unauthenticated", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/welcome/);
});

unauthed(
  "unknown route is discarded for a known app location",
  async ({ page }) => {
    await page.goto("/does-not-exist");
    // The catch-all bounces off the bogus path back to the app root (whence an
    // unauthenticated viewer continues toward /welcome) — never stranded on it.
    await expect(page).not.toHaveURL(/does-not-exist/);
    await expect(page).toHaveURL(/localhost:5173\/(welcome)?$/);
  },
);

// ---------------------------------------------------------------------------
// Authenticated members with a profile see the feed-first home
// ---------------------------------------------------------------------------

authed("/ lands on the Launchpad home with both sections", async ({ page }) => {
  await mockHome(page);
  await page.goto("/");
  await expect(page).toHaveURL(/\/home/);
  await expect(page.getByText("Pilihan inspiratif")).toBeVisible();
  await expect(page.getByText("Kabar terbaru")).toBeVisible();
});

authed("shell rail shows the signed-in member", async ({ page }) => {
  await mockHome(page);
  await page.goto("/home");
  // Identity now lives in the persistent shell rail, not a top bar.
  await expect(
    page.locator(".bn-nav-user", { hasText: "Test User" }),
  ).toBeVisible();
});

authed(
  "home shows empty states when there's no featured or feed",
  async ({ page }) => {
    await mockHome(page);
    await page.goto("/home");
    await expect(page.getByText("belum ada pilihan.")).toBeVisible();
    await expect(page.getByText("belum ada aktivitas.")).toBeVisible();
  },
);
