import { test, expect } from "@fixtures/admin";
import {
  getMtlsUrl,
  gotoInteractive,
  waitForInteractivePage,
} from "@helpers/screenshots";

test.describe("approve-user deep-link route", () => {
  test("prefills callsign and approval code from URL", async ({
    adminPage: page,
    adminMeta,
  }) => {
    await gotoInteractive(
      page,
      getMtlsUrl(
        adminMeta.base_url,
        "/approve-user?callsign=playwright&approvalcode=ABCD1234",
      ),
    );

    const approvePage = page.getByTestId("approve-user-page");
    await expect(approvePage).toBeVisible();

    //Callsign
    await expect(approvePage).toHaveAttribute("data-callsign", "playwright");

    //Code
    const codeInput = page.getByTestId("approve-user-code-input");
    await expect(codeInput).toHaveValue("ABCD1234");

    await expect(page.getByTestId("approve-user-approve-button")).toBeEnabled();
    await expect(page.getByTestId("approve-user-cancel-button")).toBeEnabled();
  });

  test("disables approve action when approval code is cleared", async ({
    adminPage: page,
    adminMeta,
  }) => {
    await gotoInteractive(
      page,
      getMtlsUrl(
        adminMeta.base_url,
        "/approve-user?callsign=playwright&approvalcode=ABCD1234",
      ),
    );

    const codeInput = page.getByTestId("approve-user-code-input");
    await codeInput.fill("");

    await expect(
      page.getByTestId("approve-user-approve-button"),
    ).toBeDisabled();
  });

  test("missing callsign redirects to /approve-users", async ({
    adminPage: page,
    adminMeta,
  }) => {
    await gotoInteractive(
      page,
      getMtlsUrl(adminMeta.base_url, "/approve-user?approvalcode=ABCD1234"),
    );
    await expect(page).toHaveURL(/\/approve-users(\?|$)/);
    await expect(page.getByTestId("how-it-works-section")).toBeVisible();
  });

  test("cancel button returns to /approve-users", async ({
    adminPage: page,
    adminMeta,
  }) => {
    await gotoInteractive(
      page,
      getMtlsUrl(
        adminMeta.base_url,
        "/approve-user?callsign=playwright&approvalcode=XYZ99999",
      ),
    );

    await page.getByTestId("approve-user-cancel-button").click();

    await expect(page).toHaveURL(/\/approve-users(\?|$)/);
    await waitForInteractivePage(
      page,
      getMtlsUrl(adminMeta.base_url, "/approve-users"),
    );
    await expect(page.getByTestId("waiting-users-list")).toBeVisible();
  });
});
