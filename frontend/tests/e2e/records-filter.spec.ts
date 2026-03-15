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
    type: 'vertical',
    level: 2,
    score: 85,
    correctRate: 90,
    earnedPoints: 200,
    quizAnswers: [],
    createdAt: '2026-03-11T10:00:00Z',
  },
  {
    id: 'rec-3',
    type: 'diagonal',
    level: 4,
    score: 60,
    correctRate: 70,
    earnedPoints: 120,
    quizAnswers: [],
    createdAt: '2026-03-12T10:00:00Z',
  },
  {
    id: 'rec-4',
    type: 'horizontal',
    level: 4,
    score: 78,
    correctRate: 85,
    earnedPoints: 170,
    quizAnswers: [],
    createdAt: '2026-03-13T10:00:00Z',
  },
  {
    id: 'rec-5',
    type: 'sequence',
    level: 5,
    score: 88,
    correctRate: 85,
    earnedPoints: 180,
    quizAnswers: [],
    createdAt: '2026-03-14T10:00:00Z',
  },
];

const HORIZONTAL_COUNT = mockRecords.filter((r) => r.type === 'horizontal').length;
const TOTAL_COUNT = mockRecords.length;

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

  await test.step('初期状態: 「すべて」チップが選択済み、全データポイント表示', async () => {
    const allChip = page.getByRole('button', { name: 'すべて' });
    const bgColor = await allChip.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(bgColor).not.toBe('transparent');

    const scoreSection = page.getByRole('heading', { name: 'スコア推移' }).locator('..');
    const svg = scoreSection.locator('svg');
    const circles = svg.locator('circle');
    const count = await circles.count();
    expect(count).toBe(TOTAL_COUNT);
  });

  await test.step('「水平方向」チップをクリック', async () => {
    const horizontalChip = page.getByRole('button', { name: '水平方向' });
    await horizontalChip.click();
  });

  await test.step('「水平方向」チップが強調表示（primary背景、白文字）になる', async () => {
    const horizontalChip = page.getByRole('button', { name: '水平方向' });
    const bgColor = await horizontalChip.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(bgColor).not.toBe('transparent');

    const textColor = await horizontalChip.evaluate((el) => getComputedStyle(el).color);
    // White text: rgb(255, 255, 255)
    expect(textColor).toBe('rgb(255, 255, 255)');
  });

  await test.step('「すべて」チップが非選択状態になる', async () => {
    const allChip = page.getByRole('button', { name: 'すべて' });
    const bgColor = await allChip.evaluate((el) => getComputedStyle(el).backgroundColor);
    // Non-selected state should be transparent
    expect(bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent').toBeTruthy();
  });

  await test.step('グラフのデータポイント数が水平方向の記録件数と一致する', async () => {
    const scoreSection = page.getByRole('heading', { name: 'スコア推移' }).locator('..');
    const svg = scoreSection.locator('svg');
    const circles = svg.locator('circle');
    const count = await circles.count();
    expect(count).toBe(HORIZONTAL_COUNT);
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
    const bgColor = await horizontalChip.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent').toBeTruthy();
  });

  await test.step('グラフのデータポイント数が全記録の件数と一致する', async () => {
    const scoreSection = page.getByRole('heading', { name: 'スコア推移' }).locator('..');
    const svg = scoreSection.locator('svg');
    const circles = svg.locator('circle');
    const count = await circles.count();
    expect(count).toBe(TOTAL_COUNT);
  });

  await page.screenshot({ path: '/tmp/bluelamp-screenshots/E2E-REC-004.png', fullPage: true });
});
