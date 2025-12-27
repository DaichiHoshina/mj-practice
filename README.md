# mj-practice

midjourney風の画像生成Webアプリケーション練習プロジェクト

## 技術スタック

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **React**: 19

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
│   ├── app/          # Next.js App Router pages
│   ├── components/   # Reusable React components
│   ├── lib/          # Utility functions
│   └── types/        # TypeScript type definitions
├── public/           # Static assets
└── tests/            # Test files
```

## 開発コマンド

```bash
npm run dev      # 開発サーバー起動
npm run build    # プロダクションビルド
npm run start    # プロダクションサーバー起動
npm run lint     # ESLint実行
npm run format   # Prettier実行
```

## コーディング規約

- TypeScript strict mode
- ESLint + Prettier
- コンポーネント駆動開発
- 詳細は `CLAUDE.md` を参照

## ライセンス

MIT
