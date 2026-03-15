import { test, expect } from '@playwright/test';

const trainingTypes = ['horizontal', 'vertical', 'diagonal', 'complex', 'sequence'] as const;

const mockRecords = Array.from({ length: 13 }, (_, i) => ({
  id: `rec-${i + 1}`,
  type: trainingTypes[i % trainingTypes.length],
  level: (i % 5) + 1,
  score: 60 + i * 3,
  correctRate: 70 + i * 2,
  earnedPoints: 100 + i * 20,
  quizAnswers: [],
  createdAt: new Date(2026, 2, 1 + i, 10, 0, 0).toISOString(),
}));

test.only('E2E-REC-006: 履歴テーブルのページネーション', async ({ page }) => {
  await test.step('APIインターセプト設定', async () => {
    await page.route('**/api/training/records**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ records: mockRecords, total: mockRecords.length }),
      }),
    );
    await page.route('**/api/records/stats', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalTrainings: mockRecords.length,
          currentLevel: 5,
          totalPoints: 2000,
          averageCorrectRate: 85,
        }),
      }),
    );
    await page.route('**/api/progress', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalPoints: 2000,
          currentLevel: 5,
          totalTrainings: mockRecords.length,
          bestScores: {},
        }),
      }),
    );
  });

  await test.step('記録ページにアクセス', async () => {
    await page.goto('/records');
  });

  await test.step('トレーニング履歴の見出しが表示される', async () => {
    const heading = page.getByRole('heading', { name: 'トレーニング履歴' });
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  await test.step('初期状態: テーブルに10件の行が表示される', async () => {
    const rows = page.locator('table tbody tr');
    await expect(rows).toHaveCount(10);
  });

  await test.step('初期状態: ページ表示が「1 / 2」である', async () => {
    const pageIndicator = page.getByText('1 / 2');
    await expect(pageIndicator).toBeVisible();
  });

  await test.step('初期状態: 「前へ」ボタンがdisabled', async () => {
    const prevButton = page.getByRole('button', { name: '前へ' });
    await expect(prevButton).toBeDisabled();
  });

  await test.step('初期状態: 「次へ」ボタンがenabled', async () => {
    const nextButton = page.getByRole('button', { name: '次へ' });
    await expect(nextButton).toBeEnabled();
  });

  await test.step('「次へ」クリック後: ページ表示が「2 / 2」に更新される', async () => {
    const nextButton = page.getByRole('button', { name: '次へ' });
    await nextButton.click();
    const pageIndicator = page.getByText('2 / 2');
    await expect(pageIndicator).toBeVisible();
  });

  await test.step('「次へ」クリック後: テーブルが2ページ目のデータ（3件）に切り替わる', async () => {
    const rows = page.locator('table tbody tr');
    await expect(rows).toHaveCount(3);
  });

  await test.step('「次へ」クリック後: 「前へ」ボタンがenabledになる', async () => {
    const prevButton = page.getByRole('button', { name: '前へ' });
    await expect(prevButton).toBeEnabled();
  });

  await test.step('「前へ」クリック後: ページ表示が「1 / 2」に戻る', async () => {
    const prevButton = page.getByRole('button', { name: '前へ' });
    await prevButton.click();
    const pageIndicator = page.getByText('1 / 2');
    await expect(pageIndicator).toBeVisible();
  });

  await test.step('「前へ」クリック後: テーブルが1ページ目のデータ（10件）に戻る', async () => {
    const rows = page.locator('table tbody tr');
    await expect(rows).toHaveCount(10);
  });

  await test.step('「前へ」クリック後: 「前へ」ボタンが再びdisabledになる', async () => {
    const prevButton = page.getByRole('button', { name: '前へ' });
    await expect(prevButton).toBeDisabled();
  });

  await page.screenshot({ path: '/tmp/bluelamp-screenshots/E2E-REC-006.png', fullPage: true });
});
