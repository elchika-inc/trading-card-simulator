# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

常に日本語で回答してください

## プロジェクト概要

**Trading Card Simulator** - 猫と他の動物を組み合わせたキャラクターカードをコレクションするWebアプリケーション。
ガチャシステムでユニークなキャラクターカードを集めることができます。

**主な機能**:
- 🎰 ガチャシステム - カードをランダムに引く
- 📚 コレクション管理 - 集めたカードを一覧表示
- ⭐ レアリティシステム - 5段階のカテゴリ（🔥熱い、💕かわいい、❄️クール、🖤ダーク、🤍ホワイト）
- 🎮 2000年代ゲーム風UI

**技術スタック**: Bun Workspaces モノレポ、Hono（バックエンド）、React 18（フロントエンド）、Vite、Tailwind CSS 4、shadcn/ui、Biome、Playwright、Cloudflare Pages/Workers

## よく使うコマンド

### 開発

```bash
# フロントエンド開発サーバー起動（Vite）
bun run dev              # http://localhost:5173

# バックエンド開発サーバー起動（wrangler dev）
bun run dev:backend      # http://localhost:8787

# 画像管理API開発サーバー起動
bun run dev:images       # http://localhost:8788（wrangler dev）

# 管理画面開発サーバー起動
bun run dev:admin        # http://localhost:5174

# 複数サービスを同時起動する場合は、別々のターミナルで実行
# Terminal 1: bun run dev              (frontend)
# Terminal 2: bun run dev:backend      (backend API)
# Terminal 3: bun run dev:images       (images API)
# Terminal 4: bun run dev:admin        (admin panel)

# プロダクションビルド
bun run build            # apps/frontend/dist にバンドル
bun run build:frontend   # フロントエンドのみビルド
bun run build:admin      # 管理画面のみビルド
bun run build:backend    # バックエンドはビルド不要（echo）

# ビルド結果をプレビュー
bun run preview
```

### キャッシュクリア

```bash
# 全キャッシュとnode_modulesを削除して再インストール
bun run clean

# 以下の操作を実行します:
# - ルートと全ワークスペースのnode_modules削除
# - bun.lockb削除
# - Viteキャッシュ（.vite）削除
# - Wranglerキャッシュ（.wrangler）削除
# - 依存関係を再インストール

# 実行前に開発サーバーを停止してください
```

**使用タイミング**:
- React/lucide-reactなどのバージョン変更後にエラーが続く場合
- 依存関係の競合エラーが発生した場合
- 原因不明のビルドエラーやランタイムエラーが発生した場合

**追加の推奨事項**:
- ブラウザキャッシュもクリア（開発者ツール → キャッシュ無効化 + ハードリロード: `Cmd+Shift+R` / `Ctrl+Shift+R`）

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

### 画像管理

```bash
# 画像マイグレーション（ローカル画像をR2にアップロード）
bun run migrate:images
```

### Cloudflareデプロイ

```bash
# React SPAをCloudflare Pagesにデプロイ
bun run deploy:pages

# Hono APIをCloudflare Workersにデプロイ
bun run deploy:workers

# 画像管理APIをCloudflare Workersにデプロイ
bun run deploy:images

# すべてをまとめてデプロイ
bun run deploy
```

## モノレポ構造

