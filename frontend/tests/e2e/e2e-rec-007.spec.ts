import { test, expect } from '@playwright/test';

test.describe('E2E-REC-007: トレーニング実行後の記録反映', () => {
  test.only('トレーニング完了後に記録ページへ遷移し、記録が正しく反映される', async ({ page }) => {
    test.setTimeout(120000);

    // 事前に現在の統計を取得（既存データがある場合に対応）
    const statsBefore = await (await fetch('http://localhost:3848/api/records/stats')).json();
    const initialTrainings = statsBefore.totalTrainings;
    const initialPoints = statsBefore.totalPoints;

    // Step 1: トップページにアクセス
    await page.goto('http://localhost:3847/');
    await page.waitForLoadState('networkidle');

    // トレーニング選択画面が表示されることを確認
    await expect(page.getByText('トレーニングを選ぼう！')).toBeVisible({ timeout: 10000 });

    // レベルが1であることを確認（デフォルト）
    await expect(page.getByText('レベル: 1')).toBeVisible();

    // Step 2: 水平方向トレーニングを選択
    await page.getByText('水平方向').click();

    // カウントダウンが表示されるのを待つ
    await expect(page.getByText('水平移動トレーニング')).toBeVisible({ timeout: 10000 });

    // カウントダウン完了を待つ（5秒 + 0.5秒のフェードアウト）
    // トレーニングボードが表示されるまで待つ
    await expect(page.getByText('視覚開発FMI表')).toBeVisible({ timeout: 15000 });

    // トレーニングが自動進行で完了するまで待つ
    // レベル1: 2000ms間隔 × 10ポジション = 約20秒 + カウントダウン5.5秒
    // クイズ画面が表示されるまで待つ
    await expect(page.getByText('クイズ')).toBeVisible({ timeout: 60000 });

    // Step 3: クイズに回答する
    // クイズの質問数は特殊記号の数（最大4問）に依存
    // 各質問に対して最初の選択肢をクリック
    let quizFinished = false;
    while (!quizFinished) {
      // 質問テキストが表示されるのを待つ
      const questionLocator = page.locator('text=/番目に見つけた特殊記号はどれ？/');
      const questionVisible = await questionLocator.isVisible().catch(() => false);

      if (!questionVisible) {
        // クイズが終了してresult画面に遷移した可能性
        quizFinished = true;
        break;
      }

      // 有効なボタン（disabled でない）を探してクリック
      const optionButtons = page.locator('button:not([disabled])').filter({
        hasText: /^[★♦♥♣]$/,
      });

      const count = await optionButtons.count();
      if (count > 0) {
        await optionButtons.first().click();
        // フィードバック表示後の遷移を待つ（FEEDBACK_DELAY = 800ms）
        await page.waitForTimeout(1200);
      } else {
        // ボタンがdisabledの場合はフィードバック中なので待つ
        await page.waitForTimeout(500);
      }

      // 結果画面が表示されたかチェック
      const resultVisible = await page.getByText('けっか').isVisible().catch(() => false);
      if (resultVisible) {
        quizFinished = true;
      }
    }

    // Step 4: 結果画面が表示されることを確認
    await expect(page.getByText('けっか')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('スコア')).toBeVisible();

    // スクリーンショット: 結果画面
    await page.screenshot({ path: '/tmp/bluelamp-screenshots/e2e-rec-007-result.png', fullPage: true });

    // 「記録を見る」ボタンをクリック
    await page.getByRole('button', { name: '記録を見る' }).click();

    // Step 5: 検証 - URLが /records に遷移する
    await expect(page).toHaveURL(/\/records/, { timeout: 10000 });

    // ページが完全にロードされるまで待つ
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('きろく')).toBeVisible({ timeout: 10000 });

    // スクリーンショット: 記録ページ
    await page.screenshot({ path: '/tmp/bluelamp-screenshots/e2e-rec-007-records.png', fullPage: true });

    // 検証: 統計サマリーの「トレーニング回数」が増加している
    const expectedTrainings = initialTrainings + 1;
    await expect(page.getByText(`${expectedTrainings}回`)).toBeVisible({ timeout: 10000 });

    // 検証: 統計サマリーの「累計ポイント」が0ptより大きい値で表示される
    // 「累計ポイント」ラベルの親カードからポイント値を取得
    const pointsCard = page.getByText('累計ポイント').locator('..');
    const pointsText = await pointsCard.locator('h3').textContent();
    expect(pointsText).toBeTruthy();
    const pointsValue = parseInt(pointsText!.replace('pt', ''), 10);
    expect(pointsValue).toBeGreaterThan(0);

    // 検証: 統計サマリーの「平均正答率」が「---」ではなく「N%」形式で表示される
    const rateCard = page.getByText('平均正答率').locator('..');
    const rateText = await rateCard.locator('h3').textContent();
    expect(rateText).not.toBe('---');
    expect(rateText).toMatch(/^\d+%$/);

    // 検証: トレーニング履歴テーブルに少なくとも1行のデータが表示される
    const tableRows = page.locator('table tbody tr');
    const rowCount = await tableRows.count();
    expect(rowCount).toBeGreaterThanOrEqual(1);

    // 検証: 最新の記録（最初の行）の種類が「水平方向」であること
    const firstRowType = await tableRows.first().locator('td').nth(1).textContent();
    expect(firstRowType).toBe('水平方向');

    // 最終スクリーンショット
    await page.screenshot({ path: '/tmp/bluelamp-screenshots/e2e-rec-007-final.png', fullPage: true });
  });
});
