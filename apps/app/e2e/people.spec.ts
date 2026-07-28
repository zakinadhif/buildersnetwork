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

const MEMBERS = [
  {
    id: "m1",
    name: "Dinda Pratiwi",
    handle: "dinda",
    bio: "Pemikir visual yang suka merapikan pengalaman produk.",
    interests: ["Design Systems"],
    year: "Tingkat 2",
    major: "Informatika",
    skills: ["Figma", "TypeScript"],
  },
  {
    id: "m2",
    name: "Rizal Anwar",
    handle: "rizal",
    bio: "Membangun perkakas open source untuk web.",
    interests: ["Building in Public"],
    year: "Tingkat 4",
    major: "Rekayasa Perangkat Lunak",
    skills: ["Rust", "TypeScript"],
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
  "People loads real builders, filters them, and drills into a profile",
  async ({ page }) => {
    await mockMe(page);

    let releaseMembers: (() => void) | undefined;
    const membersGate = new Promise<void>((resolve) => {
      releaseMembers = resolve;
    });
    await page.route("**/api/members", async (route) => {
      await membersGate;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MEMBERS),
      });
    });

    await page.goto("/people");
    await expect(page.getByText("Memuat direktori builder…")).toBeVisible();

    releaseMembers?.();
    await expect(
      page.getByRole("button", { name: "Buka profil Dinda Pratiwi" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Buka profil Rizal Anwar" }),
    ).toBeVisible();
    await expect(page.getByText("2 orang")).toBeVisible();

    const search = page.getByRole("searchbox", {
      name: "Cari builder berdasarkan nama, skill, atau minat",
    });
    await search.fill("Rust");
    await expect(
      page.getByRole("button", { name: "Buka profil Dinda Pratiwi" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Buka profil Rizal Anwar" }),
    ).toBeVisible();
    await expect(page.getByText("1 orang")).toBeVisible();

    await page.getByRole("button", { name: "Hapus filter" }).click();
    const designSystems = page.getByRole("button", {
      name: "Design Systems",
      exact: true,
    });
    await designSystems.click();
    await expect(designSystems).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.getByRole("button", { name: "Buka profil Dinda Pratiwi" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Buka profil Rizal Anwar" }),
    ).toHaveCount(0);

    await page.route("**/api/members/m1", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MEMBERS[0]),
      }),
    );
    await page
      .getByRole("button", { name: "Buka profil Dinda Pratiwi" })
      .click();
    await expect(page).toHaveURL(/\/member\/m1$/);
    await expect(
      page.getByRole("heading", { name: "Dinda Pratiwi" }),
    ).toBeVisible();
  },
);

authed(
  "People distinguishes an empty directory from filtered zero results",
  async ({ page }) => {
    await mockMe(page);
    await page.route("**/api/members", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
      }),
    );

    await page.goto("/people");
    await expect(
      page.getByText("Belum ada builder di direktori."),
    ).toBeVisible();
    await expect(page.getByText("0 orang")).toBeVisible();
    await expect(page.getByText("Tidak ada builder yang cocok.")).toHaveCount(
      0,
    );
  },
);

authed(
  "People shows a recoverable error instead of an empty directory",
  async ({ page }) => {
    await mockMe(page);
    await page.route("**/api/members", (route) =>
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "unavailable" }),
      }),
    );

    await page.goto("/people");
    await expect(page.getByRole("alert")).toContainText(
      "Direktori belum bisa dimuat.",
    );
    await expect(page.getByRole("button", { name: "Coba lagi" })).toBeVisible();
    await expect(page.getByText("Belum ada builder di direktori.")).toHaveCount(
      0,
    );
  },
);
