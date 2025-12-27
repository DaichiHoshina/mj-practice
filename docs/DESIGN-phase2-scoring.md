# Design: Phase 2 点数計算練習機能

**作成日**: 2025-12-27
**ステータス**: Ready for Implementation
**対象フェーズ**: Phase 2
**PRD**: `/Users/daichi/mj-practice/docs/PRD-phase2-scoring.md`

---

## 1. 要件サマリー

### 1.1 実装項目

**Domain Logic Layer (`lib/scoring/`)**
- [ ] 型定義（Yaku, FuBreakdown, ScoreResult, ScoringQuestion）
- [ ] yakuDetector.ts: 役判定ロジック（25種類の役対応）
- [ ] fuCalculator.ts: 符計算ロジック（副底、面子符、雀頭符、待ち符、ツモ符）
- [ ] scoreCalculator.ts: 点数計算ロジック（親子、ツモロン、満貫以上）

**Data Layer (`data/questions/`)**
- [ ] scoring-easy.json（20問）
- [ ] scoring-medium.json（20問）
- [ ] scoring-hard.json（20問）

**UI Layer (`components/Quiz/`)**
- [ ] ScoringQuestionDisplay: 点数計算問題専用表示
- [ ] ScoringFeedback: 役・符・点数の内訳表示
- [ ] Phase 3フレームワーク統合（ScoringQuizGame）

**Test Layer**
- [ ] 複合役優先順位テスト（PRD 5.4に基づく）
- [ ] 符計算境界値テスト
- [ ] 点数計算境界値テスト

### 1.2 Phase 3からの再利用項目

| コンポーネント | 再利用方法 |
|--------------|----------|
| `QuizGame.tsx` | ScoringQuizGameとして拡張（Genericパターン） |
| `DifficultySelector.tsx` | そのまま再利用 |
| `ScoreBoard.tsx` | そのまま再利用 |
| `ChoiceButton.tsx` | そのまま再利用 |
| `loader.ts` | 拡張して`loadScoringQuestions`追加 |

---

## 2. アーキテクチャ

### 2.1 ディレクトリ構造

```
src/
├── lib/
│   ├── tiles/              # Phase 1（再利用）
│   ├── hand/               # Phase 1（再利用）
│   ├── shanten/            # Phase 1（再利用）
│   ├── quiz/               # Phase 3（拡張）
│   │   ├── types.ts        # Question型にcategory追加
│   │   ├── loader.ts       # scoring用ローダー追加
│   │   └── index.ts
│   └── scoring/            # 【新規】
│       ├── types.ts        # Yaku, FuBreakdown, ScoreResult等
│       ├── yakuDetector.ts # 役判定（純粋関数）
│       ├── fuCalculator.ts # 符計算（純粋関数）
│       ├── scoreCalculator.ts # 点数計算（純粋関数）
│       ├── constants.ts    # 役名、符定数
│       └── index.ts
├── components/
│   └── Quiz/
│       ├── QuizGame.tsx           # Phase 3（再利用）
│       ├── ScoringQuizGame.tsx    # 【新規】点数計算専用ゲーム
│       ├── ScoringQuestionDisplay.tsx # 【新規】
│       ├── ScoringFeedback.tsx    # 【新規】役・符内訳表示
│       └── ...
└── data/
    └── questions/
        ├── easy.json          # Phase 3
        ├── ...
        ├── scoring-easy.json   # 【新規】
        ├── scoring-medium.json # 【新規】
        └── scoring-hard.json   # 【新規】
```

### 2.2 型定義・インターフェース

