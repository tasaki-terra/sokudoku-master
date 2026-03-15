import { test, expect } from '@playwright/test';

const SCREENSHOT_DIR = '/tmp/bluelamp-screenshots';

/**
 * トレーニング選択画面から結果画面まで到達するヘルパー関数
 * 水平方向、レベル1を選択 → 実行完了待機 → クイズ回答 → 結果画面
 */
async function reachResultScreen(page: import('@playwright/test').Page) {
  await test.step('トレーニング選択画面を表示', async () => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'トレーニングを選ぼう！' })).toBeVisible();
  });

  await test.step('「水平方向」カードをクリック', async () => {
    await page.getByText('水平方向').click();
  });

  await test.step('カウントダウン完了を待機', async () => {
    await expect(page.getByText('水平移動トレーニング')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('水平移動トレーニング')).toBeHidden({ timeout: 15000 });
  });

  await test.step('トレーニング実行完了を待機（クイズ画面遷移）', async () => {
    await expect(page.getByRole('heading', { name: 'クイズ' })).toBeVisible({ timeout: 60000 });
  });

  await test.step('クイズに全問回答', async () => {
    let quizVisible = true;
    let attempts = 0;
    const maxAttempts = 10;

    while (quizVisible && attempts < maxAttempts) {
      attempts++;
      const optionButtons = page.locator('button:not([disabled])').filter({ hasText: /[★♦♥♣]/ });
      const count = await optionButtons.count();

      if (count > 0) {
        await optionButtons.first().click();
        await page.waitForTimeout(1200);
      } else {
        quizVisible = false;
      }

      const quizHeading = page.getByRole('heading', { name: 'クイズ' });
      quizVisible = await quizHeading.isVisible().catch(() => false);
    }
  });

  await test.step('結果画面が表示されるまで待機', async () => {
    await expect(page.getByRole('heading', { name: 'けっか' })).toBeVisible({ timeout: 30000 });
  });
}

test.only('E2E-TRN-006: 「もう一度」で選択画面に戻る・「記録を見る」で遷移', async ({ page }) => {
  test.setTimeout(120000);

  const consoleLogs: Array<{ type: string; text: string }> = [];
  page.on('console', (msg) => {
    consoleLogs.push({ type: msg.type(), text: msg.text() });
  });

  const networkLogs: Array<{ method: string; url: string; status?: number }> = [];
  page.on('request', (req) => {
    networkLogs.push({ method: req.method(), url: req.url() });
  });
  page.on('response', (res) => {
    const entry = networkLogs.find((l) => l.url === res.url() && !l.status);
    if (entry) entry.status = res.status();
  });

  // --- Part 1: 「もう一度」ボタンのテスト ---

  await test.step('Part1: トレーニングを実行して結果画面まで到達する', async () => {
    await reachResultScreen(page);
  });

  await test.step('Part1: 結果画面のスクリーンショット', async () => {
    await page.screenshot({ path: `${SCREENSHOT_DIR}/E2E-TRN-006-result1.png`, fullPage: true });
  });

  await test.step('Part1: 「もう一度」ボタンをクリック', async () => {
    const retryButton = page.getByRole('button', { name: 'もう一度' });
    await expect(retryButton).toBeVisible();
    await retryButton.click();
  });

  await test.step('Part1: 検証 - トレーニング選択画面に戻り「トレーニングを選ぼう！」が表示される', async () => {
    await expect(page.getByRole('heading', { name: 'トレーニングを選ぼう！' })).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: `${SCREENSHOT_DIR}/E2E-TRN-006-after-retry.png`, fullPage: true });
  });

  // --- Part 2: 「記録を見る」ボタンのテスト ---

  await test.step('Part2: 再度トレーニングを実行して結果画面まで到達する', async () => {
    await reachResultScreen(page);
  });

  await test.step('Part2: 結果画面のスクリーンショット', async () => {
    await page.screenshot({ path: `${SCREENSHOT_DIR}/E2E-TRN-006-result2.png`, fullPage: true });
  });

  await test.step('Part2: 「記録を見る」ボタンをクリック', async () => {
    const recordsButton = page.getByRole('button', { name: '記録を見る' });
    await expect(recordsButton).toBeVisible();
    await recordsButton.click();
  });

  await test.step('Part2: 検証 - URLが /records に変更される', async () => {
    await expect(page).toHaveURL(/\/records/, { timeout: 10000 });
    await page.screenshot({ path: `${SCREENSHOT_DIR}/E2E-TRN-006-records.png`, fullPage: true });
  });

  // ログ出力
  console.log('=== Browser Console Logs ===');
  consoleLogs.forEach((log) => console.log(`[${log.type}] ${log.text}`));
  console.log('=== Network Logs ===');
  networkLogs.forEach((log) => console.log(`[${log.method}] ${log.url} -> ${log.status ?? 'pending'}`));

  await page.screenshot({ path: `${SCREENSHOT_DIR}/E2E-TRN-006-pass.png`, fullPage: true });
});
