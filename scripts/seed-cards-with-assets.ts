/**
 * カード画像アセット登録＋カードシードスクリプト
 *
 * 1. public/assets/cards/ の画像をアセットAPIでR2+DBに登録
 * 2. 登録したアセットIDでcardsテーブルのasset_idを更新
 *
 * Usage:
 *   bun run scripts/seed-cards-with-assets.ts
 *
 * Prerequisites:
 *   - backend dev server running (bun run dev:backend)
 *   - images dev server running (bun run dev:images)
 *   - D1 migrations applied (cards table exists)
 */

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const IMAGE_API_URL = process.env.IMAGE_API_URL || "http://localhost:8788";
const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:8787";
const CARDS_DIR = "./public/assets/cards";

interface AssetUploadResponse {
  success: boolean;
  data: {
    id: string;
    type: string;
    url: string;
    originalName: string;
    contentType: string;
    size: number;
    uploadedAt: string;
    isActive: boolean;
    hasWebP: boolean;
  };
}

interface CardImageInfo {
  filename: string;
  pack: number;
  series: number;
  number: number;
}

/**
 * ファイル名をパース: {pack}-{series}-{number}.{ext}
 */
function parseCardFilename(filename: string): CardImageInfo | null {
  const match = filename.match(/^(\d+)-(\d+)-(\d+)\.(png|jpg|jpeg|webp)$/i);
  if (!match) return null;

  return {
    filename,
    pack: Number.parseInt(match[1]),
    series: Number.parseInt(match[2]),
    number: Number.parseInt(match[3]),
  };
}

/**
 * 画像をアセットAPIでアップロード
 */
async function uploadAsset(filepath: string, filename: string): Promise<string | null> {
  const fileBuffer = await readFile(filepath);

  const ext = filename.split(".").pop()?.toLowerCase();
  const contentType =
    ext === "jpg" || ext === "jpeg"
      ? "image/jpeg"
      : ext === "webp"
        ? "image/webp"
        : "image/png";

  const blob = new Blob([fileBuffer], { type: contentType });

  const formData = new FormData();
  formData.append("file", blob, filename);
  formData.append("type", "card");

  try {
    const response = await fetch(`${IMAGE_API_URL}/api/assets`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      console.error(`  ❌ Upload failed: ${response.status} ${await response.text()}`);
      return null;
    }

    const data = (await response.json()) as AssetUploadResponse;
    return data.data.id;
  } catch (error) {
    console.error(`  ❌ Upload error:`, error);
    return null;
  }
}

/**
 * カードデータ定義（画像と1:1対応）
 * ファイル名順（pack-series-number）でソート後、ID順にマッピング
 * 41枚の画像に対応
 */
