-- ============================================================================
-- Trading Card Simulator Seed Data
-- ============================================================================
-- 初期データ（カード25枚、ガチャパック7種、排出レート、サイト設定）
-- asset_id は NULL で初期化（seed-cards-with-assets.ts で更新）
-- ============================================================================

-- ----------------------------------------------------------------------------
-- カードデータ（25枚）
-- ----------------------------------------------------------------------------
-- 画像ファイル名: {pack}-{series}-{number}.{ext} に対応
-- rarity分布: hot(5枚), cute(5枚), cool(5枚), dark(4枚), white(6枚)

-- Pack 1 Series 1 (1-1-1, 1-1-2, 1-1-3) - hot
INSERT INTO cards (id, name, type, holo_type, text_style, asset_id, description, icon_name, rarity) VALUES
(1, '炎猫フレイム', 'Style: Phoenix, Anim: Blaze', 'phoenix', 'fire', NULL, '燃え盛る炎を纏った猫', 'Flame', 'hot'),
(2, '溶岩の守護獣', 'Style: Magma, Anim: Flow', 'magma', 'fire', NULL, '溶岩を操る古代の守護者', 'Mountain', 'hot'),
(3, '紅蓮の戦士', 'Style: Crimson, Anim: Strike', 'animated-blaze', 'fire', NULL, '紅蓮の炎で敵を焼き尽くす戦士', 'Swords', 'hot');

-- Pack 1 Series 2 (1-2-1, 1-2-2, 1-2-3) - cute
INSERT INTO cards (id, name, type, holo_type, text_style, asset_id, description, icon_name, rarity) VALUES
(4, '虹色の妖精', 'Style: Rainbow, Anim: Flutter', 'rainbow', 'holo', NULL, '虹の架け橋を渡る小さな妖精', 'Rainbow', 'cute'),
(5, '花園の精霊', 'Style: Garden, Anim: Bloom', 'hearts', 'bubblegum', NULL, '花々に囲まれた可愛い精霊', 'Flower2', 'cute'),
(6, 'ゆめかわユニコーン', 'Style: Dream, Anim: Gallop', 'candy-swirl', 'cotton-candy', NULL, 'パステルカラーの夢かわユニコーン', 'Sparkles', 'cute');

-- Pack 2 Series 1 (2-1-1, 2-1-2, 2-1-3) - cool
INSERT INTO cards (id, name, type, holo_type, text_style, asset_id, description, icon_name, rarity) VALUES
(7, '氷結の騎士', 'Style: Frost, Anim: Freeze', 'frozen', 'ice', NULL, '氷の剣を振るう冷徹な騎士', 'Sword', 'cool'),
(8, 'サイバー忍者', 'Style: Cyber, Anim: Dash', 'neon-grid', 'cyberpunk', NULL, '電脳世界を駆ける忍者', 'Zap', 'cool'),
(9, '銀狼の遠吠え', 'Style: Silver, Anim: Howl', 'silver', 'steel', NULL, '月夜に吠える銀色の狼', 'Moon', 'cool');

-- Pack 2 Series 2 (2-2-1, 2-2-2) - dark
INSERT INTO cards (id, name, type, holo_type, text_style, asset_id, description, icon_name, rarity) VALUES
(10, '深淵の魔王', 'Style: Abyss, Anim: Emerge', 'abyssal', 'void-script', NULL, '深淵から現れた魔界の王', 'Skull', 'dark'),
(11, '闇夜の吸血鬼', 'Style: Vampire, Anim: Bite', 'shadow-warp', 'shadow-whispers', NULL, '闇夜に潜む不死の吸血鬼', 'Moon', 'dark');

-- Pack 3 Series 1 (3-1-1, 3-1-2, 3-1-3) - white
INSERT INTO cards (id, name, type, holo_type, text_style, asset_id, description, icon_name, rarity) VALUES
(12, '聖光の天使', 'Style: Holy, Anim: Descend', 'basic', 'gold', NULL, '聖なる光を纏った天使', 'Sparkles', 'white'),
(13, '純白のユニコーン', 'Style: Pure, Anim: Gallop', 'rainbow', 'holo', NULL, '純粋な心を持つ者だけが見えるユニコーン', 'Sparkles', 'white'),
(14, '光の精霊王', 'Style: Light, Anim: Radiate', 'gold', 'neon', NULL, '光の力を司る精霊の王', 'Sun', 'white');

