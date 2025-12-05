-- ============================================================================
-- Pack Groups Migration
-- ============================================================================
-- パックをグループ化して管理するためのテーブル追加
-- シリーズ/期間別のグループ分け（Vol.1、Vol.2、期間限定など）
-- ============================================================================

-- ----------------------------------------------------------------------------
-- パックグループテーブル
-- ----------------------------------------------------------------------------
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

CREATE INDEX idx_pack_groups_active ON pack_groups(is_active);
CREATE INDEX idx_pack_groups_sort ON pack_groups(sort_order);

-- ----------------------------------------------------------------------------
-- gacha_packs テーブルに group_id カラム追加
-- ----------------------------------------------------------------------------
ALTER TABLE gacha_packs ADD COLUMN group_id TEXT REFERENCES pack_groups(id) ON DELETE SET NULL;

CREATE INDEX idx_gacha_packs_group ON gacha_packs(group_id);
