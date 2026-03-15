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
    type: 'complex',
    level: 1,
    score: 95,
    correctRate: 100,
    earnedPoints: 250,
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

test.only('E2E-REC-003: 記録あり状態のスコア推移グラフ表示', async ({ page }) => {
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
  });

  await test.step('「スコア推移」の見出しが表示される', async () => {
    const heading = page.getByRole('heading', { name: 'スコア推移' });
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  await test.step('フィルターチップが全て表示される', async () => {
    const expectedLabels = ['すべて', '水平方向', '垂直方向', '斜め方向', '複合', '順番追跡', '連続水平'];
    for (const label of expectedLabels) {
      const chip = page.getByRole('button', { name: label });
      await expect(chip).toBeVisible({ timeout: 5000 });
    }
  });

  await test.step('「すべて」チップが初期状態で選択済み（強調表示）', async () => {
    const allChip = page.getByRole('button', { name: 'すべて' });
    const bgColor = await allChip.evaluate((el) => getComputedStyle(el).backgroundColor);
    // primary.main color should be applied (not transparent)
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(bgColor).not.toBe('transparent');
  });

  await test.step('SVGにpath要素とcircle要素が描画される', async () => {
    // スコア推移セクション内のSVGを特定
    const scoreSection = page.getByRole('heading', { name: 'スコア推移' }).locator('..');
    const svg = scoreSection.locator('svg');
    await expect(svg).toBeVisible({ timeout: 5000 });

    const path = svg.locator('path');
    await expect(path).toBeVisible();
    const d = await path.getAttribute('d');
    expect(d).toBeTruthy();
    expect(d).toContain('M');

    const circles = svg.locator('circle');
    const count = await circles.count();
    expect(count).toBe(mockRecords.length);
  });

  await page.screenshot({ path: '/tmp/bluelamp-screenshots/E2E-REC-003.png', fullPage: true });
});
