import { test, expect } from "@fixtures/admin";
import { getMtlsUrl, waitForInteractivePage } from "@helpers/screenshots";
import { createInviteCode } from "./helpers";

test.describe("invite code management", () => {
  test.beforeEach(async ({ adminPage: page, adminMeta }) => {
    await page.goto(getMtlsUrl(adminMeta.base_url, "/add-users"));
    await expect(page).toHaveURL(/\/add-users(\?|$)/);

    await waitForInteractivePage(page);
  });

  test("admin can create, disable, enable and remove an invite code", async ({
    adminPage: page,
    adminMeta,
  }) => {
    const inviteCode = await createInviteCode(page);

    await page.goto(getMtlsUrl(adminMeta.base_url, "/add-users"));
    await waitForInteractivePage(page);

    const filterInput = page.getByTestId("invite-code-filter");
    await expect(filterInput).toBeVisible();
    await filterInput.fill(inviteCode);

    const codeRow = page.locator(
      `[data-testid="invite-code-item"][data-invite-code="${inviteCode}"]`,
    );
    await expect(codeRow).toBeVisible();

    const selectMultipleButton = page.getByTestId("select-multiple-button");
    const enableButton = page.getByTestId("bulk-enable-button");
    const disableButton = page.getByTestId("bulk-disable-button");
    const deleteButton = page.getByTestId("bulk-delete-button");

    // Normal
    await expect(enableButton).toHaveCount(0);
    await expect(disableButton).toHaveCount(0);
    await expect(deleteButton).toHaveCount(0);

    // Bulk mode
    await selectMultipleButton.click();
    await codeRow.click();
    await expect(codeRow).toHaveAttribute("data-invite-selected", "true");
    await expect(disableButton).toBeVisible();
    await expect(enableButton).toBeVisible();
    await expect(deleteButton).toBeVisible();

    //Disable
    await disableButton.click();
    await expect(codeRow).toBeVisible();
    await expect(codeRow.getByTestId("invite-code-status")).toHaveAttribute(
      "data-invite-status",
      "inactive",
    );

    //Activate
    await selectMultipleButton.click();
    await codeRow.click();
    await enableButton.click();
    await expect(codeRow.getByTestId("invite-code-status")).toHaveAttribute(
      "data-invite-status",
      "active",
    );

    // Delete
    await selectMultipleButton.click();
    await codeRow.click();
    await deleteButton.click();

    await expect(codeRow).toHaveCount(0);

    // Verify persistence across a reload.
    await page.reload();
    await waitForInteractivePage(page);

    await page.getByTestId("invite-code-filter").fill(inviteCode);
    await expect(
      page.locator(
        `[data-testid="invite-code-item"][data-invite-code="${inviteCode}"]`,
      ),
    ).toHaveCount(0);
  });

  test("filter input narrows down the invite code list", async ({
    adminPage: page,
    adminMeta,
  }) => {
    const createdCode = await createInviteCode(page);

    await page.goto(getMtlsUrl(adminMeta.base_url, "/add-users"));
    await waitForInteractivePage(page);

    const filterInput = page.getByTestId("invite-code-filter");
    const allItems = page.getByTestId("invite-code-item");

    await expect(allItems.first()).toBeVisible();

    //Filter everything out
    await filterInput.fill("ZZZZZZZZ_NO_MATCH");
    await expect(allItems).toHaveCount(0);

    //Reset
    await filterInput.fill(createdCode);
    await expect(
      page.locator(
        `[data-testid="invite-code-item"][data-invite-code="${createdCode}"]`,
      ),
    ).toBeVisible();

    // Clean up: bulk-delete the code we created.
    await page.getByTestId("select-multiple-button").click();
    await page
      .locator(
        `[data-testid="invite-code-item"][data-invite-code="${createdCode}"]`,
      )
      .click();
    await page.getByTestId("bulk-delete-button").click();
  });
});