```
.
├── apps/
│   ├── frontend/              # React SPA（メインアプリケーション）
│   │   ├── src/
│   │   │   ├── client/       # App entry point
│   │   │   ├── components/   # UI components
│   │   │   │   ├── ui/       # shadcn/ui components
│   │   │   │   └── app/      # App-specific components (HoloCard, CardGalleryなど)
│   │   │   ├── lib/          # Frontend utilities
│   │   │   │   ├── api-client.ts  # Hono RPC client
│   │   │   │   ├── utils.ts       # cn() helper
│   │   │   │   └── card-styles.ts # カードスタイル定義
│   │   │   └── styles/       # Global styles
│   │   ├── e2e/              # Playwright tests
│   │   ├── public/           # Static assets
│   │   │   └── assets/       # カード画像など
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── tsconfig.json
│   │
│   ├── backend/               # Hono API（メインAPI）
│   │   ├── src/
│   │   │   ├── index.ts      # Server entry point (AppType export)
│   │   │   └── data/
│   │   │       └── cards.ts  # カードマスターデータ
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── wrangler.jsonc
│   │
│   ├── images/                # 画像管理API（Cloudflare R2使用）
│   │   ├── src/
│   │   │   ├── index.ts      # Image service entry point
│   │   │   ├── lib/
│   │   │   │   ├── r2.ts     # R2操作ユーティリティ
│   │   │   │   └── validation.ts # 画像バリデーション
│   │   │   └── routes/
│   │   │       ├── upload.ts # 画像アップロード
│   │   │       ├── serve.ts  # 画像配信
│   │   │       └── list.ts   # 画像一覧
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── wrangler.jsonc
│   │
│   └── admin/                 # 管理画面（画像アップロード用）
│       ├── src/
│       │   ├── components/
│       │   │   ├── ui/       # shadcn/ui components
│       │   │   └── admin/    # 管理画面コンポーネント
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── package.json
│       ├── vite.config.ts
│       └── tsconfig.json
│
├── packages/
│   └── types/                 # 共有型定義
│       ├── src/
│       │   ├── index.ts      # Main export
│       │   ├── env.ts        # Environment types (Env interface)
│       │   ├── api.ts        # API types
│       │   ├── card.ts       # カード型定義（Card, CardRarity, HoloType, TextStyleTypeなど）
│       │   └── image.ts      # 画像型定義（ImageMetadata, ImageUploadResponseなど）
│       ├── package.json
│       └── tsconfig.json
│
├── scripts/
│   └── migrate-images.ts      # 画像マイグレーションスクリプト
│
├── package.json               # Root (workspaces設定)
├── tsconfig.base.json         # Base TypeScript config
├── tsconfig.json              # TypeScript Project References
└── biome.json                 # Root Biome config
```

### ワークスペース間の依存関係

- **apps/frontend** → `@repo/types`, `@repo/backend` (AppType参照用)
- **apps/backend** → `@repo/types`
- **apps/images** → `@repo/types`
- **apps/admin** → `@repo/types`
- **packages/types** → 独立（他に依存しない）

## Hono RPC による型安全なAPI通信

このプロジェクトでは、Hono RPC を使用してフロントエンドとバックエンド間で型安全なAPI通信を実現しています。

### Backend実装パターン (apps/backend/src/index.ts)

このプロジェクトでは、カードデータを取得するAPIが実装されています:

```typescript
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { Env } from '@repo/types/env'
import { CARDS_DATA } from './data/cards'

const app = new Hono<{ Bindings: Env }>()

// CORS設定（開発環境でフロントエンドからのリクエストを許可）
app.use('/*', cors())

// カード一覧取得（レアリティでフィルタリング可能）
app.get('/api/cards', (c) => {
  const rarity = c.req.query('rarity')

  let cards = CARDS_DATA
  if (rarity) {
    cards = cards.filter((card) => card.rarity === rarity)
  }

  return c.json({
    cards,
    total: cards.length,
    timestamp: new Date().toISOString()
  })
})

// カード詳細取得
app.get('/api/cards/:id', (c) => {
  const id = Number.parseInt(c.req.param('id'))
  const card = CARDS_DATA.find((card) => card.id === id)

  if (!card) {
    return c.json({ error: 'Card not found' }, 404)
  }

  return c.json({ card })
})

// レアリティ別カード数の統計
app.get('/api/cards/stats/rarity', (c) => {
  const stats = CARDS_DATA.reduce((acc, card) => {
    acc[card.rarity] = (acc[card.rarity] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return c.json({ stats })
})

// AppType を export（Hono RPC用）
export type AppType = typeof app

export default app
```

**カードマスターデータ（apps/backend/src/data/cards.ts）**:
- `CARDS_DATA`: Card型の配列として定義
- カード情報（id, name, holoType, textStyle, image, description, rarity など）

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

// カード一覧を取得
const cardsResponse = await apiClient.api.cards.$get()
const { cards } = await cardsResponse.json()
// cards の型が自動推論される！

// レアリティでフィルタリング
const hotCardsResponse = await apiClient.api.cards.$get({
  query: { rarity: 'hot' }
})
const { cards: hotCards } = await hotCardsResponse.json()