```typescript
// lib/scoring/types.ts

import { TileType } from '../tiles';

/** 役の定義 */
export interface Yaku {
  readonly id: string;           // 一意識別子
  readonly name: string;         // 日本語名
  readonly han: number;          // 翻数（門前）
  readonly hanNaki: number;      // 翻数（鳴き）
  readonly isYakuman: boolean;   // 役満フラグ
}

/** 役判定結果 */
export interface YakuResult {
  readonly yakuList: readonly Yaku[];
  readonly totalHan: number;
  readonly isYakuman: boolean;
}

/** 符の内訳 */
export interface FuBreakdown {
  readonly base: 20;                          // 副底
  readonly mentsuFu: readonly MentsuFuItem[]; // 面子符
  readonly jantouFu: number;                  // 雀頭符
  readonly machiFu: number;                   // 待ち符
  readonly tsumoFu: number;                   // ツモ符
  readonly menzenRonFu: number;               // 門前ロン符
  readonly rawTotal: number;                  // 切り上げ前合計
  readonly total: number;                     // 切り上げ後合計
}

/** 面子符の項目 */
export interface MentsuFuItem {
  readonly type: 'shuntsu' | 'koutsu' | 'kantsu';
  readonly tiles: readonly TileType[];
  readonly isAnkou: boolean;    // 暗刻/暗槓
  readonly isYaochuuhai: boolean; // 么九牌
  readonly fu: number;
}

/** 点数計算結果 */
export interface ScoreResult {
  readonly fu: number;
  readonly han: number;
  readonly baseScore: number;     // 基本点
  readonly score: number;         // 最終点数
  readonly scoreType: ScoreType;  // 満貫等
  readonly isDealer: boolean;
  readonly isTsumo: boolean;
  readonly payments: PaymentBreakdown;
}

/** 点数区分 */
export type ScoreType =
  | 'normal'
  | 'mangan'
  | 'haneman'
  | 'baiman'
  | 'sanbaiman'
  | 'kazoeYakuman'
  | 'yakuman';

/** 支払い内訳 */
export interface PaymentBreakdown {
  readonly total: number;
  readonly fromDealer?: number;   // ツモ時の親支払い
  readonly fromNonDealer?: number; // ツモ時の子支払い
  readonly fromLoser?: number;    // ロン時の放銃者支払い
}

/** 和了コンテキスト（役判定に必要な情報） */
export interface WinContext {
  readonly winningTile: TileType;
  readonly isTsumo: boolean;
  readonly isDealer: boolean;
  readonly isRiichi: boolean;
  readonly isDoubleRiichi?: boolean;
  readonly isIppatsu?: boolean;
  readonly isHaitei?: boolean;
  readonly isRinshan?: boolean;
  readonly roundWind: 'ton' | 'nan' | 'shaa' | 'pei';
  readonly seatWind: 'ton' | 'nan' | 'shaa' | 'pei';
  readonly dora: readonly TileType[];
  readonly uraDora?: readonly TileType[];
}

/** 点数計算問題 */
export interface ScoringQuestion {
  readonly id: string;
  readonly category: 'scoring';
  readonly difficulty: 'easy' | 'medium' | 'hard';
  readonly title: string;
  readonly hand: readonly TileType[];
  readonly winningTile: TileType;
  readonly isDealer: boolean;
  readonly isTsumo: boolean;
  readonly isRiichi: boolean;
  readonly dora: readonly TileType[];
  readonly situation: {
    readonly roundWind: 'ton' | 'nan' | 'shaa' | 'pei';
    readonly seatWind: 'ton' | 'nan' | 'shaa' | 'pei';
  };
  readonly correctAnswer: {
    readonly score: number;
    readonly yaku: readonly string[];
    readonly fu: number;
    readonly han: number;
  };
  readonly choices: readonly {
    readonly id: string;
    readonly label: string;
    readonly score: number;
  }[];
  readonly explanation: string;
}
```

### 2.3 依存関係図

