import { test, expect } from "@fixtures/unauthenticated";

test.describe("login page", () => {
  test("renders the code login form", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByTestId("login-card")).toBeVisible();

    const codeInput = page.getByTestId("login-code-input");
    await expect(codeInput).toBeVisible();
    await expect(codeInput).toBeEditable();

    const submit = page.getByTestId("login-submit-button");
    await expect(submit).toBeVisible();
    await expect(submit).toBeDisabled();

    await codeInput.fill("ABCDEFGH");
    await expect(submit).toBeEnabled();
  });

  test("normalizes typed code to uppercase", async ({ page }) => {
    await page.goto("/login");

    const codeInput = page.getByTestId("login-code-input");
    await codeInput.fill("abc123xy");
    await expect(codeInput).toHaveValue("ABC123XY");
  });

  test("builds certificate login link on the mtls subdomain", async ({
    page,
  }) => {
    await page.goto("/login");

    const certLink = page.getByTestId("login-cert-link");
    await expect(certLink).toBeVisible();
    await expect(certLink).toHaveAttribute("href", /\/\/mtls\./);
  });

  test("help button opens the login guide dialog", async ({ page }) => {
    await page.goto("/login");

    await page.getByTestId("login-help-button").click();
    await expect(page.locator("[role='dialog']")).toBeVisible();
  });

  test("submit stays disabled while code is empty", async ({ page }) => {
    await page.goto("/login");

    const submit = page.getByTestId("login-submit-button");
    await expect(submit).toBeDisabled();

    const codeInput = page.getByTestId("login-code-input");
    await codeInput.fill("AB");
    await expect(submit).toBeEnabled();

    await codeInput.fill("");
    await expect(submit).toBeDisabled();
  });

  test("auto-submits querystring code and redirects to callsign setup", async ({
    page,
    adminMeta,
  }) => {
    await page.goto(
      `/login?code=${encodeURIComponent(adminMeta.ui_login_code)}`,
    );
    await expect(page).toHaveURL(/\/callsign-setup(\?|$)/);
    await expect(page.getByTestId("callsign-input")).toBeVisible();
  });
});
