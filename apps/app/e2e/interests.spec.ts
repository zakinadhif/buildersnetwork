import { authed, expect } from "./fixtures";

// Acceptance for Sprint 1 (S1.11): on Review, the Minat editor draws from the
// curated catalog (FR-14/FR-15). A member adds one interest from a curated
// suggestion and one free-text interest; publishing sends both names to the API
// (reconciled to the catalog server-side), and the seeded draft survives a
// reload on /review (NFR-7).

const CATALOG = [
  {
    id: "i1",
    name: "Machine Learning",
    slug: "machine-learning",
    curated: true,
  },
  { id: "i2", name: "Web Development", slug: "web-development", curated: true },
  { id: "i3", name: "Open Source", slug: "open-source", curated: true },
];

const DRAFT = {
  id: "user",
  name: "Budi Santoso",
  handle: "budi",
  bio: "lagi bikin app buat komunitas kampus",
  interests: ["Open Source"],
  year: "Tingkat 2",
  major: "Desain Komunikasi Visual",
  skills: ["Figma", "Writing"],
};

authed(
  "review interests editor: curated suggestion + free-text → publish sends both",
  async ({ page }) => {
    let savedProfile: Record<string, unknown> | null = null;

    await page.route("**/api/me", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: savedProfile
          ? JSON.stringify({ id: "test-user-id", ...savedProfile })
          : "null",
      }),
    );
    await page.route("**/api/interests", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(CATALOG),
      }),
    );
    await page.route("**/api/profile", async (route) => {
      savedProfile = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
    });
    await page.route("**/api/feed", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
      }),
    );
    await page.route("**/api/members", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
      }),
    );

    // Seed the in-progress draft the way OnboardingProvider persists it.
    await page.addInitScript((draft) => {
      sessionStorage.setItem("onboarding:draft", JSON.stringify(draft));
    }, DRAFT);

    await page.goto("/review");

    // The draft's existing interest renders, and the editor surfaces curated
    // suggestions from the catalog (not yet-selected ones).
    const minat = page.locator(".pf", { hasText: "Minat" });
    await expect(
      minat.locator(".chip", { hasText: "Open Source" }),
    ).toBeVisible();
    await expect(
      minat.getByRole("button", { name: "+ Machine Learning" }),
    ).toBeVisible();

    // A reload on /review must NOT bounce to /onboarding, and the draft persists.
    await page.reload();
    await expect(page).toHaveURL(/\/review/);
    await expect(
      minat.locator(".chip", { hasText: "Open Source" }),
    ).toBeVisible();

    // Add one interest from a curated suggestion…
    await minat.getByRole("button", { name: "+ Machine Learning" }).click();
    await expect(
      minat.locator(".chip", { hasText: "Machine Learning" }),
    ).toBeVisible();

    // …and one free-text interest via the input.
    const input = minat.locator(".chip-add");
    await input.fill("Quantum Computing");
    await input.press("Enter");
    await expect(
      minat.locator(".chip", { hasText: "Quantum Computing" }),
    ).toBeVisible();

    await page.getByRole("button", { name: /Publish profil/ }).click();
    await expect(page).toHaveURL(/\/home/);

    // The published payload carries both the curated and free-text names.
    expect(savedProfile).not.toBeNull();
    const profile = savedProfile as Record<string, unknown>;
    expect(profile.interests).toEqual([
      "Open Source",
      "Machine Learning",
      "Quantum Computing",
    ]);
  },
);
