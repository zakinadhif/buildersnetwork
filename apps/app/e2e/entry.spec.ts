import { expect, test } from "@playwright/test";

const USER = {
  id: "new-user-id",
  email: "baru@student.telkomuniversity.ac.id",
  name: "baru",
  emailVerified: false,
  image: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

test("daftar → verifikasi → profil → Scroll works without real email", async ({
  page,
}) => {
  let registered = false;
  let verified = false;
  let profile: Record<string, unknown> | null = null;

  await page.route("**/api/auth/get-session", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: registered
        ? JSON.stringify({
            session: {
              id: "session-id",
              userId: USER.id,
              expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
            },
            user: { ...USER, emailVerified: verified },
          })
        : "null",
    }),
  );
  await page.route("**/api/auth/sign-up/email", async (route) => {
    registered = true;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ token: "test-token", user: USER }),
    });
  });
  await page.route("**/api/otp/send", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    }),
  );
  await page.route("**/api/otp/verify", async (route) => {
    verified = true;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });
  await page.route("**/api/me", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: profile ? JSON.stringify(profile) : "null",
    }),
  );
  await page.route("**/api/profile", async (route) => {
    const body = route.request().postDataJSON() as Record<string, unknown>;
    profile = { id: USER.id, ...body };
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });
  for (const path of ["**/api/featured", "**/api/feed"]) {
    await page.route(path, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
      }),
    );
  }

  await page.goto("/welcome");
  await page.getByLabel("Email kampus").fill("bukan@gmail.com");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Daftar", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(
    "@student.telkomuniversity.ac.id",
  );

  await page
    .getByLabel("Email kampus")
    .fill("baru@student.telkomuniversity.ac.id");
  await page.getByRole("button", { name: "Daftar", exact: true }).click();
  await expect(page).toHaveURL(/\/verify-email/);

  await page.getByLabel("Kode verifikasi").fill("123456");
  await page.getByRole("button", { name: "Verifikasi & lanjut" }).click();
  await expect(page).toHaveURL(/\/mulai/);

  await page.getByLabel("Nama", { exact: true }).fill("Builder Baru");
  await page.getByLabel("Handle").fill("builder_baru");
  await page.getByLabel("Program studi").selectOption("Sistem Informasi");
  await page.getByLabel("Angkatan").selectOption("2024");
  await page.getByRole("button", { name: "Product" }).click();
  await page.getByRole("button", { name: "Komunitas" }).click();
  await page.getByRole("button", { name: "Simpan & masuk" }).click();

  await expect(page).toHaveURL(/\/home/);
  await expect(page.getByRole("heading", { name: "Scroll" })).toBeVisible();
  expect(profile).toMatchObject({
    name: "Builder Baru",
    handle: "builder_baru",
    major: "Sistem Informasi",
    year: "2024",
    skills: ["Product"],
    interests: ["Komunitas"],
  });
});

test("entry surfaces expose sign-in and an optional AI path", async ({
  page,
}) => {
  await page.route("**/api/auth/get-session", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: "null",
    }),
  );
  await page.goto("/welcome");
  await page.getByRole("button", { name: "Buka halaman Masuk" }).click();
  await expect(
    page.getByRole("heading", { name: "Selamat datang kembali." }),
  ).toBeVisible();

  await page.route("**/api/auth/get-session", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        session: { id: "session", userId: USER.id },
        user: { ...USER, name: "Test User", emailVerified: true },
      }),
    }),
  );
  await page.route("**/api/me", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: "null",
    }),
  );
  await page.goto("/mulai");
  await expect(
    page.getByRole("button", { name: "Simpan, lalu buka asisten AI" }),
  ).toBeVisible();
  await expect(page.getByText(/Asisten AI bersifat opsional/)).toBeVisible();
});
