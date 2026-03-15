import { test, expect } from '@playwright/test';

test.only('E2E-REC-002: 記録なし状態の表示', async ({ page }) => {
  await test.step('APIをインターセプトして空レスポンスを返す', async () => {
    // トレーニング記録一覧APIを空で返す
    await page.route('**/api/training/records*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ records: [], total: 0 }),
      });
    });

    // 記録統計サマリーAPIを空状態で返す
    await page.route('**/api/records/stats', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalTrainings: 0,
          currentLevel: 1,
          totalPoints: 0,
          averageCorrectRate: null,
        }),
      });
    });
  });

  await test.step('localStorageをクリアして /records にアクセス', async () => {
    await page.goto('/records');
    await page.evaluate(() => {
      localStorage.removeItem('sokudoku-records');
    });
    await page.reload();
  });

  await test.step('ページの見出しが表示される', async () => {
    const heading = page.getByRole('heading', { name: 'きろく' });
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  await test.step('スコア推移セクションに空メッセージが表示される', async () => {
    const emptyMessage = page.getByText('まだデータがないよ。トレーニングしてみよう！');
    await expect(emptyMessage).toBeVisible({ timeout: 10000 });
  });

  await test.step('トレーニング履歴セクションに空メッセージが表示される', async () => {
    const emptyMessage = page.getByText('トレーニングをすると、ここに記録が表示されるよ！');
    await expect(emptyMessage).toBeVisible({ timeout: 10000 });
  });

  await test.step('SVGグラフ要素が表示されない', async () => {
    // ChartSvgコンポーネントのSVG要素が存在しないことを確認
    const svgElements = page.locator('svg');
    const count = await svgElements.count();
    // SVGが存在する場合でも、グラフ用のpath/circleが無いことを確認
    for (let i = 0; i < count; i++) {
      const svg = svgElements.nth(i);
      // グラフのpath（折れ線）が含まれていないことを確認
      const chartPath = svg.locator('path[stroke="#D4740E"]');
      await expect(chartPath).toHaveCount(0);
      // グラフのcircle（データポイント）が含まれていないことを確認
      const chartDots = svg.locator('circle[fill="#D4740E"]');
      await expect(chartDots).toHaveCount(0);
    }
  });

  await test.step('テーブル要素が表示されない', async () => {
    const table = page.locator('table');
    await expect(table).toHaveCount(0);
  });

  await test.step('スクリーンショット保存', async () => {
    await page.screenshot({
      path: '/tmp/bluelamp-screenshots/E2E-REC-002-empty-records.png',
      fullPage: true,
    });
  });
});
