-- Seed: 既存カードデータのD1移行
-- 70枚のカードデータを挿入

INSERT INTO cards (id, name, type, holo_type, text_style, image_url, description, icon_name, rarity) VALUES
-- Hot (6 cards)
(1, 'Magma Golem', 'Style: Magma', 'magma', 'fire', '/assets/1-1-1_Gemini_Generated_Image_mucfs2mucfs2mucf.png', 'Molten core with shifting lava flows.', 'Flame', 'hot'),
(2, 'Blaze Knight', 'Style: Blaze', 'blaze', 'magma-text', '/assets/1-1-2_Gemini_Generated_Image_n0ze78n0ze78n0ze.png', 'Forged in the heart of a raging inferno.', 'Flame', 'hot'),
(3, 'Ember Spirit', 'Style: Ember', 'ember', 'gold', '/assets/1-1-3_Gemini_Generated_Image_3sdvmb3sdvmb3sdv.png', 'Glowing remnants of a dying star.', 'ThermometerSun', 'hot'),
(4, 'Phoenix Rising', 'Style: Phoenix', 'phoenix', 'fire', '/assets/1-1-1_Gemini_Generated_Image_mucfs2mucfs2mucf.png', 'Reborn from ashes in a burst of light.', 'Feather', 'hot'),
(5, 'Inferno Dragon', 'Style: Inferno', 'inferno', 'magma-text', '/assets/1-1-2_Gemini_Generated_Image_n0ze78n0ze78n0ze.png', 'Born from the heart of a volcano.', 'Flame', 'hot'),
(6, 'Solar Flare', 'Style: Plasmatic', 'plasmatic', 'magma-text', '/assets/1-1-3_Gemini_Generated_Image_3sdvmb3sdvmb3sdv.png', 'Unstable energy reacting to touch.', 'Sun', 'hot'),

-- Cute (5 cards)
(7, 'Lovely Heart', 'Style: Hearts', 'hearts', 'cotton-candy', '/assets/1-1-1_Gemini_Generated_Image_mucfs2mucfs2mucf.png', 'A gentle shower of pastel hearts.', 'Heart', 'cute'),
(8, 'Bubble Dream', 'Style: Bubbles', 'bubbles', 'bubblegum', '/assets/1-1-2_Gemini_Generated_Image_n0ze78n0ze78n0ze.png', 'Floating in a soft, soapy dreamland.', 'Cloud', 'cute'),
(9, 'Fairy Dust', 'Style: Sparkle Dust', 'sparkle-dust', 'holo', '/assets/1-1-3_Gemini_Generated_Image_3sdvmb3sdvmb3sdv.png', 'Magical glittering particles.', 'Sparkles', 'cute'),
(10, 'Sweet Swirl', 'Style: Candy Swirl', 'candy-swirl', 'cotton-candy', '/assets/1-1-1_Gemini_Generated_Image_mucfs2mucfs2mucf.png', 'A delicious spiral of sugary colors.', 'Gift', 'cute'),
(11, 'Star Valkyrie', 'Style: Sparkle', 'sparkle', 'holo', '/assets/1-1-2_Gemini_Generated_Image_n0ze78n0ze78n0ze.png', 'Glittering particles scattered across the surface.', 'Sparkles', 'cute'),

