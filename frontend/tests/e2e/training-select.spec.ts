import { test, expect } from '@playwright/test';

const SCREENSHOT_DIR = '/tmp/bluelamp-screenshots';

test.only('E2E-TRN-001: トレーニング選択画面の初期表示', async ({ page }) => {
  await page.goto('/');

  // 「トレーニングを選ぼう！」の見出しが表示される
  await expect(page.getByRole('heading', { name: 'トレーニングを選ぼう！' })).toBeVisible();

  // 6種類のトレーニングカードが表示される
  const cards = [
    { name: '水平方向', description: '左右に視線を素早く動かす' },
    { name: '垂直方向', description: '上下に視線を素早く動かす' },
    { name: '斜め方向', description: 'X字型に視線を動かす' },
    { name: '複合パターン', description: '垂直＋斜めの複合パターン' },
    { name: '順番追跡', description: '数字を順番に追いかける' },
    { name: '連続水平', description: '連続して水平に視線を動かす' },
  ];

  for (const card of cards) {
    await expect(page.getByText(card.description)).toBeVisible();
  }

  // レベルスライダーが表示される
  await expect(page.getByRole('slider')).toBeVisible();

  // 「レベル: 1」と表示される
  await expect(page.getByText('レベル: 1')).toBeVisible();

  // スライダーの初期値が1
  const slider = page.getByRole('slider');
  await expect(slider).toHaveAttribute('aria-valuenow', '1');

  await page.screenshot({ path: `${SCREENSHOT_DIR}/E2E-TRN-001-pass.png`, fullPage: true });
});