-- Pack 3 Series 2 (3-2-1, 3-2-2) - hot
INSERT INTO cards (id, name, type, holo_type, text_style, asset_id, description, icon_name, rarity) VALUES
(15, '灼熱の龍', 'Style: Inferno, Anim: Roar', 'dragon-scales', 'plasma', NULL, '灼熱の息を吐く伝説の龍', 'Flame', 'hot'),
(16, '朱雀の化身', 'Style: Vermilion, Anim: Soar', 'phoenix', 'gold', NULL, '四神の一柱、朱雀の化身', 'Bird', 'hot');

-- Pack 4 Series 1 (4-1-1, 4-1-2) - cute
INSERT INTO cards (id, name, type, holo_type, text_style, asset_id, description, icon_name, rarity) VALUES
(17, 'シャボン玉の踊り子', 'Style: Bubble, Anim: Float', 'bubbles', 'holo', NULL, 'シャボン玉と踊る少女', 'Circle', 'cute'),
(18, 'プリンセスの午後', 'Style: Royal, Anim: Wave', 'glitter', 'bubblegum', NULL, 'お茶会を楽しむ小さなプリンセス', 'Crown', 'cute');

-- Pack 4 Series 2 (4-2-1, 4-2-2) - cool
INSERT INTO cards (id, name, type, holo_type, text_style, asset_id, description, icon_name, rarity) VALUES
(19, 'メカニカル・ドラゴン', 'Style: Mech, Anim: Activate', 'carbon', 'cyberpunk', NULL, '機械仕掛けの龍', 'Cog', 'cool'),
(20, 'ネオン街の狩人', 'Style: Neon, Anim: Hunt', 'neon-grid', 'neon', NULL, 'ネオンの街を徘徊する狩人', 'Target', 'cool');

-- Pack 5 Series 1 (5-1-1, 5-1-2) - dark
INSERT INTO cards (id, name, type, holo_type, text_style, asset_id, description, icon_name, rarity) VALUES
(21, '死神の鎌', 'Style: Reaper, Anim: Swing', 'void', 'void-script', NULL, '魂を刈り取る死神', 'Skull', 'dark'),
(22, '堕天使ルシファー', 'Style: Fallen, Anim: Descend', 'abyssal', 'void-script', NULL, '天から堕ちた美しき天使', 'Feather', 'dark');

-- Pack 5 Series 2 (5-2-1, 5-2-2, 5-2-3) - white
INSERT INTO cards (id, name, type, holo_type, text_style, asset_id, description, icon_name, rarity) VALUES
(23, '白虎の化身', 'Style: Byakko, Anim: Roar', 'silver', 'steel', NULL, '四神の一柱、白虎の化身', 'Cat', 'white'),
(24, '満月の祭司', 'Style: Moon, Anim: Chant', 'silver', 'holo', NULL, '満月の力を借りる祭司', 'Moon', 'white'),
(25, '神聖なる龍', 'Style: Divine, Anim: Ascend', 'gold', 'gold', NULL, '神聖なる力を持つ白い龍', 'Star', 'white');

-- ----------------------------------------------------------------------------
-- ガチャパック定義（UI表示プロパティ含む）
-- ----------------------------------------------------------------------------