// 特定のカードを取得
const cardResponse = await apiClient.api.cards[':id'].$get({
  param: { id: '1' }
})
const { card } = await cardResponse.json()
```

### 新しいAPI endpointの追加手順

1. `apps/backend/src/index.ts` で endpoint を定義
2. `AppType` が自動的に更新される
3. Frontend で `apiClient` を使用すると型推論が効く
4. エディタのオートコンプリートで利用可能なエンドポイントが表示される

## カードシステム

このプロジェクトのコアとなるカードシステムは、以下のコンポーネントで構成されています:

### カード型定義（packages/types/src/card.ts）

```typescript
export interface Card {
  id: number
  count: number              // 所持枚数
  name: string
  type: string               // "Style: XXX, Anim: XXX"
  holoType: HoloType         // ホログラムエフェクト（60種類以上）
  textStyle: TextStyleType   // テキストスタイル（40種類以上）
  image: string              // 画像URL
  description: string
  iconName: string           // lucide-reactのアイコン名
  rarity: CardRarity         // "hot" | "cute" | "cool" | "dark" | "white"
}
```

### ホログラムエフェクト（HoloType）

60種類以上のホログラムエフェクトが定義されています:
- **Basic/Classic**: basic, vertical, diagonal, sparkle
- **Abstract/Texture**: ghost, rainbow, checker, cracked, hexagon, wireframe, oil
- **Metal/Material**: gold, silver, brushed, carbon
- **Special/Elements**: magma, cosmic, circuit, scales, glitter, waves, crystal, nebula, matrix, vortex, laser
- **Animated/Dynamic**: animated-galaxy, animated-rain, animated-scan など
- **Category-specific**: blaze, ember, phoenix (hot), hearts, bubbles, candy-swirl (cute), frozen, neon-grid (cool), abyssal, shadow-warp (dark)

### テキストスタイル（TextStyleType）

40種類以上のテキストスタイルが定義されています:
- **Metal**: gold, silver, steel
- **Light/Energy**: neon, neon-pink, plasma
- **Nature/Elements**: fire, ice, emerald
- **Special**: holo, glitch, retro, comic, 3d-pop, matrix-text
- **Animated**: animated-glitch, breathing-glow
- **Category-specific**: cotton-candy, bubblegum (cute), frostbite, cyberpunk (cool), shadow-whispers, void-script (dark)

### カードスタイル定義（apps/frontend/src/lib/card-styles.ts）

ホログラムエフェクトとテキストスタイルのCSS実装が定義されています:

```typescript
export const holoStyles: Record<HoloType, string> = {
  basic: 'bg-gradient-to-br from-blue-400/30 via-purple-400/30 to-pink-400/30',
  vertical: 'bg-[linear-gradient(180deg,transparent_0%,rgba(255,255,255,0.3)_50%,transparent_100%)]',
  // ... 60種類以上のスタイル定義
}

export const textStyles: Record<TextStyleType, string> = {
  gold: 'bg-gradient-to-b from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent',
  // ... 40種類以上のスタイル定義
}
```

### カードコンポーネント（apps/frontend/src/components/app/holo-card.tsx）

カードを表示するコンポーネント。ホログラムエフェクト、テキストスタイル、アイコン表示などを実装。

### カードギャラリー（apps/frontend/src/components/app/card-gallery.tsx）

カード一覧を表示し、レアリティでフィルタリングできるコンポーネント。

## 画像管理システム（apps/images）

Cloudflare R2を使用した画像アップロード・配信システム:

### 主な機能

- **画像アップロード**: multipart/form-dataでの画像アップロード
- **画像配信**: Cloudflare Image Resizingによる最適化配信
- **メタデータ管理**: R2 Custom Metadataでの画像情報管理
- **画像一覧取得**: カーソルベースのページネーション

### エンドポイント（apps/images/src/index.ts）

```typescript
// 画像アップロード
POST /upload

// 画像配信（リサイズ対応）
GET /serve/:id

// 画像一覧取得
GET /list?cursor=xxx&limit=20
```

### R2バインディング設定（apps/images/wrangler.jsonc）

```jsonc
{
  "r2_buckets": [
    {
      "binding": "IMAGES_BUCKET",
      "bucket_name": "trading-card-images"
    }
  ]
}
```

### 環境変数（packages/types/src/env.ts）

```typescript
export interface Env {
  // R2バケット
  IMAGES_BUCKET?: R2Bucket

  // 画像API URL（フロントエンドから使用）
  VITE_IMAGES_API_URL?: string
}
```

### 画像マイグレーション（scripts/migrate-images.ts）

ローカルの画像ファイルをR2にアップロードするスクリプト:

```bash
bun run migrate:images
```

## 管理画面（apps/admin）

画像アップロード用の管理画面。画像一覧表示、アップロード、プレビュー機能を提供。

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

  // Cloudflare R2バインディング
  IMAGES_BUCKET?: R2Bucket

  // 画像API URL（フロントエンド用）
  VITE_IMAGES_API_URL?: string

  // その他のバインディング（必要に応じて追加）
  // MY_KV?: KVNamespace
  // DB?: D1Database
}
```

