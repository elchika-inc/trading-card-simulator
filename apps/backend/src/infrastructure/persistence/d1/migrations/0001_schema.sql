-- ============================================================================
-- Trading Card Simulator Database Schema
-- ============================================================================
-- 全てのテーブル定義（assets, cards, gacha_packs, gacha_rates, gacha_logs, site_settings）
-- ============================================================================

-- ----------------------------------------------------------------------------
-- アセットマスター（画像ファイル管理）
-- ----------------------------------------------------------------------------
-- R2に保存される画像ファイルのメタデータを管理
-- type: 'card' (カード表面), 'card-back' (カード裏面), 'pack-front' (パック表面), 'pack-back' (パック裏面)
-- pack_set_id: パック画像のセットID（表面と裏面を紐付ける）
CREATE TABLE assets (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('card', 'card-back', 'pack-front', 'pack-back')),
  original_name TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  r2_key TEXT NOT NULL UNIQUE,
  has_webp INTEGER DEFAULT 0,
  pack_set_id TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assets_type ON assets(type);
CREATE INDEX idx_assets_pack_set ON assets(pack_set_id);
CREATE INDEX idx_assets_r2_key ON assets(r2_key);

-- ----------------------------------------------------------------------------
-- カードマスター
-- ----------------------------------------------------------------------------
-- ガチャで排出されるカードの定義
CREATE TABLE cards (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  holo_type TEXT NOT NULL,
  text_style TEXT NOT NULL,
  asset_id TEXT REFERENCES assets(id) ON DELETE SET NULL,
  description TEXT,
  icon_name TEXT,
  rarity TEXT NOT NULL CHECK (rarity IN ('hot', 'cute', 'cool', 'dark', 'white')),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cards_rarity ON cards(rarity);
CREATE INDEX idx_cards_asset ON cards(asset_id);

-- ----------------------------------------------------------------------------
-- ガチャパック定義
-- ----------------------------------------------------------------------------
-- ガチャで引けるパックの定義
-- UI表示用プロパティを含む
-- pack_set_id: パック画像セットID（assetsテーブルのpack_set_idと紐付け）
CREATE TABLE gacha_packs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  pack_set_id TEXT,
  cost INTEGER DEFAULT 100,
  cards_per_pack INTEGER DEFAULT 5,
  is_active INTEGER DEFAULT 1,
  group_id TEXT,
  -- UI表示用プロパティ
  sub_title TEXT,
  contents_info TEXT DEFAULT '1パック / 5枚入り',
  color_from TEXT DEFAULT 'from-purple-500',
  color_to TEXT DEFAULT 'to-purple-700',
  accent_color TEXT DEFAULT 'bg-purple-600',
  icon TEXT DEFAULT '📦',
  rare_rate TEXT,
  back_title TEXT DEFAULT 'PACK INFO',
  feature_title TEXT DEFAULT 'Pickup Feature',
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_gacha_packs_pack_set ON gacha_packs(pack_set_id);
CREATE INDEX idx_gacha_packs_active ON gacha_packs(is_active);
CREATE INDEX idx_gacha_packs_group ON gacha_packs(group_id);
CREATE INDEX idx_gacha_packs_sort ON gacha_packs(sort_order);

-- ----------------------------------------------------------------------------
-- ガチャ排出レート
-- ----------------------------------------------------------------------------
-- パックとカードの紐付け、排出確率（weight）を管理
CREATE TABLE gacha_rates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pack_id TEXT NOT NULL,
  card_id INTEGER NOT NULL,
  weight INTEGER NOT NULL CHECK (weight > 0),
  is_pickup INTEGER DEFAULT 0,
  FOREIGN KEY (pack_id) REFERENCES gacha_packs(id) ON DELETE CASCADE,
  FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
);

CREATE INDEX idx_gacha_rates_pack ON gacha_rates(pack_id);
CREATE INDEX idx_gacha_rates_card ON gacha_rates(card_id);
CREATE UNIQUE INDEX idx_gacha_rates_pack_card ON gacha_rates(pack_id, card_id);

-- ----------------------------------------------------------------------------
-- ガチャ実行ログ
-- ----------------------------------------------------------------------------
-- ガチャ実行履歴の記録
CREATE TABLE gacha_logs (
  id TEXT PRIMARY KEY,
  pack_id TEXT NOT NULL,
  card_ids TEXT NOT NULL,
  executed_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_gacha_logs_pack ON gacha_logs(pack_id);
CREATE INDEX idx_gacha_logs_executed ON gacha_logs(executed_at);

-- ----------------------------------------------------------------------------
-- サイト設定テーブル
-- ----------------------------------------------------------------------------
-- サイト全体の設定を管理（背景プリセットなど）
-- id: "site" (シングルトン)
CREATE TABLE site_settings (
  id TEXT PRIMARY KEY DEFAULT 'site',
  background_preset_id TEXT NOT NULL DEFAULT 'purple-cosmos',
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- News テーブル（ランディングページ用）
-- ----------------------------------------------------------------------------
-- ランディングページのカルーセル表示用News
-- カード（複数）、パック（1つ）、バナー画像（1つ）を紐づけ可能
CREATE TABLE news (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  badge_text TEXT DEFAULT 'NEW',
  pack_id TEXT REFERENCES gacha_packs(id) ON DELETE SET NULL,
  banner_asset_id TEXT REFERENCES assets(id) ON DELETE SET NULL,
  is_active INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_news_active ON news(is_active);
CREATE INDEX idx_news_sort ON news(sort_order);
CREATE INDEX idx_news_pack ON news(pack_id);

-- ----------------------------------------------------------------------------
-- News-Cards 中間テーブル
-- ----------------------------------------------------------------------------
-- Newsに紐づけるカード（複数可、並び順管理）
CREATE TABLE news_cards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  news_id TEXT NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  card_id INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  UNIQUE(news_id, card_id)
);

CREATE INDEX idx_news_cards_news ON news_cards(news_id);
CREATE INDEX idx_news_cards_card ON news_cards(card_id);
