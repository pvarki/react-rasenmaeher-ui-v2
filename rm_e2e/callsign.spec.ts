import { test, expect } from "@fixtures/unauthenticated";

test.describe("callsign setup page", () => {
  test.beforeEach(async ({ page, adminMeta }) => {
    await page.goto("/callsign-setup");
    await page.goto(
      `/login?code=${encodeURIComponent(adminMeta.ui_login_code)}`,
    );
    await expect(page).toHaveURL(/\/callsign-setup(\?|$)/);
  });

  test("route /callsign-setup is accessible", async ({ page }) => {
    const callsignInput = page.getByTestId("callsign-input");

    await expect(callsignInput).toBeVisible();
    await expect(callsignInput).toBeEditable();
  });

  test("rejects non-alphanumeric characters in callsign", async ({ page }) => {
    const input = page.getByTestId("callsign-input");
    const submit = page.getByTestId("callsign-submit-button");

    await input.fill("bad name!");
    await expect(page.getByTestId("callsign-validation-error")).toBeVisible();
    await expect(submit).toBeDisabled();
  });

  test("back action returns to /login", async ({ page }) => {
    const backButton = page.getByTestId("callsign-back-button");
    await expect(backButton).toBeVisible();
    await backButton.click();
    await expect(page).toHaveURL(/\/login(\?|$)/);
  });
});