```
┌─────────────────────────────────────────────────────────────┐
│                      UI Layer                                │
│  ┌───────────────┐    ┌──────────────────────────────────┐  │
│  │ ScoringQuiz   │    │ ScoringQuestionDisplay           │  │
│  │ Game.tsx      │───▶│ ScoringFeedback.tsx              │  │
│  └───────────────┘    └──────────────────────────────────┘  │
│         │                              │                     │
│         │ 再利用                        │                     │
│         ▼                              ▼                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Phase 3 Components                                     │ │
│  │ DifficultySelector, ScoreBoard, ChoiceButton          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
         │
         │ import（UI → Logic）
         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Domain Logic Layer                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ lib/scoring/                                           │ │
│  │  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐  │ │
│  │  │yakuDetector │──▶│fuCalculator │──▶│scoreCalc    │  │ │
│  │  │   .ts       │   │   .ts       │   │ulator.ts   │  │ │
│  │  └─────────────┘   └─────────────┘   └─────────────┘  │ │
│  │         │                 │                 │          │ │
│  │         └─────────────────┴─────────────────┘          │ │
│  │                          │                             │ │
│  │                          ▼                             │ │
│  │                 ┌─────────────┐                        │ │
│  │                 │ types.ts    │                        │ │
│  │                 │ constants.ts│                        │ │
│  │                 └─────────────┘                        │ │
│  └────────────────────────────────────────────────────────┘ │
│         │                                                    │
│         │ import                                             │
│         ▼                                                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ lib/tiles/, lib/hand/ (Phase 1 - TileType等)           │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
         ▲
         │ JSON読み込み
         │
┌─────────────────────────────────────────────────────────────┐
│                     Data Layer                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ data/questions/                                        │ │
│  │ scoring-easy.json, scoring-medium.json, ...            │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

制約: Logic Layer ↛ UI Layer（禁止）
制約: Logic Layerは純粋関数のみ（副作用なし）
```

---

## 3. 実装計画

### Stage 1: 基盤構築（型定義・定数）

**タスク:**
- `lib/scoring/types.ts` - 全型定義
- `lib/scoring/constants.ts` - 役名定義、符定数テーブル
- `lib/scoring/index.ts` - エクスポート

**完了基準:**
- TypeScript型チェック通過
- 既存コードへの影響なし

**見積もり:** 0.5日

---

### Stage 2: 役判定ロジック

**タスク:**
- `lib/scoring/yakuDetector.ts`
  - `detectYaku(hand, context): YakuResult`
  - 対応役（PRD 5.1参照）:
    - 1翻: リーチ、タンヤオ、平和、一盃口、役牌
    - 2翻: 三色同順、一気通貫、チャンタ、対々和、三暗刻
    - 3翻: 混一色
    - 6翻: 清一色
    - 役満: 四暗刻、国士無双、大三元

**テスト（PRD 5.4に基づく）:**
- 単体役テスト（各役個別）
- 複合役テスト（優先順位表に従う）
- エッジケース（七対子と対々和の排他等）

**完了基準:**
- 全25役の判定が正確
- 複合役の同時成立判定が正確
- 役満時の他役無視が正確

**見積もり:** 2日

---

### Stage 3: 符計算ロジック

**タスク:**
- `lib/scoring/fuCalculator.ts`
  - `calculateFu(hand, yakuResult, context): FuBreakdown`
  - 実装項目:
    - 副底: 20符
    - 面子符: 順子0/刻子2-8/槓子8-32
    - 雀頭符: 役牌2符
    - 待ち符: 辺張・嵌張・単騎2符
    - ツモ符: 2符（平和ツモ除く）
    - 門前ロン: 10符
    - 切り上げ: 10符単位

**テスト:**
- 平和ツモ: 20符固定
- 七対子: 25符固定
- 境界値: 25→30, 35→40, 45→50

**完了基準:**
- 符計算が正確（内訳表示可能）
- 切り上げ処理が正確

**見積もり:** 1.5日

---

### Stage 4: 点数計算ロジック

