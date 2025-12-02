import { expect, test } from "@playwright/test";

test("homepage displays correctly", async ({ page }) => {
  await page.goto("/");

  // メインメニューボタンの確認
  await expect(page.getByText("召喚 - SUMMON")).toBeVisible();
  await expect(page.getByText("ギャラリー - GALLERY")).toBeVisible();

  // カルーセルナビゲーションボタンの確認
  const prevButton = page.locator('button').filter({ has: page.locator('svg.lucide-chevron-left') });
  const nextButton = page.locator('button').filter({ has: page.locator('svg.lucide-chevron-right') });
  await expect(prevButton).toBeVisible();
  await expect(nextButton).toBeVisible();

  // お知らせエリアの確認
  await expect(page.getByText("ランキングニュース")).toBeVisible();
});

test("navigation works correctly", async ({ page }) => {
  await page.goto("/");

  // 召喚ボタンをクリックしてパック一覧に遷移
  await page.getByText("召喚 - SUMMON").click();
  await expect(page).toHaveURL(/\/packs/);

  // トップに戻る
  await page.goto("/");

  // ギャラリーボタンをクリックしてギャラリーに遷移
  await page.getByText("ギャラリー - GALLERY").click();
  await expect(page).toHaveURL(/\/gallery/);
});
