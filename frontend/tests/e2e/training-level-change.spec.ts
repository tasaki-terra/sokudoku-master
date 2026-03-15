import { test, expect } from '@playwright/test';

const SCREENSHOT_DIR = '/tmp/bluelamp-screenshots';

test.only('E2E-TRN-002: レベル変更', async ({ page }) => {
  await page.goto('/');

  // 前提: トレーニング選択画面が表示されている
  await expect(page.getByRole('heading', { name: 'トレーニングを選ぼう！' })).toBeVisible();

  // 操作: レベルスライダーのマーク「3」をクリック
  // MUI Slider marks are rendered as .MuiSlider-markLabel elements
  const mark3 = page.locator('.MuiSlider-markLabel', { hasText: /^3$/ });
  await mark3.click();

  // 検証: 「レベル: 3」とテキストが更新される
  await expect(page.getByText('レベル: 3')).toBeVisible();

  // 検証: スライダーの値が3の位置に移動する
  const slider = page.getByRole('slider');
  await expect(slider).toHaveAttribute('aria-valuenow', '3');

  await page.screenshot({ path: `${SCREENSHOT_DIR}/E2E-TRN-002-pass.png`, fullPage: true });
});