INSERT INTO gacha_packs (
  id, name, description, pack_front_asset_id, pack_back_asset_id,
  cost, cards_per_pack, is_active,
  sub_title, contents_info, color_from, color_to, accent_color, icon, rare_rate, back_title, feature_title, sort_order
) VALUES
(
  'standard', 'スタンダードパック', '全種類のカードが均等に排出される基本パック', NULL, NULL,
  100, 5, 1,
  'Basic Collection', '1パック / 5枚入り', 'from-purple-500', 'to-purple-700', 'bg-purple-600', '📦', '全種均等', 'PACK INFO', 'Pickup Feature', 1
),
(
  'premium', 'プレミアムパック', 'レアリティの高いカードが出やすい特別パック', NULL, NULL,
  300, 5, 1,
  'Premium Collection', '1パック / 5枚入り', 'from-yellow-400', 'to-amber-600', 'bg-yellow-500', '👑', 'レア確率UP', 'PACK INFO', 'Pickup Feature', 2
),
(
  'hot-pack', '炎のパック', 'Hotレアリティのカードのみが排出されるパック', NULL, NULL,
  200, 5, 1,
  'Flame Series', '1パック / 5枚入り', 'from-red-500', 'to-orange-600', 'bg-red-600', '🔥', 'Hotタイプ限定', 'PACK INFO', 'Pickup Feature', 3
),
(
  'cute-pack', 'キュートパック', 'Cuteレアリティのカードのみが排出されるパック', NULL, NULL,
  200, 5, 1,
  'Cute Series', '1パック / 5枚入り', 'from-pink-400', 'to-rose-500', 'bg-pink-500', '💕', 'Cuteタイプ限定', 'PACK INFO', 'Pickup Feature', 4
),
(
  'cool-pack', 'クールパック', 'Coolレアリティのカードのみが排出されるパック', NULL, NULL,
  200, 5, 1,
  'Cool Series', '1パック / 5枚入り', 'from-blue-500', 'to-cyan-600', 'bg-blue-600', '❄️', 'Coolタイプ限定', 'PACK INFO', 'Pickup Feature', 5
),
(
  'dark-pack', 'ダークパック', 'Darkレアリティのカードのみが排出されるパック', NULL, NULL,
  200, 5, 1,
  'Dark Series', '1パック / 5枚入り', 'from-gray-700', 'to-gray-900', 'bg-gray-800', '🖤', 'Darkタイプ限定', 'PACK INFO', 'Pickup Feature', 6
),
(
  'white-pack', 'ホワイトパック', 'Whiteレアリティのカードのみが排出されるパック', NULL, NULL,
  200, 5, 1,
  'White Series', '1パック / 5枚入り', 'from-gray-100', 'to-white', 'bg-gray-200', '🤍', 'Whiteタイプ限定', 'PACK INFO', 'Pickup Feature', 7
);

-- ----------------------------------------------------------------------------
-- ガチャ排出レート（レアリティベースのweight設定）
-- ----------------------------------------------------------------------------
-- Weight設定の方針:
-- 通常: 100, やや出にくい: 50, レア: 25, 超レア: 10, 激レア: 5

-- スタンダードパック: 全カード（レアリティベースのweight）
INSERT INTO gacha_rates (pack_id, card_id, weight, is_pickup) VALUES
-- hot (card 1-3, 15-16)
('standard', 1, 100, 0),   -- 炎猫フレイム
('standard', 2, 100, 0),   -- 溶岩の守護獣
('standard', 3, 50, 0),    -- 紅蓮の戦士（やや出にくい）
('standard', 15, 25, 0),   -- 灼熱の龍（レア）
('standard', 16, 25, 0),   -- 朱雀の化身（レア）
-- cute (card 4-6, 17-18)
('standard', 4, 100, 0),   -- 虹色の妖精
('standard', 5, 100, 0),   -- 花園の精霊
('standard', 6, 50, 0),    -- ゆめかわユニコーン（やや出にくい）
('standard', 17, 100, 0),  -- シャボン玉の踊り子
('standard', 18, 50, 0),   -- プリンセスの午後（やや出にくい）
-- cool (card 7-9, 19-20)
('standard', 7, 50, 0),    -- 氷結の騎士（やや出にくい）
('standard', 8, 100, 0),   -- サイバー忍者
('standard', 9, 100, 0),   -- 銀狼の遠吠え
('standard', 19, 25, 0),   -- メカニカル・ドラゴン（レア）
('standard', 20, 100, 0),  -- ネオン街の狩人
-- dark (card 10-11, 21-22)
('standard', 10, 10, 0),   -- 深淵の魔王（超レア）
('standard', 11, 25, 0),   -- 闇夜の吸血鬼（レア）
('standard', 21, 25, 0),   -- 死神の鎌（レア）
('standard', 22, 10, 0),   -- 堕天使ルシファー（超レア）
-- white (card 12-14, 23-25)
('standard', 12, 25, 0),   -- 聖光の天使（レア）
('standard', 13, 50, 0),   -- 純白のユニコーン（やや出にくい）
('standard', 14, 10, 0),   -- 光の精霊王（超レア）
('standard', 23, 50, 0),   -- 白虎の化身（やや出にくい）
('standard', 24, 50, 0),   -- 満月の祭司（やや出にくい）
('standard', 25, 5, 0);    -- 神聖なる龍（激レア）

