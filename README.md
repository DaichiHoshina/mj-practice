# mj-practice

麻雀勉強用Webアプリケーション

## 概要

牌効率計算・点数計算・クイズ機能を備えた麻雀学習ツール。

### 主な機能

- **牌効率計算** - 向聴数・有効牌の自動計算
- **点数計算クイズ** - 役・符・点数の計算練習
- **牌効率クイズ** - 最適打牌の選択トレーニング
- **難易度別問題** - Easy/Medium/Hard の3段階

## 技術スタック

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **UI**: React 19
- **Testing**: Jest
- **Styling**: CSS Modules

## セットアップ

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev
```

http://localhost:3000 でアクセス

## プロジェクト構成

```
mj-practice/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── efficiency/   # 牌効率計算ページ
│   │   └── quiz/         # クイズページ
│   ├── components/       # React コンポーネント
│   ├── lib/              # 麻雀ロジック
│   │   ├── hand/         # 手牌管理
│   │   ├── shanten/      # 向聴数計算
│   │   ├── scoring/      # 点数計算
│   │   ├── quiz/         # クイズロジック
│   │   └── tiles/        # 牌定義
│   ├── data/
│   │   └── questions/    # 問題データ（JSON）
│   ├── __tests__/        # テストファイル
│   └── types/            # TypeScript 型定義
├── public/               # 静的ファイル
└── package.json
```

## 開発コマンド

```bash
npm run dev           # 開発サーバー起動
npm run build         # プロダクションビルド
npm run start         # プロダクションサーバー起動
npm run lint          # ESLint実行
npm run lint:fix      # ESLint自動修正
npm run format        # Prettier実行
npm test              # テスト実行
npm run test:watch    # テストウォッチモード
npm run test:coverage # カバレッジ付きテスト
```

## コーディング規約

- TypeScript strict mode 有効
- `any` 型使用禁止
- ESLint + Prettier による品質管理
- コンポーネント単位でのモジュール化
- 麻雀用語の統一（詳細は `.serena/memories/code-style-conventions`）
- 詳細は `CLAUDE.md` を参照

## ライセンス

MIT

### 使用素材

- **麻雀牌画像**: [riichi-mahjong-tiles](https://github.com/FluffyStuff/riichi-mahjong-tiles) by FluffyStuff (CC0 1.0 / Public Domain)
