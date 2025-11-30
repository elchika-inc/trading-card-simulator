# Hono + React SPA プロジェクトテンプレート 概要

これは、Hono (バックエンド)、React (フロントエンド)、Bun を使用したフルスタック Web アプリケーションのテンプレートです。Cloudflare Pages/Workers へのデプロイを想定しています。

## プロジェクト構造

このプロジェクトは、Bun Workspaces を使用したモノレポ構成です。

- `apps/frontend`: Vite + React で構築されたフロントエンド SPA。
- `apps/backend`: Hono で構築されたバックエンド API。
- `packages/types`: フロントエンドとバックエンドで共有される TypeScript の型定義。

## 主要技術スタック

- **バックエンド**: Hono
- **フロントエンド**: React 19, Vite
- **ランタイム**: Bun
- **UI**: Tailwind CSS 4, shadcn/ui
- **コード品質**: Biome (Linter & Formatter)
- **テスト**: Playwright (E2E)
- **コンポーネント開発**: Storybook
- **デプロイ**: Cloudflare Pages (フロントエンド), Cloudflare Workers (バックエンド)

## ビルドと実行

### 開発

**1. 依存関係のインストール**
```bash
bun install
```

**2. フロントエンド開発サーバーの起動**
Vite 開発サーバーが `http://localhost:5173` で起動します。
```bash
bun run dev
```

**3. バックエンド開発サーバーの起動**
Wrangler 開発サーバーが `http://localhost:8787` で起動します。
```bash
bun run dev:backend
```

### ビルド

フロントエンドのプロダクションビルドを生成します。成果物は `apps/frontend/dist` に出力されます。
```bash
bun run build
```

### テスト

Playwright を使用して E2E テストを実行します。
```bash
bun run test
```

## 開発コンベンション

### コードスタイル

- **フォーマット/リント**: [Biome](https://biomejs.dev/) を使用します。
- **設定ファイル**: `biome.json`
- **主なルール**:
    - 行幅: 100 文字
    - 引用符: ダブルクォート
    - セミコロン: 必須
    - `<button>` 要素には `type` 属性が必須です。
    - `any` 型の使用は警告されます (テストファイルを除く)。

### Git Hooks

- [Lefthook](https://github.com/evilmartians/lefthook) を使用して Git Hooks を管理します。
- **pre-commit**: Biome による自動フォーマットとリントが実行されます。
- **pre-push**: リント、テスト、ビルドが実行されます。

### 型安全な API (Hono RPC)

このプロジェクトでは、Hono の RPC 機能を利用して、フロントエンドとバックエンド間で型安全な通信を実現しています。

1.  **バックエンド (`apps/backend/src/index.ts`)**: API ルートを定義し、その型 (`AppType`) をエクスポートします。
2.  **フロントエンド (`apps/frontend/src/lib/api-client.ts`)**: バックエンドの `AppType` をインポートして `hono/client` のクライアントを作成します。
3.  **コンポーネント**: 作成したクライアントを通じて、バックエンドの API を型安全に呼び出すことができます。

```typescript
// 例: apps/frontend/src/components/app/api-config-demo.tsx
import { apiClient } from "@/lib/api-client";

// ...
const response = await apiClient.api.config.$get();
const data = await response.json(); // 'data' は型推論される
```