-- Cool (7 cards)
(12, 'Icebreaker', 'Style: Frozen', 'frozen', 'frostbite', '/assets/1-1-3_Gemini_Generated_Image_3sdvmb3sdvmb3sdv.png', 'Shattering obstacles with sub-zero precision.', 'Snowflake', 'cool'),
(13, 'Neon Drift', 'Style: Neon Grid', 'neon-grid', 'cyberpunk', '/assets/1-1-1_Gemini_Generated_Image_mucfs2mucfs2mucf.png', 'Racing through the digital cityscape.', 'Monitor', 'cool'),
(14, 'Stealth Operative', 'Style: Stealth', 'stealth', 'silver', '/assets/1-1-2_Gemini_Generated_Image_n0ze78n0ze78n0ze.png', 'Unseen, unheard, undetectable.', 'EyeOff', 'cool'),
(15, 'Cyber Dragon', 'Style: Diagonal', 'diagonal', 'gold', '/assets/1-1-3_Gemini_Generated_Image_3sdvmb3sdvmb3sdv.png', 'Classic diagonal rainbow reflection.', 'Zap', 'cool'),
(16, 'Circuit Breaker', 'Style: Circuit', 'circuit', 'neon', '/assets/1-1-1_Gemini_Generated_Image_mucfs2mucfs2mucf.png', 'Printed circuit board patterns.', 'Cpu', 'cool'),
(17, 'Digital Grid', 'Style: Wireframe', 'wireframe', 'glitch', '/assets/1-1-2_Gemini_Generated_Image_n0ze78n0ze78n0ze.png', 'Holographic grid lines from the matrix.', 'Zap', 'cool'),
(18, 'Code Breaker', 'Style: Matrix', 'matrix', 'matrix-text', '/assets/1-1-3_Gemini_Generated_Image_3sdvmb3sdvmb3sdv.png', 'Streaming data from the digital realm.', 'Binary', 'cool'),

-- Dark (6 cards)
(19, 'Abyss Walker', 'Style: Abyssal', 'abyssal', 'void-script', '/assets/1-1-1_Gemini_Generated_Image_mucfs2mucfs2mucf.png', 'Staring back from the deep dark.', 'Moon', 'dark'),
(20, 'Shadow Stalker', 'Style: Shadow Warp', 'shadow-warp', 'shadow-whispers', '/assets/1-1-2_Gemini_Generated_Image_n0ze78n0ze78n0ze.png', 'Distorting reality as it moves.', 'Slash', 'dark'),
(21, 'Eclipse Lord', 'Style: Eclipsed', 'eclipsed', 'shadow-whispers', '/assets/1-1-3_Gemini_Generated_Image_3sdvmb3sdvmb3sdv.png', 'Blocking out the suns last rays.', 'Eclipse', 'dark'),
(22, 'Data Corruption', 'Style: Corrupted', 'corrupted', 'void-script', '/assets/1-1-1_Gemini_Generated_Image_mucfs2mucfs2mucf.png', 'Fatal system error. Do not touch.', 'Bug', 'dark'),
(23, 'Void Core', 'Style: Dark Matter', 'dark-matter', 'deep-space', '/assets/1-1-2_Gemini_Generated_Image_n0ze78n0ze78n0ze.png', 'Harnessing the power of the cosmic abyss.', 'Orbit', 'dark'),
(24, 'Soul Burner', 'Style: Hellfire', 'hellfire', 'ice', '/assets/1-1-3_Gemini_Generated_Image_3sdvmb3sdvmb3sdv.png', 'Cold flames that consume the spirit.', 'Skull', 'dark'),

-- White (6 cards)
(25, 'Cosmic Voyager', 'Style: Cosmic', 'cosmic', 'ice', '/assets/1-1-1_Gemini_Generated_Image_mucfs2mucfs2mucf.png', 'Deep space nebula with glittering stars.', 'Globe', 'white'),
(26, 'Crystal Sage', 'Style: Crystal', 'crystal', 'plasma', '/assets/1-1-2_Gemini_Generated_Image_n0ze78n0ze78n0ze.png', 'Geometric faceted refractions.', 'Gem', 'white'),
(27, 'Prism Core', 'Style: Rainbow', 'rainbow', 'holo', '/assets/1-1-3_Gemini_Generated_Image_3sdvmb3sdvmb3sdv.png', 'Full spectrum gradients shifting smoothly.', 'Star', 'white'),
(28, 'Aurora Borealis', 'Style: Atmospheric', 'aurora', 'ice', '/assets/1-1-1_Gemini_Generated_Image_mucfs2mucfs2mucf.png', 'Natural light display in the polar sky.', 'Wind', 'white'),
(29, 'Galactic Spin', 'Anim: Galaxy', 'animated-galaxy', 'neon-pink', '/assets/1-1-2_Gemini_Generated_Image_n0ze78n0ze78n0ze.png', 'A spinning vortex of stars.', 'Infinity', 'white'),
(30, 'Shimmering Light', 'Anim: Shimmer', 'animated-shimmer', 'gold', '/assets/1-1-3_Gemini_Generated_Image_3sdvmb3sdvmb3sdv.png', 'Dancing reflections of light.', 'Sparkle', 'white'),

