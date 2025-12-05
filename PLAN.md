# パックグループ機能 実装計画

## 概要
パックをシリーズ/期間別にグループ化し、フロントエンドでグループ選択UIを表示する機能

**要件:**
- シリーズ/期間別のグループ分け（Vol.1、Vol.2、期間限定など）
- フロントエンドでユーザーがグループを選択してからパックを見る

---

## 1. データベース設計

### 1.1 新規テーブル: pack_groups
```sql
CREATE TABLE pack_groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,              -- "Expansion Vol.1", "期間限定", etc.
  description TEXT,
  icon TEXT DEFAULT '📦',          -- 絵文字アイコン
  color_from TEXT DEFAULT 'from-purple-500',
  color_to TEXT DEFAULT 'to-purple-700',
  is_active INTEGER DEFAULT 1,     -- 公開/非公開
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### 1.2 gacha_packs テーブル変更
- `group_id TEXT REFERENCES pack_groups(id)` カラム追加

マイグレーションファイル: `0004_pack_groups.sql`

---

## 2. バックエンド実装

### 2.1 ドメイン層
- `apps/backend/src/domain/gacha/pack-group.ts` - PackGroup エンティティ
- `apps/backend/src/domain/gacha/pack-group-id.ts` - PackGroupId 値オブジェクト
- `apps/backend/src/domain/gacha/pack-group-repository.ts` - リポジトリインターフェース

### 2.2 インフラ層
- `apps/backend/src/infrastructure/persistence/d1/pack-group-repository-d1.ts`
- `apps/backend/src/infrastructure/persistence/mappers/pack-group-mapper.ts`
- `apps/backend/src/infrastructure/di/container.ts` - DI登録

### 2.3 アプリケーション層
- `GetPackGroupsUseCase` - グループ一覧取得
- `GetPackGroupWithPacksUseCase` - グループ詳細（パック含む）取得
- `CreatePackGroupUseCase` - グループ作成（Admin）
- `UpdatePackGroupUseCase` - グループ更新（Admin）
- `DeletePackGroupUseCase` - グループ削除（Admin）
- `AssignPackToGroupUseCase` - パックをグループに割り当て（Admin）

### 2.4 API エンドポイント
```
GET  /api/gacha/groups              - グループ一覧（公開グループのみ）
GET  /api/gacha/groups/all          - 全グループ（Admin用）
GET  /api/gacha/groups/:groupId     - グループ詳細（パック含む）
POST /api/gacha/groups              - グループ作成（Admin）
PUT  /api/gacha/groups/:groupId     - グループ更新（Admin）
DELETE /api/gacha/groups/:groupId   - グループ削除（Admin）
PUT  /api/gacha/packs/:packId/group - パックのグループ割り当て（Admin）
```

---

## 3. 型定義

### packages/types/src/pack-group.ts
```typescript
export interface PackGroup {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  colorFrom: string;
  colorTo: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface PackGroupWithPacks extends PackGroup {
  packs: GachaPack[];
}
```

### GachaPack への追加
```typescript
groupId: string | null;
```

---

## 4. フロントエンド実装

### 4.1 ユーザー向け（apps/frontend）

#### ルーティング変更
- `/groups` - グループ選択画面（新規）
- `/groups/:groupId/packs` - グループ内パック一覧
- 既存の `/packs` → グループ選択画面にリダイレクト、またはアクティブグループを表示

#### コンポーネント
- `pages/group-list.tsx` - グループ選択UI
- `components/app/group-card.tsx` - グループカードUI

### 4.2 管理画面（apps/admin）
- `pages/groups.tsx` - グループ管理ページ
- `components/admin/group-list.tsx` - グループ一覧
- `components/admin/group-form-modal.tsx` - グループ作成/編集モーダル
- パック管理に「グループ割り当て」セレクトを追加

---

## 5. 実装順序

### Phase 1: バックエンド基盤（優先度: 高）
1. マイグレーション追加（pack_groups テーブル + gacha_packs.group_id）
2. ドメインエンティティ作成
3. リポジトリ実装
4. UseCase 実装
5. API エンドポイント追加

### Phase 2: 管理画面（優先度: 中）
1. グループ管理ページ追加
2. グループCRUD機能
3. パック編集にグループ選択追加

### Phase 3: ユーザー向けフロントエンド（優先度: 高）
1. グループ選択ページ追加
2. グループ内パック一覧
3. ルーティング調整

---

## 6. 影響範囲

### 変更が必要なファイル
- `apps/backend/src/domain/gacha/` - 新規ファイル追加
- `apps/backend/src/domain/gacha/gacha-pack.ts` - groupId 追加
- `apps/backend/src/infrastructure/persistence/d1/gacha-pack-repository-d1.ts` - groupId 対応
- `apps/backend/src/presentation/routes/gacha.ts` - エンドポイント追加
- `packages/types/src/` - 型定義追加
- `apps/frontend/src/pages/` - 新規ページ追加
- `apps/frontend/src/lib/api-client.ts` - API関数追加
- `apps/admin/src/pages/` - 新規ページ追加

### 既存データへの影響
- 既存パックの `group_id` は NULL（未分類）
- 未分類パックは「その他」グループとして表示可能
