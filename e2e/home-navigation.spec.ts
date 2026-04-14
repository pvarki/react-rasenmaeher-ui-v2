import type { Page } from "@playwright/test";
import { test, expect } from "@fixtures/admin";
import { getMtlsUrl, waitForInteractivePage } from "@helpers/screenshots";
import { isInViewport, pickInViewportByTestId, clickSafe } from "@helpers/dom";

async function ensureSidebarOpen(page: Page): Promise<void> {
  const userInfo = page.getByTestId("sidebar-user-info");

  try {
    await expect(userInfo).toBeVisible({ timeout: 2_000 });
    if (await isInViewport(page, userInfo.first())) {
      return;
    }
  } catch {
    // Not visible after retrying - open the sidebar.
  }

  const openMenuButton = page
    .getByRole("button", { name: /open menu/i })
    .first();
  if (await openMenuButton.isVisible()) {
    await openMenuButton.click();
  } else {
    await page.getByTestId("sidebar-toggle-button").click();
  }

  await expect(userInfo).toBeVisible();
  await expect
    .poll(async () => isInViewport(page, userInfo.first()), {
      message: "Expected sidebar user info to be within viewport",
    })
    .toBeTruthy();
}

async function openUserManagementSubmenu(page: Page): Promise<void> {
  const userManagementLink = await pickInViewportByTestId(
    page,
    "sidebar-nav-user-management",
  );
  const manageUsersLink = await pickInViewportByTestId(
    page,
    "sidebar-nav-manage-users",
  );

  if (await manageUsersLink.isVisible()) {
    return;
  }

  await expect(userManagementLink).toBeVisible();
  await clickSafe(userManagementLink);
  await expect(manageUsersLink).toBeVisible();
}

test.describe("home page + sidebar navigation", () => {
  test.beforeEach(async ({ adminPage: page, adminMeta }) => {
    await page.goto(getMtlsUrl(adminMeta.base_url, "/"));
    await waitForInteractivePage(page);
  });

  test("home page renders with greeting, product grid and admin tools nav", async ({
    adminPage: page,
  }) => {
    await expect(page.getByTestId("home-page")).toBeVisible();
    await expect(page.getByTestId("home-auth-required-warning")).toHaveCount(0);

    await expect(page.getByTestId("admin-tools-nav-button")).toBeVisible();

    const grid = page.getByTestId("product-grid");
    await expect(grid).toBeVisible();
    const cards = grid.getByTestId("product-card");
    const cardCount = await cards.count();
    for (let i = 0; i < cardCount; i += 1) {
      await expect(cards.nth(i)).toHaveAttribute("data-product-valid", "true");
    }
  });

  test("admin-tools nav button on the home page jumps to /admin-tools", async ({
    adminPage: page,
  }) => {
    await page.getByTestId("admin-tools-nav-button").click();
    await expect(page).toHaveURL(/\/admin-tools(\?|$)/);
  });

  test("sidebar exposes admin-only navigation entries", async ({
    adminPage: page,
  }) => {
    await ensureSidebarOpen(page);
    const sidebar = page.getByTestId("sidebar");
    await expect(sidebar).toBeVisible();

    const userInfo = await pickInViewportByTestId(page, "sidebar-user-info");
    await expect(userInfo).toBeVisible();
    await expect(userInfo).toHaveAttribute("data-user-type", "admin");

    await expect(page.getByTestId("sidebar-nav-admin-tools")).toBeVisible();
    await openUserManagementSubmenu(page);

    await expect(page.getByTestId("sidebar-nav-manage-users")).toBeVisible();
    await expect(page.getByTestId("sidebar-nav-add-users")).toBeVisible();
    await expect(page.getByTestId("sidebar-nav-approve-users")).toBeVisible();
  });

  test("sidebar manage-users link navigates to /manage-users", async ({
    adminPage: page,
  }) => {
    await ensureSidebarOpen(page);
    const sidebar = page.getByTestId("sidebar");
    await expect(sidebar).toBeVisible();

    const userManagementLink = await pickInViewportByTestId(
      page,
      "sidebar-nav-user-management",
    );
    await expect(userManagementLink).toBeVisible();
    await openUserManagementSubmenu(page);

    const manageUsersLink = await pickInViewportByTestId(
      page,
      "sidebar-nav-manage-users",
    );
    await clickSafe(manageUsersLink);
    await expect(page).toHaveURL(/\/manage-users(\?|$)/);
    await expect(page.getByTestId("manage-users-page")).toBeVisible();
  });

  test("sidebar language selector persists the chosen language", async ({
    adminPage: page,
  }) => {
    await ensureSidebarOpen(page);
    const sidebar = page.getByTestId("sidebar");
    await expect(sidebar).toBeVisible();

    const languageSelectTrigger = await pickInViewportByTestId(
      page,
      "sidebar-language-select-trigger",
    );

    await clickSafe(languageSelectTrigger);
    await page.getByTestId("sidebar-language-option-fi").click();

    await expect
      .poll(async () =>
        page.evaluate(() => window.localStorage.getItem("language")),
      )
      .toBe("fi");

    // Reset to en so the rest of the suite stays consistent.
    await clickSafe(
      await pickInViewportByTestId(page, "sidebar-language-select-trigger"),
    );
    await page.getByTestId("sidebar-language-option-en").click();
    await expect
      .poll(async () =>
        page.evaluate(() => window.localStorage.getItem("language")),
      )
      .toBe("en");
  });
});