-- Basic / Classic
(31, 'Basic Holo', 'Style: Basic', 'basic', 'silver', '/assets/1-1-1_Gemini_Generated_Image_mucfs2mucfs2mucf.png', 'Classic holographic shine.', 'Square', 'white'),
(32, 'Vertical Beam', 'Style: Vertical', 'vertical', 'holo', '/assets/1-1-2_Gemini_Generated_Image_n0ze78n0ze78n0ze.png', 'Vertical rainbow stripes.', 'AlignVerticalJustifyCenter', 'white'),

-- Abstract / Texture
(33, 'Ghost Pattern', 'Style: Ghost', 'ghost', 'ghost-fade', '/assets/1-1-3_Gemini_Generated_Image_3sdvmb3sdvmb3sdv.png', 'Ethereal phantom patterns.', 'Ghost', 'white'),
(34, 'Checker Board', 'Style: Checker', 'checker', 'retro', '/assets/1-1-1_Gemini_Generated_Image_mucfs2mucfs2mucf.png', 'Checkered light pattern.', 'Grid3x3', 'white'),
(35, 'Cracked Glass', 'Style: Cracked', 'cracked', 'ice-shard', '/assets/1-1-2_Gemini_Generated_Image_n0ze78n0ze78n0ze.png', 'Shattered surface reflections.', 'ShieldAlert', 'cool'),
(36, 'Hex Pattern', 'Style: Hexagon', 'hexagon', 'blueprint-text', '/assets/1-1-3_Gemini_Generated_Image_3sdvmb3sdvmb3sdv.png', 'Honeycomb geometric design.', 'Hexagon', 'cool'),
(37, 'Oil Slick', 'Style: Oil', 'oil', 'liquid-chrome', '/assets/1-1-1_Gemini_Generated_Image_mucfs2mucfs2mucf.png', 'Iridescent oil surface effect.', 'Droplet', 'white'),

-- Metal / Material
(38, 'Golden Crown', 'Style: Gold', 'gold', 'gold', '/assets/1-1-2_Gemini_Generated_Image_n0ze78n0ze78n0ze.png', 'Luxurious gold metallic finish.', 'Crown', 'hot'),
(39, 'Silver Shield', 'Style: Silver', 'silver', 'silver', '/assets/1-1-3_Gemini_Generated_Image_3sdvmb3sdvmb3sdv.png', 'Polished silver reflection.', 'Shield', 'cool'),
(40, 'Brushed Metal', 'Style: Brushed', 'brushed', 'steel', '/assets/1-1-1_Gemini_Generated_Image_mucfs2mucfs2mucf.png', 'Brushed aluminum texture.', 'Wrench', 'cool'),
(41, 'Carbon Fiber', 'Style: Carbon', 'carbon', 'steel', '/assets/1-1-2_Gemini_Generated_Image_n0ze78n0ze78n0ze.png', 'High-tech carbon weave pattern.', 'Layers', 'cool'),

