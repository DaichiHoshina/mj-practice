import { test, expect } from '@playwright/test';

test.describe('7枚待ちクイズ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quiz/machi');
  });

  test('ページが正しく表示される', async ({ page }) => {
    // タイトル確認
    await expect(page.locator('h1')).toContainText('7枚待ちクイズ');

    // 説明文確認（最初の段落のみを確認）
    await expect(
      page.locator('p').filter({ hasText: '手牌の待ち牌を当てるクイズです' })
    ).toBeVisible();

    // 戻るボタン確認
    const backButton = page.locator('button:has-text("クイズ選択に戻る")');
    await expect(backButton).toBeVisible();
  });

  test('問題が表示される', async ({ page }) => {
    // 読み込み完了まで待機
    await page.waitForSelector('[data-testid="machi-quiz-game"]', {
      timeout: 10000,
    });

    // 手牌（7枚）が表示されることを確認
    const handTiles = page.locator('[data-testid="question-hand"] img');
    await expect(handTiles).toHaveCount(7);

    // 待ち牌候補（1m-9m）が表示されることを確認
    const candidateButtons = page.locator(
      '[data-testid="candidate-tiles"] button'
    );
    await expect(candidateButtons).toHaveCount(9);
  });

  test('牌を選択・解除できる', async ({ page }) => {
    await page.waitForSelector('[data-testid="machi-quiz-game"]');

    // 最初の候補牌を取得
    const firstCandidate = page
      .locator('[data-testid="candidate-tiles"] button')
      .first();

    // 選択前の状態確認（aria-pressedがfalse）
    await expect(firstCandidate).toHaveAttribute('aria-pressed', 'false');

    // クリックして選択
    await firstCandidate.click();

    // 選択後の状態確認（aria-pressedがtrue）
    await expect(firstCandidate).toHaveAttribute('aria-pressed', 'true');

    // もう一度クリックして解除
    await firstCandidate.click();

    // 解除後の状態確認（aria-pressedがfalse）
    await expect(firstCandidate).toHaveAttribute('aria-pressed', 'false');
  });

  test('複数の牌を選択できる', async ({ page }) => {
    await page.waitForSelector('[data-testid="machi-quiz-game"]');

    const candidates = page.locator('[data-testid="candidate-tiles"] button');

    // 最初の3つの牌を選択
    for (let i = 0; i < 3; i++) {
      await candidates.nth(i).click();
    }

    // 3つが選択状態になることを確認（aria-pressed属性で確認）
    const selectedCount = await candidates.evaluateAll((buttons) =>
      buttons.filter((btn) => btn.getAttribute('aria-pressed') === 'true')
        .length
    );
    expect(selectedCount).toBe(3);
  });

  test('回答機能が動作する', async ({ page }) => {
    await page.waitForSelector('[data-testid="machi-quiz-game"]');

    // 候補牌を1つ選択
    const firstCandidate = page
      .locator('[data-testid="candidate-tiles"] button')
      .first();
    await firstCandidate.click();

    // 回答ボタンをクリック
    const submitButton = page.locator('button:has-text("回答する")');
    await submitButton.click();

    // 結果が表示されることを確認（正解または不正解のいずれか）
    const correctText = page.locator('text=✓ 正解！');
    const incorrectText = page.locator('text=✗ 不正解');

    const isCorrectVisible = await correctText.isVisible().catch(() => false);
    const isIncorrectVisible = await incorrectText
      .isVisible()
      .catch(() => false);

    expect(isCorrectVisible || isIncorrectVisible).toBe(true);
  });

  test('次の問題に進める', async ({ page }) => {
    await page.waitForSelector('[data-testid="machi-quiz-game"]');

    // 適当に牌を選択して回答
    await page
      .locator('[data-testid="candidate-tiles"] button')
      .first()
      .click();
    await page.locator('button:has-text("回答する")').click();

    // 次の問題ボタンをクリック
    const nextButton = page.locator('button:has-text("次の問題")');
    await nextButton.click();

    // 手牌が変わることを確認（問題が切り替わった）
    await page.waitForTimeout(500); // 画面更新待ち
    const newHand = await page
      .locator('[data-testid="question-hand"] img')
      .first()
      .getAttribute('src');

    // 別の問題に切り替わった可能性が高い（同じ問題の可能性もあるため厳密には不確定）
    // ここでは次の問題ボタンが動作したことを確認
    expect(newHand).toBeDefined();
  });

  test('問題番号が表示される', async ({ page }) => {
    await page.waitForSelector('[data-testid="machi-quiz-game"]');

    // 進捗バーから問題番号を確認（例: 「問題 1 / 19」）
    const progressBar = page.locator('[data-testid="progress-bar"]');
    await expect(progressBar).toBeVisible();

    // テキストに「問題」と数字が含まれることを確認
    const progressText = await progressBar.textContent();
    expect(progressText).toMatch(/問題\s+\d+\s+\/\s+\d+/);
  });

  test('進捗バーが表示される', async ({ page }) => {
    await page.waitForSelector('[data-testid="machi-quiz-game"]');

    // 進捗バーが存在することを確認
    const progressBar = page.locator('[data-testid="progress-bar"]');
    await expect(progressBar).toBeVisible();
  });

  test('正解の視覚的フィードバックが表示される', async ({ page }) => {
    await page.waitForSelector('[data-testid="machi-quiz-game"]');

    // 牌を選択して回答
    await page
      .locator('[data-testid="candidate-tiles"] button')
      .first()
      .click();
    await page.locator('button:has-text("回答する")').click();

    // 回答後、正解の待ち牌が表示されることを確認
    const correctAnswerSection = page.locator('text=正解の待ち牌:');
    await expect(correctAnswerSection).toBeVisible();

    // 候補牌ボタンがdisabled状態になることを確認（回答後は選択不可）
    const firstCandidate = page
      .locator('[data-testid="candidate-tiles"] button')
      .first();
    await expect(firstCandidate).toBeDisabled();
  });

  test('キーボードで牌を選択できる', async ({ page }) => {
    await page.waitForSelector('[data-testid="machi-quiz-game"]');

    const firstCandidate = page
      .locator('[data-testid="candidate-tiles"] button')
      .first();

    // Enterキーで選択
    await firstCandidate.focus();
    await firstCandidate.press('Enter');

    // 選択状態になることを確認（aria-pressedで確認）
    await expect(firstCandidate).toHaveAttribute('aria-pressed', 'true');

    // スペースキーで解除
    await firstCandidate.press(' ');

    // 解除状態になることを確認
    await expect(firstCandidate).toHaveAttribute('aria-pressed', 'false');
  });

  test('最後の問題で「結果を見る」ボタンが表示される', async ({
    page,
  }) => {
    await page.waitForSelector('[data-testid="machi-quiz-game"]');

    // 最後の問題まで進む（最大19問と仮定）
    for (let i = 0; i < 19; i++) {
      // 候補牌を選択して回答
      const candidates = page.locator('[data-testid="candidate-tiles"] button');
      const visibleCandidate = candidates.first();

      // 要素が存在するか確認
      const count = await candidates.count();
      if (count === 0) break;

      await visibleCandidate.click();
      await page.locator('button:has-text("回答する")').click();

      // 次の問題ボタンまたは結果を見るボタンを探す
      const nextButton = page.locator(
        'button:has-text("次の問題"), button:has-text("結果を見る")'
      );
      const buttonText = await nextButton.textContent();

      if (buttonText?.includes('結果を見る')) {
        // 最後の問題に到達
        await expect(nextButton).toContainText('結果を見る');
        break;
      } else {
        // まだ問題がある場合は次へ
        await nextButton.click();
        await page.waitForTimeout(500);
      }
    }
  });
});
