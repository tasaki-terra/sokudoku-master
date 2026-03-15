import { test, expect } from '@playwright/test';

test.only('E2E-REC-001: ページアクセス・統計サマリー表示', async ({ page }) => {
  const consoleLogs: Array<{ type: string; text: string }> = [];
  page.on('console', (msg) => {
    consoleLogs.push({ type: msg.type(), text: msg.text() });
  });

  await test.step('記録ページにアクセス', async () => {
    await page.goto('/records');
  });

  await test.step('「きろく」の見出しが表示される', async () => {
    const heading = page.getByRole('heading', { name: 'きろく' });
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  await test.step('統計サマリー4カードが表示される', async () => {
    // mainコンテンツ内に絞る（headerのLv表示と区別）
    const main = page.locator('main');

    // トレーニング回数カード
    const trainingCountLabel = main.getByText('トレーニング回数');
    await expect(trainingCountLabel).toBeVisible({ timeout: 10000 });
    const trainingCountCard = trainingCountLabel.locator('..');
    const trainingCountValue = trainingCountCard.getByText(/^\d+回$/);
    await expect(trainingCountValue).toBeVisible();

    // 現在のレベルカード
    const levelLabel = main.getByText('現在のレベル');
    await expect(levelLabel).toBeVisible();
    const levelCard = levelLabel.locator('..');
    const levelValue = levelCard.getByText(/^Lv\.\d+$/);
    await expect(levelValue).toBeVisible();

    // 累計ポイントカード
    const pointsLabel = main.getByText('累計ポイント');
    await expect(pointsLabel).toBeVisible();
    const pointsCard = pointsLabel.locator('..');
    const pointsValue = pointsCard.getByText(/^\d+pt$/);
    await expect(pointsValue).toBeVisible();

    // 平均正答率カード
    const rateLabel = main.getByText('平均正答率');
    await expect(rateLabel).toBeVisible();
    const rateCard = rateLabel.locator('..');
    const rateValue = rateCard.getByText(/^(\d+%|---)$/);
    await expect(rateValue).toBeVisible();
  });
});
