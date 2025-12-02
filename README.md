# Trading Card Simulator

猫と他の動物を組み合わせたキャラクターカードをコレクションするWebアプリケーション。
ガチャシステムでユニークなキャラクターカードを集めることができます。

## 主な機能

- ガチャシステム - カードをランダムに引く
- コレクション管理 - 集めたカードを一覧表示
- レアリティシステム - 5段階のカテゴリ（hot, cute, cool, dark, white）
- 2000年代ゲーム風UI

## 技術スタック

- **Runtime**: Bun
- **Backend**: Hono (Cloudflare Workers)
- **Frontend**: React 18 + Vite + Tailwind CSS 4
- **UI Components**: shadcn/ui
- **Database**: Cloudflare D1
- **Storage**: Cloudflare R2
- **Image Processing**: Docker + sharp (WebP変換)

## 必要な環境

- [Bun](https://bun.sh/) v1.0+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (画像のWebP変換に必要)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (bunx経由で使用)

## セットアップ手順

### 1. リポジトリのクローンと依存関係のインストール

```bash
git clone <repository-url>
cd trading-card-simulator
bun install
```

### 2. 環境変数の設定

バックエンド用の環境変数ファイルを作成:

```bash
cat > apps/backend/.dev.vars << 'ENVEOF'
SESSION_SECRET=your-secret-key
API_KEY=your-api-key
APP_NAME="Trading Card Simulator"
APP_VERSION="1.0.0"
API_ENDPOINT="http://localhost:8787"
IMAGE_WORKER_URL="http://localhost:8788"
ENVEOF
```

画像API用の環境変数ファイルを作成:

```bash
cat > apps/images/.dev.vars << 'ENVEOF'
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:5174"
IMAGE_TRANSFORMER_URL="http://localhost:8090"
ENVEOF
```

### 3. D1データベースのセットアップ

ローカルD1データベースにマイグレーションを適用:

```bash
cd apps/backend
bunx wrangler d1 migrations apply trading-cards --local
cd ../..
```

### 4. R2バケットへの画像アップロード

画像をローカルR2バケットにアップロード:

```bash
cd apps/images

# 各画像を images/ プレフィックス付きでアップロード
for file in ../frontend/public/assets/*.png ../frontend/public/assets/*.jpg; do
  filename=$(basename "$file")
  bunx wrangler r2 object put "trading-card-images/images/$filename" --file="$file" --local
done

cd ../..
```

### 5. Docker コンテナの起動（WebP変換用）

Docker Desktopを起動してから、画像変換コンテナを起動:

```bash
cd apps/images
docker-compose up -d
cd ../..
```

### 6. 開発サーバーの起動

3つのターミナルで各サーバーを起動:

**ターミナル1: バックエンドAPI**
```bash
cd apps/backend
bunx wrangler dev --port 8787
```

**ターミナル2: 画像API**
```bash
cd apps/images
bunx wrangler dev --port 8788
```

**ターミナル3: フロントエンド**
```bash
bun run dev
```

### アクセスURL

| サービス | URL |
|----------|-----|
| フロントエンド | http://localhost:5173 |
| バックエンドAPI | http://localhost:8787 |
| 画像API | http://localhost:8788 |

### フロントエンド ルーティング

| パス | 画面 | 説明 |
|------|------|------|
| `/` | トップページ | ランディングページ |
| `/packs` | パック一覧 | 購入可能なパックの一覧 |
| `/packs/:packId` | パック詳細 | パックの詳細情報と購入 |
| `/packs/:packId/open` | パック開封 | パック開封演出 |
| `/gallery` | カードギャラリー | 所持カードの一覧 |
| `/cards/:cardId` | カード詳細 | カードの詳細情報 |

#### サンプルルート

開発・デモ用のサンプルページ:

| パス | 表示内容 |
|------|----------|
| `/sample/gallery-sample` | カードギャラリー |
| `/sample/pack-open-sample` | パック開封演出（エンシェント・フレイムパック） |
| `/sample/pack-select` | パック選択一覧 |
| `/sample/top-page-sample` | トップページ |

## よく使うコマンド

```bash
# 開発サーバー起動
bun run dev              # フロントエンド (http://localhost:5173)
bun run dev:backend      # バックエンドAPI (http://localhost:8787)
bun run dev:images       # 画像API (http://localhost:8788)

# ビルド
bun run build            # 全体ビルド
bun run build:frontend   # フロントエンドのみ

# コード品質
bun run lint             # Biomeでリントチェック
bun run lint:fix         # 自動修正
bun run format           # フォーマット

# テスト
bun run test             # E2Eテスト実行

# キャッシュクリア
bun run clean            # node_modules, .wrangler, bun.lockb を削除して再インストール

# デプロイ
bun run deploy           # Cloudflareへデプロイ
```

## トラブルシューティング

### `bun run clean` 後にD1エラーが発生する

`.wrangler` ディレクトリが削除されるとローカルD1データベースも削除されます。再度マイグレーションを実行してください:

```bash
cd apps/backend
bunx wrangler d1 migrations apply trading-cards --local
```

### 画像が表示されない (404)

R2バケットに画像がアップロードされていない可能性があります。セットアップ手順4を再実行してください。

### WebP変換が失敗する (500エラー)

1. Docker Desktopが起動しているか確認
2. 画像変換コンテナが起動しているか確認:
   ```bash
   docker ps | grep image-transformer
   ```
3. コンテナが起動していない場合:
   ```bash
   cd apps/images
   docker-compose up -d
   ```

### ポートが既に使用されている

既存のプロセスを終了:
```bash
# 特定のポートを使用しているプロセスを終了
lsof -ti:8787 | xargs kill -9  # バックエンド
lsof -ti:8788 | xargs kill -9  # 画像API
lsof -ti:5173 | xargs kill -9  # フロントエンド
```

## プロジェクト構造

```
.
├── apps/
│   ├── frontend/          # React SPA (メインアプリ)
│   ├── backend/           # Hono API (バックエンド)
│   ├── images/            # 画像配信API (R2 + WebP変換)
│   └── admin/             # 管理画面
├── packages/
│   └── types/             # 共有型定義
├── scripts/               # ユーティリティスクリプト
└── CLAUDE.md              # AI開発ガイド
```

## ライセンス

MIT
