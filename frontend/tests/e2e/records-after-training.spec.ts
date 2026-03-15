import { test, expect } from '@playwright/test';

const SCREENSHOT_DIR = '/tmp/bluelamp-screenshots';

test.only('E2E-REC-007: トレーニング実行後の記録反映', async ({ page }) => {
  // トレーニング完了 + クイズ + 結果画面 + 記録ページ遷移まで最大120秒
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

  // 実行するトレーニング種類を記録
  const selectedTrainingType = '水平方向';

  await test.step('前提: トレーニング選択画面にアクセス', async () => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'トレーニングを選ぼう！' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('レベル: 1')).toBeVisible();
  });

  await test.step('操作: 「水平方向」のカードをクリック', async () => {
    await page.getByText('水平方向').click();
  });

  await test.step('カウントダウン完了を待機', async () => {
    await expect(page.getByText('水平移動トレーニング')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('水平移動トレーニング')).toBeHidden({ timeout: 15000 });
  });

  await test.step('トレーニング実行中: タイマー表示確認', async () => {
    await expect(page.getByText('03:00')).toBeVisible({ timeout: 10000 });
  });

  await test.step('トレーニング完了を待機（1サイクル完了で自動遷移）', async () => {
    // Level 1: 2000ms x 10 positions = ~20秒で1サイクル完了
    await expect(page.getByText('クイズ')).toBeVisible({ timeout: 40000 });
  });

  await test.step('クイズに回答する（全問）', async () => {
    for (let i = 0; i < 4; i++) {
      const questionText = page.getByText(/番目に見つけた特殊記号はどれ？/);
      const isVisible = await questionText.isVisible().catch(() => false);
      if (!isVisible) break;

      const buttons = page.locator('button:not([disabled])').filter({ hasText: /[★♦♥♣]/ });
      const count = await buttons.count();
      if (count > 0) {
        await buttons.first().click();
        await page.waitForTimeout(1200);
      } else {
        break;
      }
    }
  });

  await test.step('結果画面に遷移することを確認', async () => {
    await expect(page.getByRole('heading', { name: 'けっか' })).toBeVisible({ timeout: 15000 });
  });

  await test.step('操作: 「記録を見る」ボタンをクリック', async () => {
    const recordButton = page.getByRole('button', { name: '記録を見る' });
    await expect(recordButton).toBeVisible({ timeout: 5000 });
    await recordButton.click();
  });

  await test.step('検証: URLが /records に遷移する', async () => {
    await page.waitForURL('**/records', { timeout: 10000 });
    expect(page.url()).toContain('/records');
  });

  await test.step('検証: 統計サマリーの「トレーニング回数」が「1回」以上', async () => {
    const main = page.locator('main');
    const label = main.getByText('トレーニング回数');
    await expect(label).toBeVisible({ timeout: 10000 });
    const card = label.locator('..');
    const value = card.getByText(/^\d+回$/);
    await expect(value).toBeVisible();
    // 値が1以上であること
    const text = await value.textContent();
    const num = parseInt(text!.replace('回', ''), 10);
    expect(num).toBeGreaterThanOrEqual(1);
  });

  await test.step('検証: 統計サマリーの「累計ポイント」が0ptより大きい', async () => {
    const main = page.locator('main');
    const label = main.getByText('累計ポイント');
    await expect(label).toBeVisible();
    const card = label.locator('..');
    const value = card.getByText(/^\d+pt$/);
    await expect(value).toBeVisible();
    const text = await value.textContent();
    const num = parseInt(text!.replace('pt', ''), 10);
    expect(num).toBeGreaterThan(0);
  });

  await test.step('検証: 統計サマリーの「平均正答率」が「N%」形式で表示される', async () => {
    const main = page.locator('main');
    const label = main.getByText('平均正答率');
    await expect(label).toBeVisible();
    const card = label.locator('..');
    // 「---」ではなく「N%」形式であること
    const value = card.getByText(/^\d+%$/);
    await expect(value).toBeVisible();
  });

  await test.step('検証: トレーニング履歴テーブルにデータが表示される', async () => {
    const historyHeading = page.getByText('トレーニング履歴');
    await expect(historyHeading).toBeVisible({ timeout: 10000 });
    // テーブルに少なくとも1行のデータがある
    const tableRows = page.locator('table tbody tr');
    await expect(tableRows.first()).toBeVisible({ timeout: 5000 });
    const rowCount = await tableRows.count();
    expect(rowCount).toBeGreaterThanOrEqual(1);
  });

  await test.step('検証: 表示された記録の種類が実行したトレーニング種類と一致する', async () => {
    // 最新の履歴行（1行目）の「種類」列に「水平方向」が含まれる
    const firstRow = page.locator('table tbody tr').first();
    await expect(firstRow.getByText(selectedTrainingType)).toBeVisible();
  });

  // ログ出力
  console.log('=== Browser Console Logs ===');
  consoleLogs.forEach((log) => console.log(`[${log.type}] ${log.text}`));
  console.log('=== Network Logs ===');
  networkLogs.forEach((log) => console.log(`[${log.method}] ${log.url} -> ${log.status ?? 'pending'}`));

  await page.screenshot({ path: `${SCREENSHOT_DIR}/E2E-REC-007-pass.png`, fullPage: true });
});
