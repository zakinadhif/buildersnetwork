import type { Page } from "@playwright/test";
import { authed, expect } from "./fixtures";

// Acceptance for Sprint 2 (S2.17): create a karya via the direct form (no AI)
// and via the AI pre-fill, both landing on the same editable draft; render a
// karya page with contributor faces and the join CTA; and, as owner, see a
// pending request with approve/decline. Mirrors interests.spec.ts mocking style.

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

const CATALOG = [
  { id: "i1", name: "Open Source", slug: "open-source", curated: true },
  {
    id: "i2",
    name: "Machine Learning",
    slug: "machine-learning",
    curated: true,
  },
];

// Common endpoints every karya screen touches: the viewer's profile (so the
// has-profile gate passes) and the interest catalog (InterestsEditor).
async function mockCommon(page: Page) {
  await page.route("**/api/me", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(PROFILE),
    }),
  );
  await page.route("**/api/interests", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(CATALOG),
    }),
  );
}

authed(
  "Karya CTA → manual create → publish → created detail",
  async ({ page }) => {
    await mockCommon(page);

    let savedKarya: Record<string, unknown> | null = null;
    await page.route("**/api/karya", async (route) => {
      if (route.request().method() === "POST") {
        savedKarya = route.request().postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ id: "k-new" }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: "[]",
        });
      }
    });
    // After publish the client redirects to /karya/k-new and loads its detail.
    await page.route("**/api/karya/k-new", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "k-new",
          title: "Sync Tool",
          description: "offline-first file sync",
          stages: ["idea", "building"],
          interests: ["Open Source"],
          createdBy: "test-user-id",
          roster: [
            {
              id: "test-user-id",
              name: "Test User",
              handle: "test",
              image: null,
            },
          ],
          viewerMembership: { role: "owner", status: "member" },
          pendingRequests: [],
        }),
      }),
    );

    await page.goto("/karya");
    await page
      .getByRole("main")
      .getByRole("button", { name: "Bikin karya" })
      .click();
    await expect(page).toHaveURL(/\/karya\/new$/);
    await expect(
      page.getByRole("button", { name: /Buka asisten AI/ }),
    ).toBeVisible();

    await page.getByLabel("Judul").fill("Sync Tool");
    await page.getByLabel("Deskripsi").fill("offline-first file sync");

    // Stage multi-select: "ide" is on by default; add "bikin" (building).
    const stageField = page.locator(".pf", { hasText: "Tahap" });
    await stageField.getByRole("button", { name: "bikin" }).click();

    // Interest tag via free-text.
    const minat = page.locator(".pf", { hasText: "Minat" });
    await minat.locator(".chip-add").fill("Open Source");
    await minat.locator(".chip-add").press("Enter");
    await expect(
      minat.locator(".chip", { hasText: "Open Source" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Terbitkan karya" }).click();
    await expect(page).toHaveURL(/\/karya\/k-new/);

    expect(savedKarya).not.toBeNull();
    const k = savedKarya as Record<string, unknown>;
    expect(k.title).toBe("Sync Tool");
    expect(k.description).toBe("offline-first file sync");
    expect(k.stages).toEqual(["idea", "building"]);
    expect(k.interests).toEqual(["Open Source"]);
  },
);

authed(
  "karya page: roster faces render and a non-member sees Minta gabung",
  async ({ page }) => {
    await mockCommon(page);

    await page.route("**/api/karya/k1", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "k1",
          title: "Loom",
          description: "peer-to-peer file sync",
          stages: ["building"],
          interests: ["Open Source"],
          createdBy: "owner-id",
          roster: [
            {
              id: "owner-id",
              name: "Hafiz Maulana",
              handle: "hafiz",
              image: null,
            },
            { id: "m3", name: "Rizal Anwar", handle: "rizal", image: null },
          ],
          viewerMembership: null,
          pendingRequests: [],
        }),
      }),
    );

    await page.goto("/karya/k1");

    await expect(page.getByRole("heading", { name: "Loom" })).toBeVisible();
    // Contributor faces (monograms) render as labelled images.
    await expect(
      page.getByRole("img", { name: "Hafiz Maulana" }),
    ).toBeVisible();
    await expect(page.getByRole("img", { name: "Rizal Anwar" })).toBeVisible();
    // A non-member viewer sees the join CTA.
    await expect(
      page.getByRole("button", { name: "Minta gabung" }),
    ).toBeVisible();
  },
);

authed(
  "karya page: owner sees a pending request with approve/decline",
  async ({ page }) => {
    await mockCommon(page);

    await page.route("**/api/karya/k2", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "k2",
          title: "Saku",
          description: "keuangan pribadi buat mahasiswa",
          stages: ["idea"],
          interests: [],
          createdBy: "test-user-id",
          roster: [
            {
              id: "test-user-id",
              name: "Test User",
              handle: "test",
              image: null,
            },
          ],
          viewerMembership: { role: "owner", status: "member" },
          pendingRequests: [
            { id: "req1", name: "Dinda Pratiwi", handle: "dinda", image: null },
          ],
        }),
      }),
    );

    await page.goto("/karya/k2");

    const pending = page.locator(".pending-row", { hasText: "Dinda Pratiwi" });
    await expect(pending).toBeVisible();
    await expect(pending.getByRole("button", { name: "Terima" })).toBeVisible();
    await expect(pending.getByRole("button", { name: "Tolak" })).toBeVisible();
  },
);

authed("karya detail distinguishes loading and 404", async ({ page }) => {
  await mockCommon(page);
  await page.route("**/api/karya/missing/posts", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
  );
  await page.route("**/api/karya/missing", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 250));
    await route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({ error: "not found" }),
    });
  });

  await page.goto("/karya/missing");
  await expect(
    page.getByRole("status", { name: "Memuat detail karya" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Halamannya belum bisa dibuka." }),
  ).toBeVisible();
});

authed("karya detail shows recoverable error", async ({ page }) => {
  await mockCommon(page);
  await page.route("**/api/karya/broken/posts", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
  );
  await page.route("**/api/karya/broken", (route) =>
    route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ error: "broken" }),
    }),
  );

  await page.goto("/karya/broken");
  const alert = page.getByRole("alert");
  await expect(alert).toContainText("Detail karya belum bisa dimuat");
  await expect(alert.getByRole("button", { name: "Coba lagi" })).toBeVisible();
});

authed(
  "karya detail renders honest empty media, roster, and updates",
  async ({ page }) => {
    await mockCommon(page);
    await page.route("**/api/karya/empty/posts", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
      }),
    );
    await page.route("**/api/karya/empty", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "empty",
          title: "Karya Kosong",
          description: "Baru dimulai.",
          stages: [],
          interests: [],
          coverUrl: null,
          screenshots: [],
          createdBy: null,
          roster: [],
          viewerMembership: null,
          pendingRequests: [],
          featured: false,
          viewerIsAdmin: false,
        }),
      }),
    );

    await page.goto("/karya/empty");
    await expect(
      page.getByRole("img", { name: "Belum ada sampul untuk Karya Kosong" }),
    ).toBeVisible();
    await expect(page.getByText("Belum ada anggota karya.")).toBeVisible();
    await expect(page.getByText(/Belum ada tangkapan layar/)).toBeVisible();
    await expect(page.getByText(/Belum ada update dari tim/)).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Minta gabung" }),
    ).toBeVisible();
  },
);
