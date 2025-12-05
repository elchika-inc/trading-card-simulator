# アセット管理システム

Trading Card Simulator のアセット（画像ファイル）管理システムの設計と実装を説明します。

## 目次

1. [概要](#概要)
2. [アーキテクチャ](#アーキテクチャ)
3. [アセット種別](#アセット種別)
4. [Service Bindings RPC](#service-bindings-rpc)
5. [データフロー](#データフロー)
6. [DBスキーマ](#dbスキーマ)
7. [実装詳細](#実装詳細)
8. [デプロイ](#デプロイ)

---

## 概要

アセット管理システムは、以下の2つのWorkerで構成されています：

- **images Worker**: R2バケットへの画像アップロード・配信
- **backend Worker**: D1データベースでのメタデータ管理

これらは **Cloudflare Workers Service Bindings RPC** で連携し、画像ファイルとメタデータを一元管理します。

### 設計原則

1. **責務の分離**: 画像配信（images）とデータ管理（backend）を分離
2. **型安全なRPC**: WorkerEntrypointによる型安全なサービス間通信
3. **DDDアーキテクチャ**: backendはDomain-Driven Designパターンに準拠
4. **参照整合性**: Card/GachaPackはAssetを外部キーで参照

---

## アーキテクチャ

```
┌─────────────────┐    Service Bindings RPC    ┌─────────────────┐
│     images      │ ─────────────────────────► │     backend     │
│   (R2 配信)     │     AssetService RPC       │      (D1)       │
│                 │ ◄───────────────────────── │                 │
└────────┬────────┘                            └────────┬────────┘
         │                                              │
         ▼                                              ▼
   ┌───────────┐                                 ┌───────────┐
   │ R2 Bucket │                                 │    D1     │
   │(画像ファイル)│                                 │(メタデータ)│
   └───────────┘                                 └───────────┘
```

### Worker間の役割分担

| Worker | 責務 | バインディング |
|--------|------|----------------|
| **images** | 画像アップロード、WebP変換、配信 | R2 Bucket (IMAGES_BUCKET) |
| **backend** | メタデータCRUD、アクティブ状態管理 | D1 Database (DB) |

---

## アセット種別

アセットは用途に応じて4種類に分類されます：

| Type | 説明 | 使用箇所 |
|------|------|----------|
| `card` | カード画像 | Card Entity (`asset_id`) |
| `card-back` | カード裏面画像 | カード裏面表示 |
| `pack-front` | パック表面画像 | GachaPack (`pack_front_asset_id`) |
| `pack-back` | パック裏面画像 | GachaPack (`pack_back_asset_id`) |

各タイプは **1つのアクティブアセット** を持つことができます（`is_active` フラグで管理）。

---

## Service Bindings RPC

### WorkerEntrypoint

`apps/backend/src/presentation/entrypoints/asset-service.ts`

```typescript
import { WorkerEntrypoint } from "cloudflare:workers";

export class AssetService extends WorkerEntrypoint<Env> {
  // アセット登録（images → backend）
  async registerAsset(input: RegisterAssetInput): Promise<RegisterAssetResult>;

  // アクティブ設定
  async setActiveAsset(type: AssetType, assetId: string): Promise<void>;

  // アセット削除
  async deleteAsset(assetId: string): Promise<string | null>;

  // アセット取得
  async getAsset(assetId: string): Promise<AssetRecord | null>;
  async getActiveAsset(type: AssetType): Promise<AssetRecord | null>;
  async getAssetsByType(type: AssetType): Promise<AssetRecord[]>;
}
```

### RPC呼び出し

`apps/images/src/routes/assets.ts`

```typescript
// imagesからbackendへのRPC呼び出し
async function registerAssetToDb(env: Env, input: RegisterAssetInput): Promise<void> {
  if (!env.BACKEND_API) {
    console.log("[Asset] BACKEND_API not configured, skipping DB registration");
    return;
  }

  const result = await env.BACKEND_API.registerAsset(input);
  console.log("[Asset] Registered to DB:", result.assetId);
}
```

### Service Bindings設定

**images/wrangler.jsonc**:
```jsonc
{
  "services": [
    {
      "binding": "BACKEND_API",
      "service": "trading-card-simulator-api",
      "entrypoint": "AssetService"
    }
  ]
}
```

**backend/src/index.ts**:
```typescript
// WorkerEntrypointをexport
export { AssetService } from "./presentation/entrypoints/asset-service";
```

---

## データフロー

### 1. 画像アップロード

```
Client                 images Worker              backend Worker
  │                         │                           │
  │ POST /upload            │                           │
  │ (multipart/form-data)   │                           │
  ├────────────────────────►│                           │
  │                         │                           │
  │                         │ R2にアップロード            │
  │                         │ (オリジナル + WebP)        │
  │                         ├──────────┐                │
  │                         │          │                │
  │                         │◄─────────┘                │
  │                         │                           │
  │                         │ registerAsset (RPC)       │
  │                         ├──────────────────────────►│
  │                         │                           │ INSERT INTO assets
  │                         │                           ├──────────┐
  │                         │                           │          │
  │                         │                           │◄─────────┘
  │                         │           result          │
  │                         │◄──────────────────────────┤
  │                         │                           │
  │ 200 OK                  │                           │
  │◄────────────────────────┤                           │
```

### 2. アクティブ設定

```
Admin UI               images Worker              backend Worker
  │                         │                           │
  │ PUT /assets/:id/active  │                           │
  ├────────────────────────►│                           │
  │                         │                           │
  │                         │ setActiveAsset (RPC)      │
  │                         ├──────────────────────────►│
  │                         │                           │ BEGIN TRANSACTION
  │                         │                           │ UPDATE assets SET is_active=0 WHERE type=?
  │                         │                           │ UPDATE assets SET is_active=1 WHERE id=?
  │                         │                           │ COMMIT
  │                         │           void            │
  │                         │◄──────────────────────────┤
  │                         │                           │
  │ 200 OK                  │                           │
  │◄────────────────────────┤                           │
```

### 3. 画像配信

```
Client                 images Worker              R2 Bucket
  │                         │                        │
  │ GET /serve/:id          │                        │
  ├────────────────────────►│                        │
  │                         │                        │
  │                         │ R2.get(key)            │
  │                         ├───────────────────────►│
  │                         │                        │
  │                         │      Object            │
  │                         │◄───────────────────────┤
  │                         │                        │
  │ 200 OK (image/webp)     │                        │
  │◄────────────────────────┤                        │
```

---

## DBスキーマ

### assets テーブル

```sql
CREATE TABLE assets (
  id TEXT PRIMARY KEY,                    -- UUID形式 (例: "abc123.png")
  type TEXT NOT NULL CHECK (type IN ('card', 'card-back', 'pack-front', 'pack-back')),
  original_name TEXT NOT NULL,            -- アップロード時のファイル名
  content_type TEXT NOT NULL,             -- MIMEタイプ (例: "image/png")
  size INTEGER NOT NULL,                  -- ファイルサイズ (bytes)
  r2_key TEXT NOT NULL UNIQUE,            -- R2オブジェクトキー (例: "cards/abc123.png")
  has_webp INTEGER DEFAULT 0,             -- WebP変換済みフラグ
  is_active INTEGER DEFAULT 0,            -- アクティブフラグ（各typeで1つのみ）
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assets_type ON assets(type);
CREATE INDEX idx_assets_type_active ON assets(type, is_active);
```

### Entity参照

**cards テーブル**:
```sql
CREATE TABLE cards (
  id INTEGER PRIMARY KEY,
  -- ...
  asset_id TEXT REFERENCES assets(id),   -- カード画像への参照
  -- ...
);
```

**gacha_packs テーブル**:
```sql
CREATE TABLE gacha_packs (
  id TEXT PRIMARY KEY,
  -- ...
  pack_front_asset_id TEXT REFERENCES assets(id),  -- パック表面画像
  pack_back_asset_id TEXT REFERENCES assets(id),   -- パック裏面画像
  -- ...
);
```

---

## 実装詳細

### Domain層

**Asset Entity**: `apps/backend/src/domain/asset/asset.ts`

```typescript
export class Asset extends AggregateRoot<AssetId> {
  private readonly type: AssetType;
  private readonly originalName: string;
  private readonly contentType: string;
  private readonly size: number;
  private readonly r2Key: string;
  private readonly hasWebP: boolean;
  private readonly isActive: boolean;
  private readonly createdAt: Date;
  private readonly updatedAt: Date;

  static create(props: AssetProps): Asset;
  static reconstruct(props: AssetProps): Asset;

  // Value Objects
  getId(): AssetId;
  getType(): AssetType;
  // ...
}
```

**Value Objects**:
- `AssetId`: 文字列ID（UUID形式）
- `AssetType`: アセット種別（'card' | 'card-back' | 'pack-front' | 'pack-back'）

### Repository

**Interface**: `apps/backend/src/domain/asset/asset-repository.ts`

```typescript
export interface AssetRepository {
  findById(id: AssetId): Promise<Asset | null>;
  findByType(type: AssetType): Promise<Asset[]>;
  findActiveByType(type: AssetType): Promise<Asset | null>;
  save(asset: Asset): Promise<void>;
  delete(id: AssetId): Promise<void>;
  setActive(type: AssetType, id: AssetId): Promise<void>;
}
```

**Implementation**: `apps/backend/src/infrastructure/persistence/d1/asset-repository-d1.ts`

### UseCase

| UseCase | 責務 |
|---------|------|
| `RegisterAssetUseCase` | 新規アセット登録 |
| `SetActiveAssetUseCase` | アクティブ状態の切り替え |
| `DeleteAssetUseCase` | アセット削除 |
| `GetAssetUseCase` | アセット取得（単体/タイプ別/アクティブ） |

---

## デプロイ

### デプロイ順序

**重要**: Service Bindingsのターゲットが先に存在する必要があります。

```bash
# 1. backendを先にデプロイ（Service Bindingsのターゲット）
bun run deploy:workers

# 2. imagesをデプロイ
bun run deploy:images
```

### ローカル開発

```bash
# Terminal 1: backend (port 8787)
bun run dev:backend

# Terminal 2: images (port 8788)
bun run dev:images
```

wranglerが自動的にローカルService Bindingsを設定します。

### 環境変数

**backend/wrangler.jsonc**:
```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "trading-card-simulator",
      "database_id": "..."
    }
  ]
}
```

**images/wrangler.jsonc**:
```jsonc
{
  "r2_buckets": [
    {
      "binding": "IMAGES_BUCKET",
      "bucket_name": "trading-card-images"
    }
  ],
  "services": [
    {
      "binding": "BACKEND_API",
      "service": "trading-card-simulator-api",
      "entrypoint": "AssetService"
    }
  ]
}
```

---

## 型定義

**packages/types/src/asset.ts**:

```typescript
// アセット種別
export type AssetType = "card" | "card-back" | "pack-front" | "pack-back";

// RPC入力
export interface RegisterAssetInput {
  id: string;
  type: AssetType;
  originalName: string;
  contentType: string;
  size: number;
  r2Key: string;
  hasWebP: boolean;
}

// RPC出力
export interface RegisterAssetResult {
  success: boolean;
  assetId: string;
}

// アセットレコード
export interface AssetRecord {
  id: string;
  type: AssetType;
  originalName: string;
  contentType: string;
  size: number;
  r2Key: string;
  hasWebP: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

**packages/types/src/env.ts**:

```typescript
import type { Service } from "cloudflare:workers";

// RPC Interface
export interface AssetServiceRpc {
  registerAsset(input: RegisterAssetInput): Promise<RegisterAssetResult>;
  setActiveAsset(type: AssetType, assetId: string): Promise<void>;
  deleteAsset(assetId: string): Promise<string | null>;
  getAsset(assetId: string): Promise<AssetRecord | null>;
  getActiveAsset(type: AssetType): Promise<AssetRecord | null>;
  getAssetsByType(type: AssetType): Promise<AssetRecord[]>;
}

export interface Env {
  // ...
  BACKEND_API?: Service<AssetServiceRpc>;
}
```

---

## 参考リンク

- [Cloudflare Workers Service Bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/)
- [Cloudflare Workers RPC](https://developers.cloudflare.com/workers/runtime-apis/rpc/)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
