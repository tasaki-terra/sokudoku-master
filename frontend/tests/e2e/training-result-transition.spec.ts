import { test, expect } from '@playwright/test';

const SCREENSHOT_DIR = '/tmp/bluelamp-screenshots';

test.only('E2E-TRN-004: トレーニング実行から結果画面への遷移', async ({ page }) => {
  // トレーニング完了 + クイズ回答 + 結果画面遷移まで最大90秒
  test.setTimeout(90000);

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

  await test.step('前提: トレーニング選択画面が表示されている（レベル1）', async () => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'トレーニングを選ぼう！' })).toBeVisible();
    await expect(page.getByText('レベル: 1')).toBeVisible();
  });

  await test.step('操作: 「水平方向」のカードをクリック', async () => {
    await page.getByText('水平方向').click();
  });

  await test.step('カウントダウン完了を待機', async () => {
    // カウントダウンオーバーレイが表示される
    await expect(page.getByText('水平移動トレーニング')).toBeVisible({ timeout: 10000 });
    // カウントダウンが消える（5秒 + フェードアウト）
    await expect(page.getByText('水平移動トレーニング')).toBeHidden({ timeout: 15000 });
  });

  await test.step('トレーニング実行中: タイマーが表示される', async () => {
    await expect(page.getByText('03:00')).toBeVisible({ timeout: 10000 });
  });

  await test.step('トレーニング完了を待機（1サイクル完了で自動遷移）', async () => {
    // Level 1: 2000ms x 10 positions = ~20秒で1サイクル完了
    // 1サイクル完了後、handleCycleComplete → onComplete → quiz ステップへ遷移
    // クイズ画面の「クイズ」見出しが表示されるまで待つ
    await expect(page.getByText('クイズ')).toBeVisible({ timeout: 40000 });
  });

  await test.step('クイズに回答する（全問）', async () => {
    // クイズは specialCount 問（Level 1: gridSize=4, specialCount=3 → 3問）
    // 各問で最初の選択肢をクリックして進む
    for (let i = 0; i < 4; i++) {
      // 問題が表示されているか確認
      const questionText = page.getByText(/番目に見つけた特殊記号はどれ？/);
      const isVisible = await questionText.isVisible().catch(() => false);
      if (!isVisible) break;

      // 選択肢ボタンをクリック（最初の選択肢）
      const buttons = page.locator('button:not([disabled])').filter({ hasText: /[★♦♥♣]/ });
      const count = await buttons.count();
      if (count > 0) {
        await buttons.first().click();
        // フィードバック表示後に次の問題へ（FEEDBACK_DELAY=800ms）
        await page.waitForTimeout(1200);
      } else {
        break;
      }
    }
  });

  await test.step('検証: 自動的に結果画面に遷移する', async () => {
    // クイズ完了後、saveResult API呼び出し → 結果画面へ遷移
    await expect(page.getByRole('heading', { name: 'けっか' })).toBeVisible({ timeout: 15000 });
  });

  await test.step('検証: 「けっか」の見出しが表示される', async () => {
    // h2 の「けっか」が存在する
    const heading = page.getByRole('heading', { name: 'けっか' });
    await expect(heading).toBeVisible();
    // テキスト内容の確認
    await expect(heading).toHaveText('けっか');
  });

  // ログ出力
  console.log('=== Browser Console Logs ===');
  consoleLogs.forEach((log) => console.log(`[${log.type}] ${log.text}`));
  console.log('=== Network Logs ===');
  networkLogs.forEach((log) => console.log(`[${log.method}] ${log.url} -> ${log.status ?? 'pending'}`));

  await page.screenshot({ path: `${SCREENSHOT_DIR}/E2E-TRN-004-pass.png`, fullPage: true });
});
