-- Trading Card Simulator - Initial Schema
-- Created: 2024-12-01

-- カードマスターデータ
CREATE TABLE cards (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  holo_type TEXT NOT NULL,
  text_style TEXT NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT,
  icon_name TEXT,
  rarity TEXT NOT NULL CHECK (rarity IN ('hot', 'cute', 'cool', 'dark', 'white')),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cards_rarity ON cards(rarity);

-- ガチャパック定義
CREATE TABLE gacha_packs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  pack_image_url TEXT,
  cost INTEGER DEFAULT 100,
  cards_per_pack INTEGER DEFAULT 5,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 排出テーブル（どのパックにどのカードがどの確率で入っているか）
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

-- イベント期間管理
CREATE TABLE gacha_events (
  id TEXT PRIMARY KEY,
  pack_id TEXT NOT NULL,
  name TEXT NOT NULL,
  start_at TEXT NOT NULL,
  end_at TEXT NOT NULL,
  banner_image_url TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pack_id) REFERENCES gacha_packs(id) ON DELETE CASCADE
);

CREATE INDEX idx_gacha_events_period ON gacha_events(start_at, end_at);
CREATE INDEX idx_gacha_events_pack ON gacha_events(pack_id);

-- ガチャログ（分析用）
CREATE TABLE gacha_logs (
  id TEXT PRIMARY KEY,
  pack_id TEXT NOT NULL,
  card_ids TEXT NOT NULL,
  executed_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_gacha_logs_pack ON gacha_logs(pack_id);
CREATE INDEX idx_gacha_logs_executed ON gacha_logs(executed_at);