**タスク:**
- `lib/scoring/scoreCalculator.ts`
  - `calculateScore(fu, han, isDealer, isTsumo): ScoreResult`
  - 実装項目:
    - 基本点: 符 × 2^(翻+2)
    - 親/子倍率
    - ツモ/ロン分配
    - 100点単位切り上げ
    - 満貫以上（mangan/haneman/baiman/sanbaiman/kazoeYakuman/yakuman）

**テスト（PRD 5.4境界値）:**
- 4翻40符 → 7700（満貫未満）
- 5翻 → 8000（満貫）
- 6-7翻 → 12000（跳満）
- 8-10翻 → 16000（倍満）
- 11-12翻 → 24000（三倍満）
- 13翻以上 → 32000（数え役満）

**完了基準:**
- 全パターン（親子×ツモロン×翻数）正確
- 支払い内訳が正確

**見積もり:** 1日

---

### Stage 5: 問題データ作成

**タスク:**
- `data/questions/scoring-easy.json`（20問）
  - 対象: 1-2翻の単純な役
  - 例: リーチ+ツモ、タンヤオ、役牌のみ

- `data/questions/scoring-medium.json`（20問）
  - 対象: 3-5翻の複合役
  - 例: リーチ+タンヤオ+ドラ、三色+平和

- `data/questions/scoring-hard.json`（20問）
  - 対象: 6翻以上、役満
  - 例: 清一色+一盃口、四暗刻

**問題作成フロー:**
1. 手牌を設計
2. Stage 2-4のロジックで正解を計算
3. 誤答選択肢3つを生成（よくある間違いパターン）
4. 解説文をmarkdownで記述

**完了基準:**
- 各難易度20問
- 正解データとロジック計算結果が一致
- 解説が分かりやすい

**見積もり:** 2日

---

### Stage 6: UI実装

**タスク:**
- `components/Quiz/ScoringQuestionDisplay.tsx`
  - 手牌表示（14枚）
  - 和了牌ハイライト
  - ドラ表示牌
  - 場況（親子、ツモロン、場風・自風）

- `components/Quiz/ScoringFeedback.tsx`
  - 役一覧（翻数付き）
  - 符内訳表
  - 計算式表示
  - markdown解説

- `components/Quiz/ScoringQuizGame.tsx`
  - Phase 3のQuizGameを参考に拡張
  - ScoringQuestion型対応
  - フィードバック拡張

**完了基準:**
- 手牌・ドラが正しく表示
- 役・符の内訳が見やすい
- レスポンシブ対応

**見積もり:** 2日

---

### Stage 7: 統合・テスト

**タスク:**
- E2Eテスト（Playwright等）
- パフォーマンステスト（PRD 6.1: 役判定50ms以内等）
- ブラウザ互換性テスト

**完了基準:**
- 全フロー正常動作
- パフォーマンス基準達成
- PRD受け入れ基準全項目達成

**見積もり:** 1日

---

## 4. Worktree戦略

**必要:** Yes

**理由:**
- 新機能開発（点数計算ロジック全体）
- 複数ファイルにまたがる大規模変更
- 既存Phase 3コードへの影響を隔離

**ブランチ名:** `feature/phase2-scoring`

**作成コマンド:**
```bash
git worktree add ../mj-practice-phase2 -b feature/phase2-scoring
```

---

## 5. テスト戦略

### 5.1 単体テスト

| 対象 | テストファイル | 重点項目 |
|------|--------------|---------|
| yakuDetector | `yakuDetector.test.ts` | 各役判定、複合役優先順位 |
| fuCalculator | `fuCalculator.test.ts` | 符内訳、切り上げ、特殊形（平和、七対子） |
| scoreCalculator | `scoreCalculator.test.ts` | 境界値（満貫境界等）、支払い計算 |

### 5.2 エッジケーステスト（PRD 5.4）