function getCardDefinitions(): Array<{
  name: string;
  type: string;
  holoType: string;
  textStyle: string;
  description: string;
  iconName: string;
  rarity: "hot" | "cute" | "cool" | "dark" | "white";
}> {
  return [
    // === Pack 1 ===
    // Pack 1 Series 1 (1-1-1, 1-1-2, 1-1-3) - hot
    { name: "炎猫フレイム", type: "Style: Phoenix, Anim: Blaze", holoType: "phoenix", textStyle: "fire", description: "燃え盛る炎を纏った猫", iconName: "Flame", rarity: "hot" },
    { name: "溶岩の守護獣", type: "Style: Magma, Anim: Flow", holoType: "magma", textStyle: "fire", description: "溶岩を操る古代の守護者", iconName: "Mountain", rarity: "hot" },
    { name: "紅蓮の戦士", type: "Style: Crimson, Anim: Strike", holoType: "animated-blaze", textStyle: "fire", description: "紅蓮の炎で敵を焼き尽くす戦士", iconName: "Swords", rarity: "hot" },

    // Pack 1 Series 2 (1-2-1, 1-2-2, 1-2-3) - cute
    { name: "虹色の妖精", type: "Style: Rainbow, Anim: Flutter", holoType: "rainbow", textStyle: "holo", description: "虹の架け橋を渡る小さな妖精", iconName: "Rainbow", rarity: "cute" },
    { name: "花園の精霊", type: "Style: Garden, Anim: Bloom", holoType: "hearts", textStyle: "bubblegum", description: "花々に囲まれた可愛い精霊", iconName: "Flower2", rarity: "cute" },
    { name: "ゆめかわユニコーン", type: "Style: Dream, Anim: Gallop", holoType: "candy-swirl", textStyle: "cotton-candy", description: "パステルカラーの夢かわユニコーン", iconName: "Sparkles", rarity: "cute" },

    // Pack 1 Series 3 (1-3-1, 1-3-2) - cool
    { name: "氷結の騎士", type: "Style: Frost, Anim: Freeze", holoType: "frozen", textStyle: "ice", description: "氷の剣を振るう冷徹な騎士", iconName: "Sword", rarity: "cool" },
    { name: "サイバー忍者", type: "Style: Cyber, Anim: Dash", holoType: "neon-grid", textStyle: "cyberpunk", description: "電脳世界を駆ける忍者", iconName: "Zap", rarity: "cool" },

    // Pack 1 Series 4 (1-4-1, 1-4-2) - dark
    { name: "深淵の魔王", type: "Style: Abyss, Anim: Emerge", holoType: "abyssal", textStyle: "void-script", description: "深淵から現れた魔界の王", iconName: "Skull", rarity: "dark" },
    { name: "闇夜の吸血鬼", type: "Style: Vampire, Anim: Bite", holoType: "shadow-warp", textStyle: "shadow-whispers", description: "闇夜に潜む不死の吸血鬼", iconName: "Moon", rarity: "dark" },

    // === Pack 2 ===
    // Pack 2 Series 1 (2-1-1, 2-1-2, 2-1-3) - white
    { name: "聖光の天使", type: "Style: Holy, Anim: Descend", holoType: "basic", textStyle: "gold", description: "聖なる光を纏った天使", iconName: "Sparkles", rarity: "white" },
    { name: "純白のユニコーン", type: "Style: Pure, Anim: Gallop", holoType: "rainbow", textStyle: "holo", description: "純粋な心を持つ者だけが見えるユニコーン", iconName: "Sparkles", rarity: "white" },
    { name: "銀狼の遠吠え", type: "Style: Silver, Anim: Howl", holoType: "silver", textStyle: "steel", description: "月夜に吠える銀色の狼", iconName: "Moon", rarity: "white" },

    // Pack 2 Series 2 (2-2-1, 2-2-2) - hot
    { name: "灼熱の龍", type: "Style: Inferno, Anim: Roar", holoType: "inferno", textStyle: "plasma", description: "灼熱の息を吐く伝説の龍", iconName: "Flame", rarity: "hot" },
    { name: "朱雀の化身", type: "Style: Vermilion, Anim: Soar", holoType: "phoenix", textStyle: "gold", description: "四神の一柱、朱雀の化身", iconName: "Bird", rarity: "hot" },

    // Pack 2 Series 3 (2-3-1, 2-3-2) - cute
    { name: "シャボン玉の踊り子", type: "Style: Bubble, Anim: Float", holoType: "bubbles", textStyle: "holo", description: "シャボン玉と踊る少女", iconName: "Circle", rarity: "cute" },
    { name: "プリンセスの午後", type: "Style: Royal, Anim: Wave", holoType: "glitter", textStyle: "bubblegum", description: "お茶会を楽しむ小さなプリンセス", iconName: "Crown", rarity: "cute" },

    // Pack 2 Series 4 (2-4-1, 2-4-2) - cool
    { name: "メカニカル・ドラゴン", type: "Style: Mech, Anim: Activate", holoType: "carbon", textStyle: "cyberpunk", description: "機械仕掛けの龍", iconName: "Cog", rarity: "cool" },
    { name: "ネオン街の狩人", type: "Style: Neon, Anim: Hunt", holoType: "neon-grid", textStyle: "neon", description: "ネオンの街を徘徊する狩人", iconName: "Target", rarity: "cool" },

    // === Pack 3 ===
    // Pack 3 Series 1 (3-1-1, 3-1-2, 3-1-3) - dark
    { name: "死神の鎌", type: "Style: Reaper, Anim: Swing", holoType: "eclipsed", textStyle: "void-script", description: "魂を刈り取る死神", iconName: "Skull", rarity: "dark" },
    { name: "堕天使ルシファー", type: "Style: Fallen, Anim: Descend", holoType: "abyssal", textStyle: "void-script", description: "天から堕ちた美しき天使", iconName: "Feather", rarity: "dark" },
    { name: "冥界の番犬", type: "Style: Underworld, Anim: Guard", holoType: "corrupted", textStyle: "shadow-whispers", description: "冥界の門を守る三つ首の犬", iconName: "Dog", rarity: "dark" },

    // Pack 3 Series 2 (3-2-1, 3-2-2) - white
    { name: "白虎の化身", type: "Style: Byakko, Anim: Roar", holoType: "silver", textStyle: "steel", description: "四神の一柱、白虎の化身", iconName: "Cat", rarity: "white" },
    { name: "満月の祭司", type: "Style: Moon, Anim: Chant", holoType: "silver", textStyle: "holo", description: "満月の力を借りる祭司", iconName: "Moon", rarity: "white" },

    // Pack 3 Series 3 (3-3-1, 3-3-2, 3-3-3) - hot
    { name: "業火の魔術師", type: "Style: Hellfire, Anim: Cast", holoType: "hellfire", textStyle: "fire", description: "業火を操る闇の魔術師", iconName: "Wand2", rarity: "hot" },
    { name: "火山の巨人", type: "Style: Volcanic, Anim: Erupt", holoType: "magma", textStyle: "plasma", description: "火山から生まれた巨人", iconName: "Mountain", rarity: "hot" },
    { name: "炎帝の剣", type: "Style: Emperor, Anim: Slash", holoType: "blaze", textStyle: "gold", description: "炎帝が振るう伝説の剣", iconName: "Sword", rarity: "hot" },

    // === Pack 4 ===
    // Pack 4 Series 1 (4-1-1, 4-1-2) - cute
    { name: "星空のペガサス", type: "Style: Starlight, Anim: Fly", holoType: "sparkle", textStyle: "holo", description: "星空を駆けるペガサス", iconName: "Star", rarity: "cute" },
    { name: "お花畑のうさぎ", type: "Style: Flower, Anim: Hop", holoType: "hearts", textStyle: "cotton-candy", description: "お花畑で遊ぶうさぎ", iconName: "Rabbit", rarity: "cute" },

    // Pack 4 Series 2 (4-2-1, 4-2-2) - cool
    { name: "量子コンピュータ", type: "Style: Quantum, Anim: Process", holoType: "circuit", textStyle: "neon", description: "量子の力を持つマシン", iconName: "Cpu", rarity: "cool" },
    { name: "タイムトラベラー", type: "Style: Time, Anim: Warp", holoType: "animated-warp", textStyle: "cyberpunk", description: "時空を超える旅人", iconName: "Clock", rarity: "cool" },

    // Pack 4 Series 3 (4-3-1, 4-3-2) - dark
    { name: "闇の召喚師", type: "Style: Dark, Anim: Summon", holoType: "dark-matter", textStyle: "void-script", description: "闇の生物を召喚する者", iconName: "Ghost", rarity: "dark" },
    { name: "呪いの人形", type: "Style: Curse, Anim: Haunt", holoType: "shadow-warp", textStyle: "shadow-whispers", description: "呪いが宿った人形", iconName: "Ghost", rarity: "dark" },

    // === Pack 5 ===
    // Pack 5 Series 1 (5-1-1, 5-1-2) - white
    { name: "神聖なる龍", type: "Style: Divine, Anim: Ascend", holoType: "gold", textStyle: "gold", description: "神聖なる力を持つ白い龍", iconName: "Star", rarity: "white" },
    { name: "光の精霊王", type: "Style: Light, Anim: Radiate", holoType: "crystal", textStyle: "neon", description: "光の力を司る精霊の王", iconName: "Sun", rarity: "white" },

    // Pack 5 Series 2 (5-2-1, 5-2-2, 5-2-3) - hot
    { name: "太陽の戦士", type: "Style: Solar, Anim: Blaze", holoType: "plasmatic", textStyle: "fire", description: "太陽の力を宿した戦士", iconName: "Sun", rarity: "hot" },
    { name: "不死鳥の卵", type: "Style: Phoenix, Anim: Hatch", holoType: "ember", textStyle: "gold", description: "伝説の不死鳥の卵", iconName: "Egg", rarity: "hot" },
    { name: "炎の精霊", type: "Style: Fire, Anim: Dance", holoType: "phoenix", textStyle: "plasma", description: "炎と共に踊る精霊", iconName: "Flame", rarity: "hot" },

    // Pack 5 Series 3 (5-3-1, 5-3-2, 5-3-3) - cute
    { name: "キャンディの妖精", type: "Style: Candy, Anim: Sprinkle", holoType: "sparkle-dust", textStyle: "bubblegum", description: "キャンディを振りまく妖精", iconName: "Candy", rarity: "cute" },
    { name: "月のうさぎ", type: "Style: Lunar, Anim: Jump", holoType: "glitter", textStyle: "cotton-candy", description: "月に住むうさぎ", iconName: "Rabbit", rarity: "cute" },
    { name: "虹のスライム", type: "Style: Rainbow, Anim: Bounce", holoType: "rainbow", textStyle: "holo", description: "虹色に輝くスライム", iconName: "Droplet", rarity: "cute" },
  ];
}

