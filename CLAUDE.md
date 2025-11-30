# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

常に日本語で回答してください

## プロジェクト概要

**Bun Workspacesを使用したモノレポ構成**のフルスタックWebアプリケーションテンプレート。
Hono（バックエンド）+ React（フロントエンド）+ Bun（ランタイム）+ Vite（ビルドツール）+ Tailwind CSS 4 + shadcn/ui

### 技術スタック

- **バックエンド**: Hono（軽量Webフレームワーク）
- **フロントエンド**: React 19（UIライブラリ）
- **ランタイム**: Bun（高速JavaScriptランタイム・パッケージマネージャー）
- **モノレポ**: Bun Workspaces
- **ビルドツール**: Vite（開発サーバー・ビルド）
- **スタイリング**: Tailwind CSS 4 + shadcn/ui
- **リント/フォーマット**: Biome
- **テスト**: Playwright（E2E）、Storybook（UIコンポーネント開発）
- **Git Hooks**: Lefthook
- **デプロイ先**: Cloudflare Pages/Workers

## よく使うコマンド

### 開発

```bash
# フロントエンド開発サーバー起動（Vite）
bun run dev              # http://localhost:5173

# バックエンド開発サーバー起動（wrangler dev）
bun run dev:backend      # http://localhost:8787

# 両方を同時に起動する場合は、別々のターミナルで実行
# Terminal 1: bun run dev
# Terminal 2: bun run dev:backend

# プロダクションビルド
bun run build            # apps/frontend/dist にバンドル
bun run build:frontend   # フロントエンドのみビルド
bun run build:backend    # バックエンドはビルド不要（echo）

# ビルド結果をプレビュー
bun run preview
```

### コード品質

```bash
bun run lint             # Biomeでコードチェック
bun run lint:fix         # Biomeで自動修正（安全な修正+unsafe修正）
bun run format           # Biomeでフォーマット
bun run validate         # リント + テスト + ビルドを一括実行
```

### テスト

```bash
# Playwright E2Eテスト
bun run test                      # ヘッドレスモードで全テスト実行
bun run test:ui                   # Playwright UIモード（インタラクティブ）
bun run test:headed               # ブラウザ表示ありで実行

# 単一テストファイルの実行
bun run test apps/frontend/e2e/example.spec.ts

# デバッグモード
bunx playwright test --debug

# Storybook起動（UIコンポーネント開発・確認）
bun run storybook                 # http://localhost:6006
bun run build-storybook           # Storybookビルド
```

### shadcn/uiコンポーネント追加

**重要**: shadcn/ui コンポーネントを追加する際は、**必ず `apps/frontend` ディレクトリで実行**してください。

```bash
cd apps/frontend
bunx shadcn add button
bunx shadcn add card
```

プロジェクトルートで実行すると、正しい場所にファイルが生成されません。

### Cloudflareデプロイ

```bash
# React SPAをCloudflare Pagesにデプロイ
bun run deploy:pages

# Hono APIをCloudflare Workersにデプロイ
bun run deploy:workers

# 両方をまとめてデプロイ
bun run deploy
```

## モノレポ構造

```
.
├── apps/
│   ├── frontend/              # React SPA
│   │   ├── src/
│   │   │   ├── client/       # App entry point
│   │   │   ├── components/   # UI components
│   │   │   │   ├── ui/       # shadcn/ui components
│   │   │   │   └── app/      # App-specific components
│   │   │   ├── lib/          # Frontend utilities
│   │   │   │   ├── api-client.ts  # Hono RPC client
│   │   │   │   └── utils.ts       # cn() helper
│   │   │   └── styles/       # Global styles
│   │   ├── e2e/              # Playwright tests
│   │   ├── public/           # Static assets
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── tsconfig.json
│   │
│   └── backend/               # Hono API
│       ├── src/
│       │   └── index.ts      # Server entry point (AppType export)
│       ├── package.json
│       ├── tsconfig.json
│       └── wrangler.jsonc
│
├── packages/
│   └── types/                 # 共有型定義
│       ├── src/
│       │   ├── index.ts      # Main export
│       │   ├── env.ts        # Environment types (Env interface)
│       │   └── api.ts        # API types
│       ├── package.json
│       └── tsconfig.json
│
├── package.json               # Root (workspaces設定)
├── tsconfig.base.json         # Base TypeScript config
├── tsconfig.json              # TypeScript Project References
└── biome.json                 # Root Biome config
```