```typescript
// 必須テストケース
describe('複合役優先順位', () => {
  it('役満成立時は他の役を無視', () => {...});
  it('七対子と対々和は排他', () => {...});
  it('清一色+タンヤオ+一盃口が同時成立', () => {...});
});

describe('符計算境界値', () => {
  it('25符→30符に切り上げ', () => {...});
  it('平和ツモは20符固定', () => {...});
  it('七対子は25符固定', () => {...});
});

describe('点数境界値', () => {
  it('4翻40符は7700（満貫未満）', () => {...});
  it('5翻は満貫8000', () => {...});
  it('13翻以上は数え役満32000', () => {...});
});
```

### 5.3 ゴールデンテスト

外部ツール（mahjong-score-calculator等）との結果照合:
- 100パターンのテストケースを用意
- 外部ツールで正解を算出
- 本実装と照合

---

## 6. 問題データ作成フロー

```
1. 手牌設計
   └─ 狙いの役・難易度を決定
   └─ 14枚（和了牌含む）を構成

2. コンテキスト設定
   └─ 親/子、ツモ/ロン
   └─ 場風・自風
   └─ ドラ
   └─ リーチ有無

3. ロジック検証
   └─ yakuDetector → 役リスト
   └─ fuCalculator → 符
   └─ scoreCalculator → 点数

4. 選択肢生成
   └─ 正解: 計算結果
   └─ 誤答1: 符間違い（30→40符等）
   └─ 誤答2: 役見落とし
   └─ 誤答3: 親子間違い

5. 解説作成
   └─ 役の説明
   └─ 符の内訳
   └─ 計算過程

6. JSON出力
   └─ ScoringQuestion形式
```

**検証スクリプト（Stage 5で実装）:**
```bash
# 問題データと計算ロジックの整合性チェック
npm run validate:scoring-questions
```

---

## 7. Agent階層による実装フロー

### 7.1 Manager Agent の役割

**タスク:**
- 7つのStageをDeveloper Agentに割り当て
- 並列実行可能なStageを判定
- 各Agentの進捗監視
- 統合調整

### 7.2 並列実行計画

**Wave 1（並列実行可能）:**
- dev1: Stage 1（型定義・定数）
- dev2: Stage 5開始（サンプル問題5問作成、ロジック完成後に残り55問）

**Wave 2（Stage 1完了後）:**
- dev1: Stage 2（役判定）
- dev3: Stage 6開始（UI骨格作成、ロジック完成後に統合）

**Wave 3（Stage 2完了後）:**
- dev1: Stage 3（符計算）

**Wave 4（Stage 3完了後）:**
- dev1: Stage 4（点数計算）
- dev2: Stage 5継続（残り55問作成）
- dev3: Stage 6継続（UI統合）

**Wave 5（全ロジック完了後）:**
- dev4: Stage 7（統合テスト）

---

## 8. 次のアクション

1. **Worktree作成**
   ```bash
   git worktree add ../mj-practice-phase2 -b feature/phase2-scoring
   cd ../mj-practice-phase2
   ```

2. **Manager Agent起動**
   - `/dev` コマンドで実装開始
   - Manager AgentがDeveloper Agent（dev1-4）に7つのStageを割り当て
   - 並列実行で高速実装

3. **テスト・ビルド確認**
   ```bash
   npm test
   npm run build
   ```

4. **main統合**
   ```bash
   git checkout main
   git merge feature/phase2-scoring
   git push origin main
   ```

---

## サマリー

| 項目 | 内容 |
|------|------|
| 実装規模 | 新規ファイル約15、修正ファイル約5 |
| 見積もり合計 | 10日（Agent階層で短縮可能） |
| 主要リスク | 複合役判定の複雑さ、問題データ作成工数 |
| 再利用率 | Phase 3フレームワークの約70%を再利用 |
| Worktree | feature/phase2-scoring |
| 実装方式 | Agent階層（PO → Manager → Developer） |

---

**準備完了: `/dev` コマンドで実装を開始してください**