-- Special / Elements
(42, 'Dragon Scales', 'Style: Scales', 'scales', 'emerald', '/assets/1-1-3_Gemini_Generated_Image_3sdvmb3sdvmb3sdv.png', 'Overlapping reptilian scales.', 'Scale', 'white'),
(43, 'Glitter Bomb', 'Style: Glitter', 'glitter', 'cotton-candy', '/assets/1-1-1_Gemini_Generated_Image_mucfs2mucfs2mucf.png', 'Scattered sparkling particles.', 'Sparkles', 'cute'),
(44, 'Wave Motion', 'Style: Waves', 'waves', 'ice', '/assets/1-1-2_Gemini_Generated_Image_n0ze78n0ze78n0ze.png', 'Rippling water surface effect.', 'Waves', 'cool'),
(45, 'Nebula Cloud', 'Style: Nebula', 'nebula', 'deep-space', '/assets/1-1-3_Gemini_Generated_Image_3sdvmb3sdvmb3sdv.png', 'Cosmic gas and dust clouds.', 'Cloud', 'white'),
(46, 'Vortex Spin', 'Style: Vortex', 'vortex', 'plasma', '/assets/1-1-1_Gemini_Generated_Image_mucfs2mucfs2mucf.png', 'Spiraling energy vortex.', 'TornadoIcon', 'hot'),
(47, 'Laser Grid', 'Style: Laser', 'laser', 'neon', '/assets/1-1-2_Gemini_Generated_Image_n0ze78n0ze78n0ze.png', 'Precise laser beam patterns.', 'Zap', 'cool'),
(48, 'Sequin Dress', 'Style: Sequins', 'sequins', 'cotton-candy', '/assets/1-1-3_Gemini_Generated_Image_3sdvmb3sdvmb3sdv.png', 'Shimmering sequin texture.', 'Star', 'cute'),
(49, 'Marble Statue', 'Style: Marble', 'marble', 'silver', '/assets/1-1-1_Gemini_Generated_Image_mucfs2mucfs2mucf.png', 'Natural marble veining.', 'Columns', 'white'),

-- Complex / New Patterns
(50, 'Kaleidoscope', 'Style: Kaleidoscope', 'kaleidoscope', 'holo', '/assets/1-1-2_Gemini_Generated_Image_n0ze78n0ze78n0ze.png', 'Symmetrical mirrored patterns.', 'Aperture', 'white'),
(51, 'Damascus Blade', 'Style: Damascus', 'damascus', 'steel', '/assets/1-1-3_Gemini_Generated_Image_3sdvmb3sdvmb3sdv.png', 'Folded steel pattern.', 'Sword', 'cool'),
(52, 'Quantum Field', 'Style: Quantum', 'quantum', 'plasma', '/assets/1-1-1_Gemini_Generated_Image_mucfs2mucfs2mucf.png', 'Quantum probability waves.', 'Atom', 'white'),
(53, 'Bio Hazard', 'Style: Bio', 'bio', 'toxic', '/assets/1-1-2_Gemini_Generated_Image_n0ze78n0ze78n0ze.png', 'Organic cellular structures.', 'Biohazard', 'dark'),
(54, 'Hyperspeed', 'Style: Hyperspeed', 'hyperspeed', 'cyberpunk', '/assets/1-1-3_Gemini_Generated_Image_3sdvmb3sdvmb3sdv.png', 'Faster-than-light motion blur.', 'FastForward', 'cool'),

-- Advanced / Artistic
(55, 'Stained Glass', 'Style: Stained Glass', 'stained-glass', 'holo', '/assets/1-1-1_Gemini_Generated_Image_mucfs2mucfs2mucf.png', 'Cathedral window mosaic.', 'Church', 'white'),
(56, 'Caustics', 'Style: Caustics', 'caustics', 'ice', '/assets/1-1-2_Gemini_Generated_Image_n0ze78n0ze78n0ze.png', 'Light refraction through water.', 'Droplets', 'cool'),
(57, 'Ancient Runes', 'Style: Runes', 'runes', 'runic', '/assets/1-1-3_Gemini_Generated_Image_3sdvmb3sdvmb3sdv.png', 'Mystical engraved symbols.', 'ScrollText', 'white'),
(58, 'Blueprint', 'Style: Blueprint', 'blueprint', 'blueprint-text', '/assets/1-1-1_Gemini_Generated_Image_mucfs2mucfs2mucf.png', 'Technical schematic lines.', 'FileCode', 'cool'),
(59, 'Enchanted', 'Style: Enchanted', 'enchanted', 'holo', '/assets/1-1-2_Gemini_Generated_Image_n0ze78n0ze78n0ze.png', 'Magical aura and sparkles.', 'Wand', 'white'),

