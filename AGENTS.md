# Repository Guidelines

## Project Structure & Module Organization
- `src/app/`: Next.js App Router。画面単位のルーティング（例: `src/app/quiz/efficiency`）。
- `src/components/`: UI コンポーネント。`src/components/Quiz` 配下にクイズ関連が集約。
- `src/lib/`: 麻雀ロジック（手牌、向聴数、点数計算、クイズロジック）。
- `src/data/questions/`: 問題データ（JSON）。
- `src/types/`: 共通型定義。画面・ロジックの型共有に使用。
- `src/app/globals.css`: グローバルスタイル。各画面は CSS Modules を併用。
- `src/__tests__/`: テスト。`*.test.ts` で管理。
- `public/`: 静的アセット。

## Build, Test, and Development Commands
- `npm run dev`: 開発サーバー起動（`http://localhost:3000`）。
- `npm run build`: 本番ビルド。
- `npm run start`: ビルド済みアプリの起動。
- `npm run lint` / `npm run lint:fix`: ESLint 実行（修正は `lint:fix`）。
- `npm run format`: Prettier による整形。
- `npm test` / `npm run test:watch` / `npm run test:coverage`: Jest テスト（監視/カバレッジあり）。

## Coding Style & Naming Conventions
- TypeScript strict モード。`any` は禁止。
- ESLint + Prettier に準拠（`eslint.config.mjs`）。
- コンポーネント名/ファイル名は PascalCase（例: `TileSelector.tsx`）。
- CSS Modules を使用（例: `Hand.module.css`）。
- ルートエイリアスは `@/`（例: `@/lib/shanten`）。

## Testing Guidelines
- Jest + ts-jest を使用。`src/__tests__/**/*.test.ts` が対象。
- 追加テストは対象機能の近くに配置し、テスト名は機能が分かる短い英語で記述。
- カバレッジは `npm run test:coverage` で確認。
 - セットアップは `src/__tests__/setup.ts` に集約。

## Commit & Pull Request Guidelines
- 既存履歴は `feat:` / `fix:` のプレフィックスが中心（例: `feat: 7枚待ちクイズ機能追加`）。同形式で短く要約。
- PR には変更概要、動作確認結果（実行したコマンド）、UI 変更がある場合はスクリーンショットを記載。

## Agent-Specific Instructions
- 自動フォーマットやビルドは事前合意なしに実行しない。
- 大きな変更は小さなコミットに分割し、レビューしやすくする。
