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
    await page.route("**/api/karya", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "k1",
            title: "Rapi",
            description: "Design system komunitas.",
            stages: ["building"],
            interests: ["Design Systems"],
            coverUrl: null,
            screenshots: [],
            roster: [
              { id: "m1", name: "Dinda Pratiwi", handle: "dinda", image: null },
            ],
            memberCount: 1,
          },
        ]),
      }),
    );
    await page.route("**/api/feed", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            type: "post",
            id: "p1",
            karyaId: "k1",
            kind: "progress",
            body: "Token pertama sudah dipakai.",
            createdAt: new Date().toISOString(),
            author: {
              id: "m1",
              name: "Dinda Pratiwi",
              handle: "dinda",
              image: null,
            },
            karya: { id: "k1", title: "Rapi" },
          },
        ]),
      }),
    );
    await page
      .getByRole("button", { name: "Buka profil Dinda Pratiwi" })
      .click();
    await expect(page).toHaveURL(/\/member\/m1$/);
    await expect(
      page.getByRole("heading", { name: "Dinda Pratiwi" }),
    ).toBeVisible();
    await expect(page.getByText("Design system komunitas.")).toBeVisible();
    await expect(page.getByText("Token pertama sudah dipakai.")).toBeVisible();

    const projectLink = page.getByRole("button", { name: "Buka karya Rapi" });
    const updateLink = page.getByRole("button", { name: "Buka update Rapi" });
    await expect(projectLink).toHaveCSS("cursor", "pointer");
    await expect(updateLink).toHaveCSS("cursor", "pointer");

    const idleBackground = await updateLink.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    );
    await updateLink.hover();
    await expect
      .poll(() =>
        updateLink.evaluate(
          (element) => getComputedStyle(element).backgroundColor,
        ),
      )
      .not.toBe(idleBackground);

    await updateLink.click();
    await expect(page).toHaveURL(/\/karya\/k1$/);
  },
);

authed("member profile distinguishes loading and 404", async ({ page }) => {
  await mockMe(page);
  await page.route("**/api/karya", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
  );
  await page.route("**/api/feed", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
  );
  await page.route("**/api/members/missing", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 250));
    await route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({ error: "not found" }),
    });
  });

  await page.goto("/member/missing");
  await expect(
    page.getByRole("status", { name: "Memuat profil member" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Builder ini belum bisa ditemukan." }),
  ).toBeVisible();
});

authed("member profile shows recoverable error", async ({ page }) => {
  await mockMe(page);
  await page.route("**/api/karya", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
  );
  await page.route("**/api/feed", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
  );
  await page.route("**/api/members/broken", (route) =>
    route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ error: "broken" }),
    }),
  );

  await page.goto("/member/broken");
  const alert = page.getByRole("alert");
  await expect(alert).toContainText("Profil belum bisa dimuat");
  await expect(alert.getByRole("button", { name: "Coba lagi" })).toBeVisible();
});

authed(
  "own member URL remains a public, non-editing view",
  async ({ page }) => {
    await mockMe(page);
    await page.route("**/api/members/test-user-id", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(PROFILE),
      }),
    );
    await page.route("**/api/karya", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
      }),
    );
    await page.route("**/api/feed", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
      }),
    );

    await page.goto("/member/test-user-id");
    await expect(page.getByText("Profil publikmu")).toBeVisible();
    await expect(page.getByText("Kamu", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Sunting|Edit/ }),
    ).toHaveCount(0);
    await expect(
      page.getByText("Belum ada karya yang dibagikan."),
    ).toBeVisible();
    await expect(page.getByText(/Belum ada update publik/)).toBeVisible();
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
