import { test, expect } from "@fixtures/admin";
import { getMtlsUrl, gotoInteractive } from "@helpers/screenshots";

test.describe("manage users page", () => {
  test.beforeEach(async ({ adminPage: page, adminMeta }) => {
    await gotoInteractive(
      page,
      getMtlsUrl(adminMeta.base_url, "/manage-users"),
    );

    await expect(page.getByTestId("manage-users-page")).toBeVisible();
    await expect(page.getByTestId("manage-users-forbidden")).toHaveCount(0);
  });

  test("administrators list shows the current admin", async ({
    adminPage: page,
  }) => {
    const adminsList = page.getByTestId("administrators-list");
    await expect(adminsList).toBeVisible();
    await expect(adminsList).toHaveAttribute("data-user-list-open", "true");
    await expect(adminsList.getByTestId("user-list-item")).not.toHaveCount(0);

    // 1 account has "you"
    const currentUserRow = adminsList.locator(
      "[data-testid='user-list-item'][data-user-current='true']",
    );

    await expect(currentUserRow).toHaveCount(1);
  });

  test("bulk mode shows actions bar", async ({ adminPage: page }) => {
    const managePage = page.getByTestId("manage-users-page");
    await expect(managePage).toHaveAttribute("data-bulk-mode", "false");

    await expect(page.getByTestId("manage-users-bulk-actions-bar")).toHaveCount(
      0,
    );

    await page.getByTestId("manage-users-bulk-toggle").click();

    await expect(managePage).toHaveAttribute("data-bulk-mode", "true");

    await page.getByTestId("fighters-list-toggle").click();
    await expect(page.getByTestId("fighters-list")).toHaveAttribute(
      "data-user-list-open",
      "true",
    );

    let selectableUser = page
      .getByTestId("fighters-list")
      .locator("[data-testid='user-list-item']")
      .first();

    if ((await selectableUser.count()) === 0) {
      await page.getByTestId("administrators-list-toggle").click();
      selectableUser = page
        .getByTestId("administrators-list")
        .locator("[data-testid='user-list-item'][data-user-current='false']")
        .first();
    }

    if ((await selectableUser.count()) > 0) {
      await expect(selectableUser).toBeVisible();
      await selectableUser.click();

      await expect(selectableUser).toHaveAttribute(
        "data-user-selected",
        "true",
      );

      await expect(
        page.getByTestId("manage-users-bulk-actions-bar"),
      ).toBeVisible();
    } else {
      const currentUser = page
        .getByTestId("administrators-list")
        .locator("[data-testid='user-list-item'][data-user-current='true']")
        .first();

      await expect(currentUser).toBeVisible();
      await currentUser.click();
      await expect(currentUser).toHaveAttribute("data-user-selected", "false");
      await expect(
        page.getByTestId("manage-users-bulk-actions-bar"),
      ).toHaveCount(0);
    }

    await page.getByTestId("manage-users-bulk-toggle").click();
    await expect(managePage).toHaveAttribute("data-bulk-mode", "false");
    await expect(page.getByTestId("manage-users-bulk-actions-bar")).toHaveCount(
      0,
    );
  });

  test("user management dialog has self guards", async ({
    adminPage: page,
  }) => {
    const currentUserRow = page
      .getByTestId("administrators-list")
      .locator("[data-testid='user-list-item'][data-user-current='true']");
    await expect(currentUserRow).toHaveCount(1);
    await currentUserRow.click();

    const dialog = page.getByTestId("user-management-dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute("data-user-is-admin", "true");
    await expect(dialog).toHaveAttribute("data-user-is-current", "true");

    // actions should not work to your account
    await expect(
      dialog.getByTestId("user-management-dialog-back-button"),
    ).toBeVisible();

    const demoteBtn = dialog.getByTestId(
      "user-management-dialog-demote-button",
    );
    await expect(demoteBtn).toBeVisible();
    await expect(demoteBtn).toBeDisabled();

    const removeBtn = dialog.getByTestId(
      "user-management-dialog-remove-button",
    );
    await expect(removeBtn).toBeVisible();
    await expect(removeBtn).toBeDisabled();

    await dialog.getByTestId("user-management-dialog-back-button").click();
    await expect(dialog).toBeHidden();
  });

  test("help button reopens the manage-users walkthrough dialog", async ({
    adminPage: page,
  }) => {
    await expect(
      page.getByTestId("manage-users-walkthrough-dialog"),
    ).toHaveCount(0);

    const helpButton = page.getByTestId("manage-users-help-button");
    await expect(helpButton).toBeVisible();
    await helpButton.click();

    const dialog = page.getByTestId("manage-users-walkthrough-dialog");
    await expect(dialog).toBeVisible();

    await dialog.getByTestId("manage-users-walkthrough-got-it-button").click();
    await expect(dialog).toBeHidden();
  });
});
