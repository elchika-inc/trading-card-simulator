-- ============================================================================
-- Migration: pack_front_asset_id/pack_back_asset_id → pack_set_id
-- ============================================================================
-- パック画像の管理方法を変更
-- 従来: pack_front_asset_id, pack_back_asset_id で個別に管理
-- 新規: pack_set_id で表面・裏面をセットとして管理
-- ============================================================================

-- pack_set_id カラムを追加
ALTER TABLE gacha_packs ADD COLUMN pack_set_id TEXT;

-- assets テーブルに pack_set_id カラムを追加
ALTER TABLE assets ADD COLUMN pack_set_id TEXT;

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_gacha_packs_pack_set ON gacha_packs(pack_set_id);
CREATE INDEX IF NOT EXISTS idx_assets_pack_set ON assets(pack_set_id);

-- 注意:
-- - 古いカラム（pack_front_asset_id, pack_back_asset_id）はそのまま残す
-- - 新しいデータは pack_set_id を使用
-- - フロントエンド/バックエンドは pack_set_id のみを使用するよう更新済み
