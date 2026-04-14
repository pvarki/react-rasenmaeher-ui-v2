import { test, expect } from "@fixtures/admin";
import { getMtlsUrl, waitForInteractivePage } from "@helpers/screenshots";

test.describe("admin tools page", () => {
  test("landing shows two categories of admin tools", async ({
    adminPage: page,
    adminMeta,
  }) => {
    await page.goto(getMtlsUrl(adminMeta.base_url, "/admin-tools"));
    await waitForInteractivePage(page);

    const selector = page.getByTestId("admin-tools-type-selector");
    await expect(selector).toBeVisible();
    await expect(page.getByTestId("admin-tools-forbidden")).toHaveCount(0);

    const cards = selector.getByTestId("admin-tool-card");
    await expect(cards).toHaveCount(2);
  });

  test("picking user management opens user management", async ({
    adminPage: page,
    adminMeta,
  }) => {
    await page.goto(getMtlsUrl(adminMeta.base_url, "/admin-tools"));
    await waitForInteractivePage(page);

    await page
      .getByTestId("admin-tools-type-selector")
      .getByTestId("admin-tool-card")
      .first()
      .click();

    const adminToolsPage = page.getByTestId("admin-tools-page");
    await expect(adminToolsPage).toBeVisible();
    await expect(adminToolsPage).toHaveAttribute(
      "data-admin-tools-type",
      "users",
    );

    const sectionGroup = page.getByTestId("admin-tools-section-group");
    await expect(sectionGroup).toHaveCount(1);
    await expect(sectionGroup).toHaveAttribute(
      "data-section-key",
      "common.userManagement",
    );

    // Three cards: manage, add, approve.
    const cards = page.getByTestId("admin-tool-card");
    await expect(cards).toHaveCount(3);
    for (let i = 0; i < 3; i += 1) {
      await expect(cards.nth(i)).toHaveAttribute(
        "data-admin-tool-action",
        "navigate",
      );
    }
  });

  test("direct ?type=services URL opens the services section", async ({
    adminPage: page,
    adminMeta,
  }) => {
    await page.goto(
      getMtlsUrl(adminMeta.base_url, "/admin-tools?type=services"),
    );
    await waitForInteractivePage(page);

    const adminToolsPage = page.getByTestId("admin-tools-page");
    await expect(adminToolsPage).toBeVisible();
    await expect(adminToolsPage).toHaveAttribute(
      "data-admin-tools-type",
      "services",
    );

    const sectionGroup = page.getByTestId("admin-tools-section-group");
    await expect(sectionGroup).toHaveCount(1);
    await expect(sectionGroup).toHaveAttribute(
      "data-section-key",
      "adminTools.toolsDesc",
    );

    const keycloakCard = page.locator(
      "[data-testid='admin-tool-card'][data-admin-tool-key='adminTools.keycloakTitle']",
    );
    await expect(keycloakCard).toBeVisible();
    await expect(keycloakCard).toHaveAttribute(
      "data-admin-tool-action",
      "modal",
    );
  });

  test("clicking the manage-users card navigates to /manage-users", async ({
    adminPage: page,
    adminMeta,
  }) => {
    await page.goto(getMtlsUrl(adminMeta.base_url, "/admin-tools?type=users"));
    await waitForInteractivePage(page);

    // Order: manage, add, approve.
    const firstCard = page.getByTestId("admin-tool-card").first();
    await expect(firstCard).toBeVisible();
    await firstCard.click();

    await expect(page).toHaveURL(/\/manage-users(\?|$)/);
  });
});