-- Complex / Ethereal
(60, 'Moire Pattern', 'Style: Moire', 'moire', 'glitch-pro', '/assets/1-1-3_Gemini_Generated_Image_3sdvmb3sdvmb3sdv.png', 'Interference pattern illusion.', 'CircleDashed', 'white'),
(61, 'Liquid Metal', 'Style: Liquid Metal', 'liquid-metal', 'liquid-chrome', '/assets/1-1-1_Gemini_Generated_Image_mucfs2mucfs2mucf.png', 'Flowing metallic surface.', 'Droplet', 'cool'),
(62, 'Cyber Glitch', 'Style: Cyber Glitch', 'cyber-glitch', 'glitch-pro', '/assets/1-1-2_Gemini_Generated_Image_n0ze78n0ze78n0ze.png', 'Digital distortion artifacts.', 'AlertTriangle', 'cool'),
(63, 'Nebula Storm', 'Style: Nebula Storm', 'nebula-storm', 'deep-space', '/assets/1-1-3_Gemini_Generated_Image_3sdvmb3sdvmb3sdv.png', 'Turbulent cosmic storm.', 'CloudLightning', 'dark'),
(64, 'Prismatic Shards', 'Style: Prismatic Shards', 'prismatic-shards', 'prism-shard', '/assets/1-1-1_Gemini_Generated_Image_mucfs2mucfs2mucf.png', 'Fragmented light crystals.', 'Gem', 'white'),
(65, 'Phantom Grid', 'Style: Phantom Grid', 'phantom-grid', 'ghost-fade', '/assets/1-1-2_Gemini_Generated_Image_n0ze78n0ze78n0ze.png', 'Invisible grid slowly revealing.', 'Grid', 'white'),

-- Animated / Dynamic
(66, 'Matrix Rain', 'Anim: Rain', 'animated-rain', 'matrix-text', '/assets/1-1-3_Gemini_Generated_Image_3sdvmb3sdvmb3sdv.png', 'Falling digital rain drops.', 'Binary', 'cool'),
(67, 'Scan Line', 'Anim: Scan', 'animated-scan', 'cyberpunk', '/assets/1-1-1_Gemini_Generated_Image_mucfs2mucfs2mucf.png', 'CRT screen scanning effect.', 'ScanLine', 'cool'),
(68, 'Warp Speed', 'Anim: Warp', 'animated-warp', 'plasma', '/assets/1-1-2_Gemini_Generated_Image_n0ze78n0ze78n0ze.png', 'Faster-than-light travel.', 'Rocket', 'cool'),
(69, 'Pulse Wave', 'Anim: Pulse', 'animated-pulse', 'neon-pink', '/assets/1-1-3_Gemini_Generated_Image_3sdvmb3sdvmb3sdv.png', 'Rhythmic energy pulsations.', 'Activity', 'hot'),

-- None
(70, 'Plain Card', 'Style: None', 'none', 'none', '/assets/1-1-1_Gemini_Generated_Image_mucfs2mucfs2mucf.png', 'No holographic effect.', 'Square', 'white');

-- デフォルトのガチャパックを作成
INSERT INTO gacha_packs (id, name, description, pack_image_url, cost, cards_per_pack, is_active) VALUES
('standard', 'Standard Pack', 'A standard pack containing 5 random cards.', NULL, 100, 5, 1),
('premium', 'Premium Pack', 'A premium pack with higher chance for rare cards.', NULL, 300, 5, 1);

-- デフォルトの排出テーブル（全カードを均等に）
INSERT INTO gacha_rates (pack_id, card_id, weight, is_pickup)
SELECT 'standard', id, 10, 0 FROM cards;

INSERT INTO gacha_rates (pack_id, card_id, weight, is_pickup)
SELECT 'premium', id,
  CASE
    WHEN rarity IN ('hot', 'dark') THEN 15
    ELSE 10
  END,
  0
FROM cards;