**Honoでの使用**:
```typescript
const app = new Hono<{ Bindings: Env }>()

// R2バケットへのアクセス例
app.post('/upload', async (c) => {
  const bucket = c.env.IMAGES_BUCKET
  await bucket.put('key', data)
})
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

## 重要な制約事項

### Biome と CSS ファイル

`apps/frontend/src/styles/globals.css` は Tailwind CSS のディレクティブ（`@tailwind`, `@apply`）を含むため、Biome の設定で CSS ファイルのリント・フォーマットを無効化しています。これは意図的な設定で、実際の動作には影響ありません。

### TypeScript strictモード

モノレポで Hono RPC を正しく動作させるには、**すべての tsconfig.json で `"strict": true"` が必須**です。`tsconfig.base.json` で設定されているため、すべてのワークスペースで自動的に有効になります。

## トラブルシューティング

### ワークスペースの依存関係が解決されない

```bash
# 推奨: cleanコマンドを使用（キャッシュも削除）
bun run clean

# または手動で実行
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

# ワークスペース全体のキャッシュクリアと再インストール
cd /path/to/project/root
bun run clean
```

### 開発サーバーのポート競合

各サービスのデフォルトポート:
- **フロントエンド**: `http://localhost:5173` (Vite)
- **管理画面**: `http://localhost:5174` (Vite)
- **バックエンドAPI**: `http://localhost:8787` (wrangler dev)
- **画像管理API**: `http://localhost:8788` (wrangler dev)

別のポートを使用する場合は、各アプリケーションの設定ファイル（`vite.config.ts`、`wrangler.jsonc`）と環境変数を更新してください。

### R2バケットの設定

画像管理システムを使用する場合、Cloudflare R2バケットの設定が必要です:

1. Cloudflare Dashboard → R2 → Create bucket
2. バケット名: `trading-card-images`（または任意の名前）
3. `apps/images/wrangler.jsonc` の `r2_buckets.bucket_name` を更新
4. ローカル開発時は wrangler dev が自動的にローカルバケットをエミュレート

## 重要な開発パターン

### カードの新規追加

1. **カードデータを追加**（`apps/backend/src/data/cards.ts`）:
```typescript
export const CARDS_DATA: Card[] = [
  {
    id: 1,
    count: 1,
    name: "炎の猫",
    type: "Style: Phoenix, Anim: Blaze",
    holoType: "phoenix",
    textStyle: "fire",
    image: "/assets/cards/fire-cat.png",
    description: "燃え盛る炎を纏った猫",
    iconName: "Flame",
    rarity: "hot"
  },
  // 新しいカードを追加
]
```

2. **画像を配置**（`apps/frontend/public/assets/cards/` または R2にアップロード）

3. **スタイル定義の確認**（`apps/frontend/src/lib/card-styles.ts`）:
   - `holoType` に対応するスタイルが存在するか確認
   - `textStyle` に対応するスタイルが存在するか確認
   - 新しいスタイルが必要な場合は追加

### 新しいホログラムエフェクトの追加

1. **型定義を更新**（`packages/types/src/card.ts`）:
```typescript
export type HoloType =
  | "existing-types..."
  | "new-effect"  // 新しいエフェクトを追加
```

2. **スタイル定義を追加**（`apps/frontend/src/lib/card-styles.ts`）:
```typescript
export const holoStyles: Record<HoloType, string> = {
  // ...existing styles
  "new-effect": "bg-gradient-to-br from-color-1 to-color-2 [your-css-here]"
}
```

### 画像のアップロードとR2への移行

1. **ローカル画像を配置**: `apps/frontend/public/assets/cards/`

2. **R2にマイグレーション**:
```bash
bun run migrate:images
```

3. **フロントエンドのコードを更新**:
   - 画像URLを R2 URL に変更（例: `https://images.example.com/serve/card-id`）
   - または環境変数 `VITE_IMAGES_API_URL` を使用

## 参考リンク

- [Bun Workspaces](https://bun.sh/docs/install/workspaces)
- [Hono RPC](https://hono.dev/docs/guides/rpc)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [Cloudflare Workers - Monorepos](https://developers.cloudflare.com/workers/ci-cd/builds/advanced-setups/)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)
- [Cloudflare Image Resizing](https://developers.cloudflare.com/images/image-resizing/)
