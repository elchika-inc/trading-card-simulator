# Trading Card Simulator 概要

猫と他の動物を組み合わせたキャラクターカードをコレクションするWebアプリケーション。ガチャシステムでランダムにカードを引き、コレクションを楽しめます。

## プロジェクト構造

Bun Workspaces を使用したモノレポ構成:

- `apps/frontend`: Vite + React で構築されたフロントエンド SPA（Cloudflare Pagesにデプロイ）
- `apps/backend`: Hono で構築されたバックエンド API（Cloudflare Workersにデプロイ）
- `packages/types`: 共有型定義（Card、Rarityなど）

## 主要機能

- 🎰 **ガチャシステム** - カードをランダムに引く
- 📚 **コレクション管理** - 集めたカードを一覧表示
- ⭐ **レアリティシステム** - 5段階のカテゴリ（🔥熱い、💕かわいい、❄️クール、🖤ダーク、🤍ホワイト）
- 🎮 **2000年代ゲーム風UI**

## 主要技術スタック

- **バックエンド**: Hono
- **フロントエンド**: React 19, Vite
- **ランタイム**: Bun
- **UI**: Tailwind CSS 4, shadcn/ui
- **コード品質**: Biome (Linter & Formatter)
- **テスト**: Playwright (E2E)
- **デプロイ**: Cloudflare Pages (フロントエンド), Cloudflare Workers (バックエンド)

## 開発コマンド

```bash
# 依存関係のインストール
bun install

# フロントエンド開発サーバー起動（http://localhost:5173）
bun run dev

# バックエンド開発サーバー起動（http://localhost:8787）
bun run dev:backend

# プロダクションビルド
bun run build

# E2Eテスト
bun run test
```

## 型安全な API (Hono RPC)

Hono の RPC 機能で、フロントエンドとバックエンド間で型安全な通信を実現:

```typescript
// フロントエンド例（apps/frontend/src/components/app/gacha.tsx）
import { apiClient } from "@/lib/api-client";

const response = await apiClient.api.gacha.$get();
const card = await response.json(); // 'card' は型推論される
```

## Git Hooks

- **pre-commit**: Biomeによる自動フォーマットとリント
- **pre-push**: リント、テスト、ビルドの実行

## デプロイ

```bash
# Cloudflare Pagesへフロントエンドをデプロイ
bun run deploy:pages

# Cloudflare Workersへバックエンドをデプロイ
bun run deploy:workers

# 両方をまとめてデプロイ
bun run deploy
```