-- プレミアムパック: 全カード（レア出やすい設定）
INSERT INTO gacha_rates (pack_id, card_id, weight, is_pickup) VALUES
-- hot
('premium', 1, 100, 0),
('premium', 2, 100, 0),
('premium', 3, 100, 0),
('premium', 15, 50, 0),   -- 灼熱の龍（出やすく）
('premium', 16, 50, 0),   -- 朱雀の化身（出やすく）
-- cute
('premium', 4, 100, 0),
('premium', 5, 100, 0),
('premium', 6, 100, 0),
('premium', 17, 100, 0),
('premium', 18, 100, 0),
-- cool
('premium', 7, 100, 0),
('premium', 8, 100, 0),
('premium', 9, 100, 0),
('premium', 19, 50, 0),   -- メカニカル・ドラゴン（出やすく）
('premium', 20, 100, 0),
-- dark
('premium', 10, 25, 0),   -- 深淵の魔王（出やすく）
('premium', 11, 50, 0),
('premium', 21, 50, 0),
('premium', 22, 25, 0),   -- 堕天使ルシファー（出やすく）
-- white
('premium', 12, 50, 0),
('premium', 13, 100, 0),
('premium', 14, 25, 0),   -- 光の精霊王（出やすく）
('premium', 23, 100, 0),
('premium', 24, 100, 0),
('premium', 25, 10, 0);   -- 神聖なる龍（出やすく）

-- Hotパック: Hotカードのみ
INSERT INTO gacha_rates (pack_id, card_id, weight, is_pickup) VALUES
('hot-pack', 1, 100, 0),   -- 炎猫フレイム
('hot-pack', 2, 100, 0),   -- 溶岩の守護獣
('hot-pack', 3, 50, 0),    -- 紅蓮の戦士（やや出にくい）
('hot-pack', 15, 25, 0),   -- 灼熱の龍（レア）
('hot-pack', 16, 25, 0);   -- 朱雀の化身（レア）

-- Cuteパック: Cuteカードのみ
INSERT INTO gacha_rates (pack_id, card_id, weight, is_pickup) VALUES
('cute-pack', 4, 100, 0),   -- 虹色の妖精
('cute-pack', 5, 100, 0),   -- 花園の精霊
('cute-pack', 6, 50, 0),    -- ゆめかわユニコーン（やや出にくい）
('cute-pack', 17, 100, 0),  -- シャボン玉の踊り子
('cute-pack', 18, 50, 0);   -- プリンセスの午後（やや出にくい）

-- Coolパック: Coolカードのみ
INSERT INTO gacha_rates (pack_id, card_id, weight, is_pickup) VALUES
('cool-pack', 7, 50, 0),    -- 氷結の騎士（やや出にくい）
('cool-pack', 8, 100, 0),   -- サイバー忍者
('cool-pack', 9, 100, 0),   -- 銀狼の遠吠え
('cool-pack', 19, 25, 0),   -- メカニカル・ドラゴン（レア）
('cool-pack', 20, 100, 0);  -- ネオン街の狩人

