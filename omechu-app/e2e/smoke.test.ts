import { expect, test } from "@playwright/test";

test("home redirects to mainpage and shows primary actions", async ({
  page,
}) => {
  await page.goto("/");

  await page.waitForURL("**/mainpage");
  await expect(page).toHaveURL(/\/mainpage$/);
  await expect(page.getByText("맞춤 추천")).toBeVisible();
  await expect(page.getByText("메뉴 배틀")).toBeVisible();
  await expect(page.getByText("랜덤 추천")).toBeVisible();
});