### ワークスペース間の依存関係

- **apps/frontend** → `@repo/types`, `@repo/backend` (AppType参照用)
- **apps/backend** → `@repo/types`
- **packages/types** → 独立（他に依存しない）

## Hono RPC による型安全なAPI通信

このプロジェクトでは、Hono RPC を使用してフロントエンドとバックエンド間で型安全なAPI通信を実現しています。

### Backend実装パターン (apps/backend/src/index.ts)

```typescript
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { Env } from '@repo/types/env'

const app = new Hono<{ Bindings: Env }>()

// CORS設定（開発環境でフロントエンドからのリクエストを許可）
app.use('/*', cors())

// GET エンドポイント例
app.get('/api/hello', (c) => {
  const name = c.req.query('name') || 'World'
  return c.json({
    message: `Hello, ${name}!`,
    timestamp: new Date().toISOString()
  })
})

// 環境変数を使用するエンドポイント例
app.get('/api/config', (c) => {
  const appName = c.env.APP_NAME || 'Hono + React App'
  const appVersion = c.env.APP_VERSION || '1.0.0'

  return c.json({
    appName,
    appVersion,
    apiEndpoint: c.env.API_ENDPOINT || 'http://localhost:8787',
    timestamp: new Date().toISOString()
  })
})

// AppType を export（Hono RPC用）
export type AppType = typeof app

export default app
```

### Frontend クライアント (apps/frontend/src/lib/api-client.ts)

```typescript
import { hc } from 'hono/client'
import type { AppType } from '@repo/backend'

// 型安全な API クライアント
export const apiClient = hc<AppType>(
  import.meta.env.VITE_API_URL || 'http://localhost:8787'
)
```

### Frontend での使用例

```typescript
import { apiClient } from '@/lib/api-client'

// GET リクエスト（クエリパラメータなし）
const configResponse = await apiClient.api.config.$get()
const config = await configResponse.json()
// config の型が自動推論される！

// GET リクエスト（クエリパラメータあり）
const helloResponse = await apiClient.api.hello.$get({
  query: { name: 'Claude' }
})
const hello = await helloResponse.json()
// hello.message の型が自動推論される！
```

### 新しいAPI endpointの追加手順

1. `apps/backend/src/index.ts` で endpoint を定義
2. `AppType` が自動的に更新される
3. Frontend で `apiClient` を使用すると型推論が効く
4. エディタのオートコンプリートで利用可能なエンドポイントが表示される

## TypeScript設定

### Base設定（tsconfig.base.json）

- すべてのワークスペースが `extends` で継承
- **`strict: true` を設定（Hono RPCに必須）**
- `moduleResolution: "bundler"` を使用

### TypeScript Project References

Root の `tsconfig.json` でワークスペース間の参照を定義:

```json
{
  "references": [
    { "path": "./apps/frontend" },
    { "path": "./apps/backend" },
    { "path": "./packages/types" }
  ]
}
```

各ワークスペースの `tsconfig.json` で `composite: true` を設定。

### 環境変数の型定義（packages/types/src/env.ts）

Cloudflare Workers環境変数とバインディングの型を `Env` インターフェースで定義。

```typescript
export interface Env {
  // 環境変数
  SESSION_SECRET?: string
  API_KEY?: string
  APP_NAME?: string
  APP_VERSION?: string
  API_ENDPOINT?: string

  // Cloudflareバインディング（使用する場合はコメント解除）
  // MY_KV?: KVNamespace
  // MY_BUCKET?: R2Bucket
  // DB?: D1Database
}
```

**Honoでの使用**:
```typescript
const app = new Hono<{ Bindings: Env }>()
```

## Git Hooks（Lefthook）

### pre-commit
- Biomeでリント・フォーマット（自動修正）
- ワークスペース内の変更ファイルのみ対象（`{staged_files}` を使用）
- 自動修正されたファイルは自動的にステージングに追加される（`stage_fixed: true`）

