import type { Page } from "@playwright/test";
import { authed, expect } from "./fixtures";

function profileState(page: Page) {
  let profile: Record<string, unknown> | null = null;

  page.route("**/api/me", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: profile ? JSON.stringify(profile) : "null",
    }),
  );
  page.route("**/api/profile", async (route) => {
    const body = route.request().postDataJSON() as Record<string, unknown>;
    profile = {
      id: "test-user-id",
      handle: null,
      bio: null,
      interests: [],
      year: "",
      major: "",
      skills: [],
      ...body,
    };
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });
}

async function mockShell(page: Page) {
  for (const path of ["**/api/featured", "**/api/feed", "**/api/interests"]) {
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
  "minimal onboarding → Profil Saya → edit → save → reload persists",
  async ({ page }) => {
    profileState(page);
    await mockShell(page);

    await page.goto("/");
    await expect(page).toHaveURL(/\/mulai/);
    await page.getByLabel("Nama kamu").fill("Test User");
    await page.getByRole("button", { name: /Masuk ke Launchpad/ }).click();
    await expect(page).toHaveURL(/\/home/);

    await page.getByRole("button", { name: "Buka Profil Saya" }).click();
    await expect(page).toHaveURL(/\/profil/);
    await expect(
      page.getByRole("heading", { name: "Kelola identitasmu." }),
    ).toBeVisible();
    await expect(page.getByText(/Tambahkan bio singkat/)).toBeVisible();

    await page.getByRole("button", { name: "Sunting profil" }).click();
    await page.getByLabel("Tentang kamu").fill("Membangun produk komunitas.");
    const skillInput = page.getByPlaceholder("+ tambah skill");
    await skillInput.fill("TypeScript");
    await skillInput.press("Enter");
    await page.getByLabel("Jurusan").fill("Informatika");
    await page.getByLabel("Angkatan").fill("2023");
    await page.getByRole("button", { name: "Simpan perubahan" }).click();

    await expect(page.getByText("Membangun produk komunitas.")).toBeVisible();
    await expect(page.getByText("TypeScript", { exact: true })).toBeVisible();

    await page.reload();
    await expect(page).toHaveURL(/\/profil/);
    await expect(page.getByText("Membangun produk komunitas.")).toBeVisible();
    await expect(page.getByText("TypeScript", { exact: true })).toBeVisible();
  },
);