async function main() {
  console.log("=== カード画像アセット登録＋シード ===\n");
  console.log(`Image API: ${IMAGE_API_URL}`);
  console.log(`Backend API: ${BACKEND_API_URL}`);
  console.log(`Cards Dir: ${CARDS_DIR}\n`);

  // 1. 画像ファイル一覧を取得してソート
  const files = await readdir(CARDS_DIR);
  const cardImages: CardImageInfo[] = [];

  for (const file of files) {
    const info = parseCardFilename(file);
    if (info) {
      cardImages.push(info);
    }
  }

  // pack-series-number順でソート
  cardImages.sort((a, b) => {
    if (a.pack !== b.pack) return a.pack - b.pack;
    if (a.series !== b.series) return a.series - b.series;
    return a.number - b.number;
  });

  console.log(`Found ${cardImages.length} card images\n`);

  // 2. カード定義を取得
  const cardDefs = getCardDefinitions();

  if (cardImages.length !== cardDefs.length) {
    console.warn(`⚠️  Warning: ${cardImages.length} images but ${cardDefs.length} card definitions`);
    console.warn(`   Using min(${Math.min(cardImages.length, cardDefs.length)}) cards\n`);
  }

  const cardCount = Math.min(cardImages.length, cardDefs.length);

  // 3. 画像をアップロードしてアセットIDを取得
  console.log("Uploading images as assets...\n");

  const results: Array<{
    cardId: number;
    assetId: string;
    filename: string;
    cardDef: (typeof cardDefs)[0];
  }> = [];

  for (let i = 0; i < cardCount; i++) {
    const image = cardImages[i];
    const cardDef = cardDefs[i];
    const cardId = i + 1;

    const filepath = join(CARDS_DIR, image.filename);
    console.log(`  [${cardId}/${cardCount}] ${image.filename} → ${cardDef.name}`);

    const assetId = await uploadAsset(filepath, image.filename);

    if (assetId) {
      console.log(`      ✅ Asset ID: ${assetId}`);
      results.push({ cardId, assetId, filename: image.filename, cardDef });
    } else {
      console.log(`      ❌ Failed to upload`);
    }
  }

  console.log(`\n=== Upload Summary ===`);
  console.log(`Success: ${results.length}`);
  console.log(`Failed: ${cardCount - results.length}`);
  console.log(`Total: ${cardCount}\n`);

  if (results.length === 0) {
    console.error("No assets uploaded. Exiting.");
    process.exit(1);
  }

  // 4. SQL出力（手動実行用）
  console.log("=== SQL for Seeding ===\n");

  console.log("-- Delete existing cards and insert new ones");
  console.log("DELETE FROM gacha_rates;");
  console.log("DELETE FROM cards;\n");

  console.log("-- Insert cards with asset_id");
  for (const r of results) {
    const def = r.cardDef;
    console.log(
      `INSERT INTO cards (id, name, type, holo_type, text_style, asset_id, description, icon_name, rarity) VALUES (${r.cardId}, '${def.name}', '${def.type}', '${def.holoType}', '${def.textStyle}', '${r.assetId}', '${def.description}', '${def.iconName}', '${def.rarity}');`
    );
  }

  console.log("\n-- Insert gacha rates for standard pack");
  for (const r of results) {
    console.log(`INSERT INTO gacha_rates (pack_id, card_id, weight, is_pickup) VALUES ('standard', ${r.cardId}, 100, 0);`);
  }

  // 5. SQLファイルに保存
  const sqlPath = "./scripts/update-cards-assets.sql";
  const sqlContent = [
    "-- Generated by seed-cards-with-assets.ts",
    "-- Run: bunx wrangler d1 execute trading-cards --local --file=./scripts/update-cards-assets.sql",
    "",
    "-- Delete existing cards and gacha_rates (keep gacha_packs)",
    "DELETE FROM gacha_rates;",
    "DELETE FROM cards;",
    "",
    "-- Insert cards with asset_id",
    ...results.map(r => {
      const def = r.cardDef;
      return `INSERT INTO cards (id, name, type, holo_type, text_style, asset_id, description, icon_name, rarity) VALUES (${r.cardId}, '${def.name}', '${def.type}', '${def.holoType}', '${def.textStyle}', '${r.assetId}', '${def.description}', '${def.iconName}', '${def.rarity}');`;
    }),
    "",
    "-- Re-insert gacha rates for all packs",
    "INSERT INTO gacha_rates (pack_id, card_id, weight, is_pickup) SELECT 'standard', id, 100, 0 FROM cards;",
    "INSERT INTO gacha_rates (pack_id, card_id, weight, is_pickup) SELECT 'premium', id, 100, 0 FROM cards;",
    "INSERT INTO gacha_rates (pack_id, card_id, weight, is_pickup) SELECT 'hot-pack', id, 100, 0 FROM cards WHERE rarity = 'hot';",
    "INSERT INTO gacha_rates (pack_id, card_id, weight, is_pickup) SELECT 'cute-pack', id, 100, 0 FROM cards WHERE rarity = 'cute';",
    "INSERT INTO gacha_rates (pack_id, card_id, weight, is_pickup) SELECT 'cool-pack', id, 100, 0 FROM cards WHERE rarity = 'cool';",
    "INSERT INTO gacha_rates (pack_id, card_id, weight, is_pickup) SELECT 'dark-pack', id, 100, 0 FROM cards WHERE rarity = 'dark';",
    "INSERT INTO gacha_rates (pack_id, card_id, weight, is_pickup) SELECT 'white-pack', id, 100, 0 FROM cards WHERE rarity = 'white';",
    "",
  ].join("\n");

  await Bun.write(sqlPath, sqlContent);
  console.log(`\n=== SQL file saved to ${sqlPath} ===\n`);
  console.log("To apply:");
  console.log("  bunx wrangler d1 execute trading-cards --local --file=./scripts/update-cards-assets.sql\n");

  // 6. JSON出力（プログラムで使う場合用）
  console.log("=== JSON Output ===\n");
  console.log(JSON.stringify(results.map(r => ({
    cardId: r.cardId,
    assetId: r.assetId,
    name: r.cardDef.name,
    rarity: r.cardDef.rarity,
  })), null, 2));
}

main().catch((error) => {
  console.error("Script failed:", error);
  process.exit(1);
});