### pre-push
1. **lint-check**: Biomeでリントチェック（修正なし、エラーがあれば失敗）
2. **test**: Playwright E2Eテスト実行
3. **build**: プロダクションビルド確認

開発中に重い処理をスキップしたい場合は、`lefthook.yml` の該当箇所をコメントアウトしてください。

## 環境変数

### ローカル開発

`apps/backend/.dev.vars` ファイル（gitignoreに含まれる、wrangler dev が自動読み込み）:
```
SESSION_SECRET=your-secret-key
API_KEY=your-api-key
APP_NAME="Hono + React Template"
APP_VERSION="1.0.0"
API_ENDPOINT="http://localhost:8787"
```

**環境変数の生成方法**:
```bash
# SESSION_SECRET（32バイトの16進数文字列）
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### プロダクション

Cloudflare Dashboard → Workers & Pages → 設定 → Environment Variables

## テンプレート利用時の初期設定

このテンプレートから新規プロジェクトを作成する際は、以下を必ず更新してください。

### 1. プロジェクト名の変更

**package.json**（ルート）:
```json
{
  "name": "your-project-name"  // 変更
}
```

**apps/frontend/wrangler.jsonc**（Cloudflare Pages用）:
```jsonc
{
  "name": "your-frontend-project-name",  // 変更
  "pages_build_output_dir": "dist"
}
```

**apps/backend/wrangler.jsonc**（Cloudflare Workers用）:
```jsonc
{
  "name": "your-api-worker-name",  // 変更
  "main": "src/index.ts",
  "compatibility_date": "2024-09-23",
  "compatibility_flags": ["nodejs_compat"]
}
```

### 2. 環境変数の設定

```bash
# apps/backend/.dev.vars を編集
# すでにテンプレート実装例の環境変数が含まれています
```

### 3. GitHub Secrets の設定（CI/CD用）

自動デプロイを有効にする場合は、GitHubリポジトリに以下のシークレットを設定:

- `CLOUDFLARE_API_TOKEN` - Cloudflare APIトークン
- `CLOUDFLARE_ACCOUNT_ID` - CloudflareアカウントID
- `CLOUDFLARE_PAGES_PROJECT_NAME` - Pagesプロジェクト名
- `CLOUDFLARE_WORKERS_PROJECT_NAME` - Worker名

## 重要な制約事項

### Biome と CSS ファイル

`apps/frontend/src/styles/globals.css` は Tailwind CSS のディレクティブ（`@tailwind`, `@apply`）を含むため、Biome の設定で CSS ファイルのリント・フォーマットを無効化しています。これは意図的な設定で、実際の動作には影響ありません。

### TypeScript strictモード

モノレポで Hono RPC を正しく動作させるには、**すべての tsconfig.json で `"strict": true"` が必須**です。`tsconfig.base.json` で設定されているため、すべてのワークスペースで自動的に有効になります。

## トラブルシューティング

### ワークスペースの依存関係が解決されない

```bash
rm -rf node_modules apps/*/node_modules packages/*/node_modules bun.lockb
bun install
```

### 型定義が認識されない

TypeScript Project References を確認:
```bash
# 各ワークスペースの tsconfig.json で composite: true を確認
# Root の tsconfig.json で references を確認
```

### ビルドエラー

```bash
# フロントエンドのみビルド（エラー特定）
cd apps/frontend
bun run build

# ワークスペース全体の再インストール
cd /path/to/project/root
bun install
```

### 開発サーバーのポート競合

- フロントエンド: `http://localhost:5173` (Vite)
- バックエンド: `http://localhost:8787` (wrangler dev)

別のポートを使用する場合は、`apps/frontend/vite.config.ts` と API クライアントの URL を更新してください。

## 参考リンク

- [Bun Workspaces](https://bun.sh/docs/install/workspaces)
- [Hono RPC](https://hono.dev/docs/guides/rpc)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [Cloudflare Workers - Monorepos](https://developers.cloudflare.com/workers/ci-cd/builds/advanced-setups/)
