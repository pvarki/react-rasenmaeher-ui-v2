import { test, expect } from "@fixtures/admin";
import { LANGUAGES } from "@helpers/screenshots";

test.describe("language switcher", () => {
  test("switches across en/fi/sv and persists selection in localStorage", async ({
    page,
  }) => {
    await page.goto("/login");

    const trigger = page.getByTestId("language-switcher-trigger");
    await expect(trigger).toBeVisible();

    for (const language of LANGUAGES) {
      await trigger.click();
      await page.getByTestId(`language-option-${language}`).click();

      await expect
        .poll(async () => {
          const stored = await page.evaluate(() =>
            window.localStorage.getItem("language"),
          );
          return language === "en"
            ? stored === "en" || stored === null
            : stored === language;
        })
        .toBeTruthy();
    }

    //Check persistance after reload
    await page.reload();
    await expect
      .poll(async () =>
        page.evaluate(() => window.localStorage.getItem("language")),
      )
      .toBe("sv");
  });
});
