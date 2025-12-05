-- ============================================================================
-- News-Packs 中間テーブル追加マイグレーション
-- ============================================================================
-- Newsに複数パックを紐づけ可能にする
-- 既存のnews.pack_idからデータを移行し、pack_idカラムを削除
-- ============================================================================

-- ----------------------------------------------------------------------------
-- News-Packs 中間テーブル作成
-- ----------------------------------------------------------------------------
-- Newsに紐づけるパック（複数可、並び順管理）
CREATE TABLE news_packs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  news_id TEXT NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  pack_id TEXT NOT NULL REFERENCES gacha_packs(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  UNIQUE(news_id, pack_id)
);

CREATE INDEX idx_news_packs_news ON news_packs(news_id);
CREATE INDEX idx_news_packs_pack ON news_packs(pack_id);

-- ----------------------------------------------------------------------------
-- 既存データの移行
-- ----------------------------------------------------------------------------
-- 既存のnews.pack_idがnullでないレコードをnews_packsに移行
INSERT INTO news_packs (news_id, pack_id, sort_order)
SELECT id, pack_id, 0
FROM news
WHERE pack_id IS NOT NULL;

-- ----------------------------------------------------------------------------
-- newsテーブルからpack_idカラムを削除
-- ----------------------------------------------------------------------------
-- SQLiteはALTER TABLE DROP COLUMNをサポートしていないため
-- 新テーブルを作成してデータを移行する方式で対応

-- 一時テーブルを作成（pack_idなし）
CREATE TABLE news_new (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  badge_text TEXT DEFAULT 'NEW',
  banner_asset_id TEXT REFERENCES assets(id) ON DELETE SET NULL,
  is_active INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- データを移行
INSERT INTO news_new (id, title, subtitle, badge_text, banner_asset_id, is_active, sort_order, created_at, updated_at)
SELECT id, title, subtitle, badge_text, banner_asset_id, is_active, sort_order, created_at, updated_at
FROM news;

-- 旧テーブルを削除
DROP TABLE news;

-- 新テーブルをリネーム
ALTER TABLE news_new RENAME TO news;

-- インデックスを再作成
CREATE INDEX idx_news_active ON news(is_active);
CREATE INDEX idx_news_sort ON news(sort_order);
