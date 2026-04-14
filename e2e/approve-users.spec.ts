import { test, expect } from "@fixtures/admin";
import { getMtlsUrl, waitForInteractivePage } from "@helpers/screenshots";

test.describe("approve users page", () => {
  test.beforeEach(async ({ adminPage: page, adminMeta }) => {
    await page.goto(getMtlsUrl(adminMeta.base_url, "/approve-users"));
    await waitForInteractivePage(page);
  });

  test("renders the waiting users and help section", async ({
    adminPage: page,
  }) => {
    await expect(page.getByTestId("how-it-works-section")).toBeVisible();
    await expect(page.getByTestId("waiting-users-list")).toBeVisible();
  });

  test("how-it-works section expands when clicked", async ({
    adminPage: page,
  }) => {
    const toggle = page.getByTestId("how-it-works-toggle");
    const initialExpanded = await toggle.getAttribute("aria-expanded");

    await toggle.click();
    await expect
      .poll(async () => toggle.getAttribute("aria-expanded"))
      .not.toBe(initialExpanded);
  });
});