-- Darkパック: Darkカードのみ
INSERT INTO gacha_rates (pack_id, card_id, weight, is_pickup) VALUES
('dark-pack', 10, 25, 0),   -- 深淵の魔王（レア）
('dark-pack', 11, 50, 0),   -- 闇夜の吸血鬼（やや出にくい）
('dark-pack', 21, 50, 0),   -- 死神の鎌（やや出にくい）
('dark-pack', 22, 25, 0);   -- 堕天使ルシファー（レア）

-- Whiteパック: Whiteカードのみ
INSERT INTO gacha_rates (pack_id, card_id, weight, is_pickup) VALUES
('white-pack', 12, 50, 0),   -- 聖光の天使（やや出にくい）
('white-pack', 13, 100, 0),  -- 純白のユニコーン
('white-pack', 14, 25, 0),   -- 光の精霊王（レア）
('white-pack', 23, 100, 0),  -- 白虎の化身
('white-pack', 24, 100, 0),  -- 満月の祭司
('white-pack', 25, 10, 0);   -- 神聖なる龍（超レア）

-- ----------------------------------------------------------------------------
-- ピックアップカード設定（注目カード）
-- ----------------------------------------------------------------------------
-- 各パックから1-2枚をピックアップカードに設定

-- スタンダードパック: 炎猫フレイム、聖光の天使をピックアップ
UPDATE gacha_rates SET is_pickup = 1 WHERE pack_id = 'standard' AND card_id IN (1, 12);

-- プレミアムパック: 灼熱の龍、深淵の魔王、純白のユニコーンをピックアップ
UPDATE gacha_rates SET is_pickup = 1 WHERE pack_id = 'premium' AND card_id IN (15, 10, 13);

-- Hotパック: 灼熱の龍、朱雀の化身をピックアップ
UPDATE gacha_rates SET is_pickup = 1 WHERE pack_id = 'hot-pack' AND card_id IN (15, 16);

-- Cuteパック: ゆめかわユニコーン、プリンセスの午後をピックアップ
UPDATE gacha_rates SET is_pickup = 1 WHERE pack_id = 'cute-pack' AND card_id IN (6, 18);

-- Coolパック: 氷結の騎士、メカニカル・ドラゴンをピックアップ
UPDATE gacha_rates SET is_pickup = 1 WHERE pack_id = 'cool-pack' AND card_id IN (7, 19);

-- Darkパック: 深淵の魔王、堕天使ルシファーをピックアップ
UPDATE gacha_rates SET is_pickup = 1 WHERE pack_id = 'dark-pack' AND card_id IN (10, 22);

-- Whiteパック: 神聖なる龍、光の精霊王をピックアップ
UPDATE gacha_rates SET is_pickup = 1 WHERE pack_id = 'white-pack' AND card_id IN (25, 14);

-- ----------------------------------------------------------------------------
-- サイト設定初期データ
-- ----------------------------------------------------------------------------
INSERT INTO site_settings (id, background_preset_id) VALUES ('site', 'purple-cosmos');

-- ----------------------------------------------------------------------------
-- News 初期データ
-- ----------------------------------------------------------------------------
-- ランディングページのカルーセル表示用
INSERT INTO news (id, title, subtitle, badge_text, pack_id, is_active, sort_order) VALUES
('news-void-master', '新パック「虚空の覇者」登場', '強力なカードを手に入れよう！', 'NEW ARRIVAL', 'premium', 1, 0),
('news-hot-pickup', '炎のピックアップ開催中', '灼熱の龍、朱雀の化身が確率UP！', 'PICK UP', 'hot-pack', 1, 1);

-- News-Cards 紐づけ（カルーセル表示順）
INSERT INTO news_cards (news_id, card_id, sort_order) VALUES
-- news-void-master: プレミアムパックの目玉カード
('news-void-master', 15, 0),  -- 灼熱の龍
('news-void-master', 10, 1),  -- 深淵の魔王
('news-void-master', 25, 2),  -- 神聖なる龍
-- news-hot-pickup: 炎パックのピックアップカード
('news-hot-pickup', 15, 0),   -- 灼熱の龍
('news-hot-pickup', 16, 1),   -- 朱雀の化身
('news-hot-pickup', 1, 2);    -- 炎猫フレイム
