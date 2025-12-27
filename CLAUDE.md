# mj-practice プロジェクト設定

## プロジェクト概要

midjourney風の画像生成Webアプリケーション。Next.js + TypeScript + Tailwind CSSで構成。

## 技術スタック

- **フロントエンド**: Next.js 15, React 19, TypeScript
- **スタイリング**: Tailwind CSS
- **開発**: ESLint, Prettier

## 開発方針

### 品質基準

- TypeScript strict mode有効
- any型使用禁止
- ESLint/Prettier準拠
- コンポーネント単位でのモジュール化

### ディレクトリ構成

```
mj-practice/
├── src/
│   ├── app/          # Next.js App Router
│   ├── components/   # Reactコンポーネント
│   ├── lib/          # ユーティリティ・ヘルパー
│   └── types/        # TypeScript型定義
├── public/           # 静的ファイル
└── tests/            # テストファイル
```

### コーディング規約

- コンポーネントはPascalCase
- ファイル名はkebab-case
- 関数はcamelCase
- 定数はSCREAMING_SNAKE_CASE

## コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# Lint
npm run lint

# フォーマット
npm run format
```

## 注意事項

- グローバルCLAUDE.mdの8原則を遵守
- Serena MCPツールを優先使用
- 自動整形・ビルドは実行しない（提案のみ）
