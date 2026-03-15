import { test, expect } from '@playwright/test';

const mockRecords = [
  {
    id: 'rec-1',
    type: 'horizontal',
    level: 3,
    score: 72,
    correctRate: 80,
    earnedPoints: 150,
    quizAnswers: [],
    createdAt: '2026-03-10T10:00:00Z',
  },
  {
    id: 'rec-2',
    type: 'horizontal',
    level: 4,
    score: 88,
    correctRate: 90,
    earnedPoints: 200,
    quizAnswers: [],
    createdAt: '2026-03-11T10:00:00Z',
  },
  {
    id: 'rec-3',
    type: 'vertical',
    level: 2,
    score: 65,
    correctRate: 75,
    earnedPoints: 130,
    quizAnswers: [],
    createdAt: '2026-03-12T10:00:00Z',
  },
  {
    id: 'rec-4',
    type: 'vertical',
    level: 3,
    score: 78,
    correctRate: 85,
    earnedPoints: 170,
    quizAnswers: [],
    createdAt: '2026-03-13T10:00:00Z',
  },
  {
    id: 'rec-5',
    type: 'diagonal',
    level: 5,
    score: 92,
    correctRate: 95,
    earnedPoints: 230,
    quizAnswers: [],
    createdAt: '2026-03-14T10:00:00Z',
  },
];

const HORIZONTAL_COUNT = mockRecords.filter((r) => r.type === 'horizontal').length;
const ALL_COUNT = mockRecords.length;

test.only('E2E-REC-004: スコア推移のフィルター切替', async ({ page }) => {
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
          totalTrainings: 5,
          currentLevel: 5,
          totalPoints: 900,
          averageCorrectRate: 85,
        }),
      }),
    );
    await page.route('**/api/progress', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalPoints: 900,
          currentLevel: 5,
          totalTrainings: 5,
          bestScores: {},
        }),
      }),
    );
  });

  await test.step('記録ページにアクセス', async () => {
    await page.goto('/records');
    const heading = page.getByRole('heading', { name: 'スコア推移' });
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  await test.step('初期状態で「すべて」チップが選択済み', async () => {
    const allChip = page.getByRole('button', { name: 'すべて' });
    const bgColor = await allChip.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(bgColor).not.toBe('transparent');
  });

  await test.step('初期状態でグラフに全件のデータポイントが表示される', async () => {
    const scoreSection = page.getByRole('heading', { name: 'スコア推移' }).locator('..');
    const circles = scoreSection.locator('svg circle');
    await expect(circles).toHaveCount(ALL_COUNT);
  });

  await test.step('「水平方向」チップをクリック', async () => {
    const horizontalChip = page.getByRole('button', { name: '水平方向' });
    await horizontalChip.click();
  });

  await test.step('「水平方向」チップが強調表示に変わる', async () => {
    const horizontalChip = page.getByRole('button', { name: '水平方向' });
    const bgColor = await horizontalChip.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(bgColor).not.toBe('transparent');

    const textColor = await horizontalChip.evaluate((el) => getComputedStyle(el).color);
    // white text: rgb(255, 255, 255)
    expect(textColor).toBe('rgb(255, 255, 255)');
  });

  await test.step('「すべて」チップが非選択状態になる', async () => {
    const allChip = page.getByRole('button', { name: 'すべて' });
    // Non-selected: text should NOT be white
    await expect(allChip).not.toHaveCSS('color', 'rgb(255, 255, 255)');
  });

  await test.step('グラフのデータポイント数が水平方向の記録件数と一致する', async () => {
    const scoreSection = page.getByRole('heading', { name: 'スコア推移' }).locator('..');
    const circles = scoreSection.locator('svg circle');
    await expect(circles).toHaveCount(HORIZONTAL_COUNT);
  });

  await page.screenshot({
    path: '/tmp/bluelamp-screenshots/E2E-REC-004-horizontal.png',
    fullPage: true,
  });

  await test.step('「すべて」チップをクリック', async () => {
    const allChip = page.getByRole('button', { name: 'すべて' });
    await allChip.click();
  });

  await test.step('「すべて」チップが強調表示に戻る', async () => {
    const allChip = page.getByRole('button', { name: 'すべて' });
    const bgColor = await allChip.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(bgColor).not.toBe('transparent');
  });

  await test.step('「水平方向」チップが非選択状態に戻る', async () => {
    const horizontalChip = page.getByRole('button', { name: '水平方向' });
    // Verify the chip text color is not white (non-selected state)
    await expect(horizontalChip).not.toHaveCSS('color', 'rgb(255, 255, 255)');
  });

  await test.step('グラフのデータポイント数が全記録の件数と一致する', async () => {
    const scoreSection = page.getByRole('heading', { name: 'スコア推移' }).locator('..');
    const circles = scoreSection.locator('svg circle');
    await expect(circles).toHaveCount(ALL_COUNT);
  });

  await page.screenshot({
    path: '/tmp/bluelamp-screenshots/E2E-REC-004-all.png',
    fullPage: true,
  });
});
