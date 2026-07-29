import type { Page } from "@playwright/test";
import { authed, expect } from "./fixtures";

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

const KARYA = [
  {
    id: "k1",
    title: "Loom",
    description: "Sinkronisasi file peer-to-peer untuk tim kecil.",
    stages: ["building"],
    interests: ["Open Source", "Web"],
    coverUrl: null,
    screenshots: [],
    roster: [
      {
        id: "owner-id",
        name: "Hafiz Maulana",
        handle: "hafiz",
        image: null,
      },
    ],
    memberCount: 1,
  },
  {
    id: "k2",
    title: "Rasa",
    description: "Rekomendasi kuliner lokal untuk mahasiswa.",
    stages: ["validating"],
    interests: ["AI/ML"],
    coverUrl: null,
    screenshots: [],
    roster: [],
    memberCount: 0,
  },
];

async function mockMe(page: Page) {
  await page.route("**/api/me", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(PROFILE),
    }),
  );
}

authed(
  "Karya catalog renders real items, filters them, and drills into detail",
  async ({ page }) => {
    await mockMe(page);
    await page.route("**/api/karya", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(KARYA),
      }),
    );

    await page.goto("/karya");

    await expect(page.getByRole("heading", { name: "Karya" })).toBeVisible();
    await expect(page.locator(".karya-catalog .karya-card")).toHaveCount(2);
    await expect(page.getByText("Loom")).toBeVisible();
    await expect(page.getByText("Rasa")).toBeVisible();

    const search = page.getByRole("searchbox", { name: "Cari karya" });
    await search.fill("open source");
    await expect(page.locator(".karya-catalog .karya-card")).toHaveCount(1);
    await expect(page.getByText("Loom")).toBeVisible();
    await expect(page.getByText("Rasa")).toHaveCount(0);

    await search.clear();
    await page.getByRole("button", { name: "AI/ML", exact: true }).click();
    await expect(page.locator(".karya-catalog .karya-card")).toHaveCount(1);
    await expect(page.getByText("Rasa")).toBeVisible();

    await page.getByRole("button", { name: "Semua", exact: true }).click();
    await page.route("**/api/karya/k1", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ...KARYA[0],
          createdBy: "owner-id",
          viewerMembership: null,
          pendingRequests: [],
          featured: false,
          viewerIsAdmin: false,
        }),
      }),
    );
    await page.route("**/api/karya/k1/posts", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
      }),
    );

    await page.locator(".karya-card", { hasText: "Loom" }).click();
    await expect(page).toHaveURL(/\/karya\/k1/);
    await expect(page.getByRole("heading", { name: "Loom" })).toBeVisible();
  },
);

authed(
  "Karya catalog distinguishes empty and failed loads",
  async ({ page }) => {
    await mockMe(page);
    await page.route("**/api/karya", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
      }),
    );

    await page.goto("/karya");
    await expect(page.getByText("Belum ada karya di katalog")).toBeVisible();

    await page.unroute("**/api/karya");
    await page.route("**/api/karya", (route) =>
      route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ error: "unavailable" }),
      }),
    );
    await page.reload();
    await expect(page.getByRole("alert")).toContainText(
      "Katalog belum bisa dimuat",
    );
    await expect(page.getByRole("button", { name: "Coba lagi" })).toBeVisible();
  },
);
