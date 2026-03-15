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

test.only('E2E-REC-005: トレーニング履歴テーブル表示', async ({ page }) => {
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

  await test.step('「トレーニング履歴」の見出しが表示される', async () => {
    const heading = page.getByRole('heading', { name: 'トレーニング履歴' });
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  await test.step('テーブルヘッダーに5列が表示される', async () => {
    const headerCells = page.locator('table thead th');
    await expect(headerCells).toHaveCount(5);
    await expect(headerCells.nth(0)).toHaveText('日付');
    await expect(headerCells.nth(1)).toHaveText('種類');
    await expect(headerCells.nth(2)).toHaveText('Lv');
    await expect(headerCells.nth(3)).toHaveText('スコア');
    await expect(headerCells.nth(4)).toHaveText('正答率');
  });

  await test.step('先頭行が最新の記録である（新しい順ソート）', async () => {
    const firstRow = page.locator('table tbody tr').first();
    const cells = firstRow.locator('td');
    // 最新はrec-5: 2026-03-14, sequence, level 5, score 88, 85%
    await expect(cells.nth(0)).toHaveText('3/14');
    await expect(cells.nth(1)).toHaveText('順番追跡');
    await expect(cells.nth(2)).toHaveText('5');
    await expect(cells.nth(3)).toHaveText('88');
    await expect(cells.nth(4)).toHaveText('85%');
  });

  await test.step('各行のデータ形式を検証', async () => {
    const rows = page.locator('table tbody tr');
    await expect(rows).toHaveCount(5);

    // 期待データ（新しい順）
    const expected = [
      { date: '3/14', type: '順番追跡', level: '5', score: '88', rate: '85%' },
      { date: '3/13', type: '複合', level: '1', score: '95', rate: '100%' },
      { date: '3/12', type: '斜め方向', level: '4', score: '60', rate: '70%' },
      { date: '3/11', type: '垂直方向', level: '2', score: '85', rate: '90%' },
      { date: '3/10', type: '水平方向', level: '3', score: '72', rate: '80%' },
    ];

    for (let i = 0; i < expected.length; i++) {
      const cells = rows.nth(i).locator('td');
      // 日付: M/D形式
      await expect(cells.nth(0)).toHaveText(expected[i].date);
      // 種類: 日本語ラベル
      await expect(cells.nth(1)).toHaveText(expected[i].type);
      // Lv: 数値
      await expect(cells.nth(2)).toHaveText(expected[i].level);
      // スコア: 数値
      await expect(cells.nth(3)).toHaveText(expected[i].score);
      // 正答率: N%形式
      await expect(cells.nth(4)).toHaveText(expected[i].rate);
    }
  });

  await page.screenshot({ path: '/tmp/bluelamp-screenshots/E2E-REC-005.png', fullPage: true });
});
