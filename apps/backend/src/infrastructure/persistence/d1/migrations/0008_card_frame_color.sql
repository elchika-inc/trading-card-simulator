-- ============================================================================
-- カードにフレーム色カラムを追加
-- ============================================================================
-- frame_color: JSON形式で保存 {"preset": "gold", "customColor": "#FF0000"}
-- preset: default, gold, silver, bronze, platinum, red, blue, green, purple, pink, orange, black, white, rainbow, custom
-- customColor: preset="custom"の場合のHEXカラー

ALTER TABLE cards ADD COLUMN frame_color TEXT;
