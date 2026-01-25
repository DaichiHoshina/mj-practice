# スマホレイアウト最適化設計

## 概要

スマホでの閲覧・操作性を向上させるため、全ページでスクロール削減を重視したレイアウト最適化を実施。現在のモノクロミニマルデザインを維持しつつ、グリッド最適化によりスクロール量を30-50%削減する。

## 設計方針

### アプローチ: グリッド最適化型

- 現在のデザインを維持
- モバイルで余白・パディングを削減
- グリッドレイアウトを最適化
- デスクトップの表示は変更しない（後方互換性）

## セクション1: グローバル最適化戦略

### 対象ファイル
- `src/app/globals.css`

### 変更内容

**1. モバイル用のCSS変数追加**
```css
@media (max-width: 768px) {
  :root {
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 12px;
    --spacing-lg: 16px;
    --spacing-xl: 20px;

    --font-size-base: 14px;
    --font-size-small: 12px;
    --font-size-h1: 24px;
    --font-size-h2: 18px;
    --font-size-h3: 16px;
  }
}
```

**2. コンテナ最適化**
- デスクトップ: `max-width: 800px`, `padding: 24px`
- モバイル: `max-width: 100%`, `padding: 12px`

**3. カード間のギャップ削減**
- デスクトップ: `gap: 24px`
- モバイル: `gap: 12px`

**4. ボーダー・境界線の簡素化**
- 不要な入れ子カードのボーダーを削除
- モバイルでは最小限の視覚的区切りのみ

### 期待効果
- 縦方向のスペースを約30%削減
- 画面幅を最大限活用（左右余白を半減）

## セクション2: クイズページの最適化

### 対象ファイル
- `src/components/Quiz/QuizGame.module.css`
- `src/components/Quiz/MachiQuizGame.module.css`
- `src/components/Quiz/ScoringQuizGame.module.css`
- `src/components/Quiz/QuestionDisplay.module.css`
- `src/components/Quiz/ChoiceButton.module.css`
- `src/components/Quiz/ScoringFeedback.module.css`

### 変更内容

**1. 問題エリアのコンパクト化**
- ヘッダーpaddingを削減
- 質問文と手牌の間隔を詰める
- カード全体のpaddingを `20px → 12px`

**2. 選択肢の最適化**
- 牌候補: padding を `15px → 10px`
- 通常選択肢: `gap: 16px → 8px`, padding を `20px → 12px`

**3. フィードバックエリア**
- 正解/不正解表示のfont-sizeを `24px → 20px`
- 説明文の行間を `1.6 → 1.5`
- 次へボタンのmarginを削減

**4. 進捗表示の簡素化**
- モバイル: "問題 1 / 10" → "1/10"

### 期待効果
- クイズ画面のスクロール量を50%削減
- 問題→回答のフローがワンスクリーン内でほぼ完結

## セクション3: トップページ・牌効率計算ページの最適化

### 対象ファイル
- `src/app/page.module.css`（トップページ）
- `src/app/efficiency/page.module.css`（牌効率計算）
- `src/components/Hand/Hand.module.css`
- `src/components/ShantenDisplay/ShantenDisplay.module.css`

### 変更内容

**1. トップページのカードレイアウト**
- カードpaddingを `24px → 16px`
- カード間のgapを `24px → 12px`
- アイコンとタイトルを横並び配置（モバイルのみ）

**2. 牌効率計算ページ**
- セクション間のmarginを `24px → 12px`
- 牌選択グリッドのpaddingを `1.5rem → 1rem`

**3. Hand/ShantenDisplayコンポーネント**
- カードのpaddingを `24px → 16px` (モバイル)
- ヘッダー部分のmargin削減

### 期待効果
- トップページが画面1つに収まる
- 牌効率計算の主要機能がファーストビューに

## セクション4: その他ページ

### 対象ファイル
- `src/app/quiz/page.module.css`（クイズ選択）
- `src/app/quiz/scoring/page.module.css`
- `src/components/Quiz/ScoringQuestionDisplay.module.css`
- `src/components/Tile/Tile.module.css`

### 変更内容
- 各ページで一貫したpadding/margin削減
- タイルサイズの微調整（必要に応じて）

## 実装詳細

### メディアクエリの統一
```css
/* モバイル: 768px以下 */
@media (max-width: 768px) {
  /* スマホ最適化 */
}
```

### 後方互換性
- デスクトップの表示は一切変更しない
- モバイルのみメディアクエリで上書き
- 既存のクラス名は維持

### テスト対象デバイス
- iPhone SE (375px) - 最小サイズ
- iPhone 12/13 (390px) - 一般的
- iPhone Pro Max (428px) - 大型
- Android (360px-412px) - 多様なサイズ

## 期待される改善結果

| ページ | 現在のスクロール量 | 改善後 | 削減率 |
|--------|------------------|--------|--------|
| トップページ | 1-2画面 | 1画面 | 50% |
| クイズ（プレイ中） | 2-3画面 | 1-1.5画面 | 50% |
| クイズ（回答後） | 3-4画面 | 2画面 | 50% |
| 牌効率計算 | 2-3画面 | 1.5-2画面 | 33% |

## 変更ファイル一覧

### Phase 1: グローバル設定
1. `src/app/globals.css`

### Phase 2: クイズコンポーネント
2. `src/components/Quiz/QuizGame.module.css`
3. `src/components/Quiz/MachiQuizGame.module.css`
4. `src/components/Quiz/ScoringQuizGame.module.css`
5. `src/components/Quiz/QuestionDisplay.module.css`
6. `src/components/Quiz/ChoiceButton.module.css`
7. `src/components/Quiz/ScoringFeedback.module.css`

### Phase 3: トップページ・効率計算
8. `src/app/page.module.css`
9. `src/app/efficiency/page.module.css`
10. `src/components/Hand/Hand.module.css`
11. `src/components/ShantenDisplay/ShantenDisplay.module.css`

### Phase 4: その他ページ
12. `src/app/quiz/page.module.css`
13. `src/app/quiz/scoring/page.module.css`
14. `src/components/Tile/Tile.module.css`
