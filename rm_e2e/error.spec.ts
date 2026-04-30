import { test, expect } from "@fixtures/admin";

test.describe("error page", () => {
  test("renders error with an explicit code in the URL", async ({ page }) => {
    await page.goto("/error?code=mtls_fail");

    await expect(page).toHaveURL(/\/error/);
    await expect(page.getByTestId("error-content")).toBeVisible();
    await expect(page.getByTestId("error-content")).toHaveAttribute(
      "data-error-code",
      "mtls_fail",
    );
    await expect(page.getByTestId("error-code")).toContainText(/MTLS_FAIL/i);
    await expect(page.getByTestId("error-return-home-button")).toBeVisible();
  });

  test("renders the default error when no code is provided", async ({
    page,
  }) => {
    await page.goto("/error");

    await expect(page).toHaveURL(/\/error(\?|$)/);
    await expect(page.getByTestId("error-content")).toBeVisible();
    await expect(page.getByTestId("error-code")).toHaveCount(0);
  });

  test("return home button navigates to /login", async ({ page }) => {
    await page.goto("/error?code=unauthorized");
    await page.getByTestId("error-return-home-button").click();
    await expect(page).toHaveURL(/\/login(\?|$)/);
  });
});
