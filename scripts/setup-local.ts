#!/usr/bin/env bun
/**
 * ローカル環境セットアップスクリプト
 *
 * D1マイグレーション適用 + 画像シード + カード紐付けを一括実行
 *
 * Usage:
 *   bun run setup:local
 *
 * Prerequisites:
 *   - bun install 実行済み
 *   - backend dev server running (bun run dev:backend)
 *   - images dev server running (bun run dev:images)
 *
 * 実行内容:
 *   1. APIサーバー起動確認
 *   2. D1マイグレーション適用
 *   3. 画像アセットをR2にアップロード
 *   4. カードとアセットの紐付けSQLをD1に適用
 */

import { spawnSync } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const IMAGE_API_URL = process.env.IMAGE_API_URL || "http://localhost:8788";
const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:8787";
const CARDS_DIR = "./public/assets/cards";
const PACKS_DIR = "./public/assets/packs";
const BACKEND_DIR = "./apps/backend";

interface AssetUploadResponse {
  success: boolean;
  data: {
    id: string;
    type: string;
    url: string;
    r2Key: string;
    originalName: string;
    contentType: string;
    size: number;
    uploadedAt: string;
    isActive: boolean;
    hasWebP: boolean;
  };
}

interface UploadResult {
  cardId: number;
  assetId: string;
  r2Key: string;
  originalName: string;
  contentType: string;
  size: number;
  cardDef: ReturnType<typeof getCardDefinitions>[0];
}

interface CardImageInfo {
  filename: string;
  pack: number;
  series: number;
  number: number;
}

// ========== ユーティリティ関数 ==========

function log(message: string, type: "info" | "success" | "error" | "warn" = "info") {
  const icons = {
    info: "ℹ️ ",
    success: "✅",
    error: "❌",
    warn: "⚠️ ",
  };
  console.log(`${icons[type]} ${message}`);
}

function header(title: string) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  ${title}`);
  console.log(`${"=".repeat(60)}\n`);
}

async function checkServer(url: string, name: string): Promise<boolean> {
  try {
    // 接続できればOK（404でも起動している）
    await fetch(url, { method: "GET" });
    return true;
  } catch {
    return false;
  }
}

// ========== カード定義 ==========

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
    // Pack 1 Series 1 - hot
    { name: "炎猫フレイム", type: "Style: Phoenix, Anim: Blaze", holoType: "phoenix", textStyle: "fire", description: "燃え盛る炎を纏った猫", iconName: "Flame", rarity: "hot" },
    { name: "溶岩の守護獣", type: "Style: Magma, Anim: Flow", holoType: "magma", textStyle: "fire", description: "溶岩を操る古代の守護者", iconName: "Mountain", rarity: "hot" },
    { name: "紅蓮の戦士", type: "Style: Crimson, Anim: Strike", holoType: "animated-blaze", textStyle: "fire", description: "紅蓮の炎で敵を焼き尽くす戦士", iconName: "Swords", rarity: "hot" },
    // Pack 1 Series 2 - cute
    { name: "虹色の妖精", type: "Style: Rainbow, Anim: Flutter", holoType: "rainbow", textStyle: "holo", description: "虹の架け橋を渡る小さな妖精", iconName: "Rainbow", rarity: "cute" },
    { name: "花園の精霊", type: "Style: Garden, Anim: Bloom", holoType: "hearts", textStyle: "bubblegum", description: "花々に囲まれた可愛い精霊", iconName: "Flower2", rarity: "cute" },
    { name: "ゆめかわユニコーン", type: "Style: Dream, Anim: Gallop", holoType: "candy-swirl", textStyle: "cotton-candy", description: "パステルカラーの夢かわユニコーン", iconName: "Sparkles", rarity: "cute" },
    // Pack 1 Series 3 - cool
    { name: "氷結の騎士", type: "Style: Frost, Anim: Freeze", holoType: "frozen", textStyle: "ice", description: "氷の剣を振るう冷徹な騎士", iconName: "Sword", rarity: "cool" },
    { name: "サイバー忍者", type: "Style: Cyber, Anim: Dash", holoType: "neon-grid", textStyle: "cyberpunk", description: "電脳世界を駆ける忍者", iconName: "Zap", rarity: "cool" },
    // Pack 1 Series 4 - dark
    { name: "深淵の魔王", type: "Style: Abyss, Anim: Emerge", holoType: "abyssal", textStyle: "void-script", description: "深淵から現れた魔界の王", iconName: "Skull", rarity: "dark" },
    { name: "闇夜の吸血鬼", type: "Style: Vampire, Anim: Bite", holoType: "shadow-warp", textStyle: "shadow-whispers", description: "闇夜に潜む不死の吸血鬼", iconName: "Moon", rarity: "dark" },
    // Pack 2 Series 1 - white
    { name: "聖光の天使", type: "Style: Holy, Anim: Descend", holoType: "basic", textStyle: "gold", description: "聖なる光を纏った天使", iconName: "Sparkles", rarity: "white" },
    { name: "純白のユニコーン", type: "Style: Pure, Anim: Gallop", holoType: "rainbow", textStyle: "holo", description: "純粋な心を持つ者だけが見えるユニコーン", iconName: "Sparkles", rarity: "white" },
    { name: "銀狼の遠吠え", type: "Style: Silver, Anim: Howl", holoType: "silver", textStyle: "steel", description: "月夜に吠える銀色の狼", iconName: "Moon", rarity: "white" },
    // Pack 2 Series 2 - hot
    { name: "灼熱の龍", type: "Style: Inferno, Anim: Roar", holoType: "inferno", textStyle: "plasma", description: "灼熱の息を吐く伝説の龍", iconName: "Flame", rarity: "hot" },
    { name: "朱雀の化身", type: "Style: Vermilion, Anim: Soar", holoType: "phoenix", textStyle: "gold", description: "四神の一柱、朱雀の化身", iconName: "Bird", rarity: "hot" },
    // Pack 2 Series 3 - cute
    { name: "シャボン玉の踊り子", type: "Style: Bubble, Anim: Float", holoType: "bubbles", textStyle: "holo", description: "シャボン玉と踊る少女", iconName: "Circle", rarity: "cute" },
    { name: "プリンセスの午後", type: "Style: Royal, Anim: Wave", holoType: "glitter", textStyle: "bubblegum", description: "お茶会を楽しむ小さなプリンセス", iconName: "Crown", rarity: "cute" },
    // Pack 2 Series 4 - cool
    { name: "メカニカル・ドラゴン", type: "Style: Mech, Anim: Activate", holoType: "carbon", textStyle: "cyberpunk", description: "機械仕掛けの龍", iconName: "Cog", rarity: "cool" },
    { name: "ネオン街の狩人", type: "Style: Neon, Anim: Hunt", holoType: "neon-grid", textStyle: "neon", description: "ネオンの街を徘徊する狩人", iconName: "Target", rarity: "cool" },
    // Pack 3 Series 1 - dark
    { name: "死神の鎌", type: "Style: Reaper, Anim: Swing", holoType: "eclipsed", textStyle: "void-script", description: "魂を刈り取る死神", iconName: "Skull", rarity: "dark" },
    { name: "堕天使ルシファー", type: "Style: Fallen, Anim: Descend", holoType: "abyssal", textStyle: "void-script", description: "天から堕ちた美しき天使", iconName: "Feather", rarity: "dark" },
    { name: "冥界の番犬", type: "Style: Underworld, Anim: Guard", holoType: "corrupted", textStyle: "shadow-whispers", description: "冥界の門を守る三つ首の犬", iconName: "Dog", rarity: "dark" },
    // Pack 3 Series 2 - white
    { name: "白虎の化身", type: "Style: Byakko, Anim: Roar", holoType: "silver", textStyle: "steel", description: "四神の一柱、白虎の化身", iconName: "Cat", rarity: "white" },
    { name: "満月の祭司", type: "Style: Moon, Anim: Chant", holoType: "silver", textStyle: "holo", description: "満月の力を借りる祭司", iconName: "Moon", rarity: "white" },
    // Pack 3 Series 3 - hot
    { name: "業火の魔術師", type: "Style: Hellfire, Anim: Cast", holoType: "hellfire", textStyle: "fire", description: "業火を操る闇の魔術師", iconName: "Wand2", rarity: "hot" },
    { name: "火山の巨人", type: "Style: Volcanic, Anim: Erupt", holoType: "magma", textStyle: "plasma", description: "火山から生まれた巨人", iconName: "Mountain", rarity: "hot" },
    { name: "炎帝の剣", type: "Style: Emperor, Anim: Slash", holoType: "blaze", textStyle: "gold", description: "炎帝が振るう伝説の剣", iconName: "Sword", rarity: "hot" },
    // Pack 4 Series 1 - cute
    { name: "星空のペガサス", type: "Style: Starlight, Anim: Fly", holoType: "sparkle", textStyle: "holo", description: "星空を駆けるペガサス", iconName: "Star", rarity: "cute" },
    { name: "お花畑のうさぎ", type: "Style: Flower, Anim: Hop", holoType: "hearts", textStyle: "cotton-candy", description: "お花畑で遊ぶうさぎ", iconName: "Rabbit", rarity: "cute" },
    // Pack 4 Series 2 - cool
    { name: "量子コンピュータ", type: "Style: Quantum, Anim: Process", holoType: "circuit", textStyle: "neon", description: "量子の力を持つマシン", iconName: "Cpu", rarity: "cool" },
    { name: "タイムトラベラー", type: "Style: Time, Anim: Warp", holoType: "animated-warp", textStyle: "cyberpunk", description: "時空を超える旅人", iconName: "Clock", rarity: "cool" },
    // Pack 4 Series 3 - dark
    { name: "闇の召喚師", type: "Style: Dark, Anim: Summon", holoType: "dark-matter", textStyle: "void-script", description: "闇の生物を召喚する者", iconName: "Ghost", rarity: "dark" },
    { name: "呪いの人形", type: "Style: Curse, Anim: Haunt", holoType: "shadow-warp", textStyle: "shadow-whispers", description: "呪いが宿った人形", iconName: "Ghost", rarity: "dark" },
    // Pack 5 Series 1 - white
    { name: "神聖なる龍", type: "Style: Divine, Anim: Ascend", holoType: "gold", textStyle: "gold", description: "神聖なる力を持つ白い龍", iconName: "Star", rarity: "white" },
    { name: "光の精霊王", type: "Style: Light, Anim: Radiate", holoType: "crystal", textStyle: "neon", description: "光の力を司る精霊の王", iconName: "Sun", rarity: "white" },
    // Pack 5 Series 2 - hot
    { name: "太陽の戦士", type: "Style: Solar, Anim: Blaze", holoType: "plasmatic", textStyle: "fire", description: "太陽の力を宿した戦士", iconName: "Sun", rarity: "hot" },
    { name: "不死鳥の卵", type: "Style: Phoenix, Anim: Hatch", holoType: "ember", textStyle: "gold", description: "伝説の不死鳥の卵", iconName: "Egg", rarity: "hot" },
    { name: "炎の精霊", type: "Style: Fire, Anim: Dance", holoType: "phoenix", textStyle: "plasma", description: "炎と共に踊る精霊", iconName: "Flame", rarity: "hot" },
    // Pack 5 Series 3 - cute
    { name: "キャンディの妖精", type: "Style: Candy, Anim: Sprinkle", holoType: "sparkle-dust", textStyle: "bubblegum", description: "キャンディを振りまく妖精", iconName: "Candy", rarity: "cute" },
    { name: "月のうさぎ", type: "Style: Lunar, Anim: Jump", holoType: "glitter", textStyle: "cotton-candy", description: "月に住むうさぎ", iconName: "Rabbit", rarity: "cute" },
    { name: "虹のスライム", type: "Style: Rainbow, Anim: Bounce", holoType: "rainbow", textStyle: "holo", description: "虹色に輝くスライム", iconName: "Droplet", rarity: "cute" },
  ];
}

// ========== 画像処理 ==========

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

interface AssetUploadResult {
  id: string;
  r2Key: string;
  originalName: string;
  contentType: string;
  size: number;
}

async function uploadAsset(filepath: string, filename: string): Promise<AssetUploadResult | null> {
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
      return null;
    }

    const data = (await response.json()) as AssetUploadResponse;
    // r2Keyはレスポンスに含まれないため、画像APIの命名規則から構築
    // 形式: "assets/{type}/{id}"
    const r2Key = `assets/card/${data.data.id}`;

    return {
      id: data.data.id,
      r2Key,
      originalName: data.data.originalName,
      contentType: data.data.contentType,
      size: data.data.size,
    };
  } catch {
    return null;
  }
}

// ========== パック画像処理 ==========

interface PackUploadResult {
  packNumber: number;
  packSetId: string;
  frontAssetId: string;
  backAssetId: string;
}

/**
 * パック画像をアップロード（表面・裏面をセットで）
 * @param packNumber パック番号（ディレクトリ名）
 * @returns アップロード結果（packSetId、frontAssetId、backAssetId）
 */
async function uploadPackImages(packNumber: number): Promise<PackUploadResult | null> {
  const packDir = join(PACKS_DIR, String(packNumber));

  // UUID生成（packSetIdとして使用）
  const packSetId = crypto.randomUUID();

  // 表面画像をアップロード
  const frontPath = join(packDir, "pack.png");
  const frontBuffer = await readFile(frontPath);
  const frontBlob = new Blob([frontBuffer], { type: "image/png" });
  const frontFormData = new FormData();
  frontFormData.append("file", frontBlob, `pack-${packNumber}-front.png`);
  frontFormData.append("type", "pack-front");
  frontFormData.append("packSetId", packSetId);

  let frontAssetId: string | null = null;
  try {
    const frontResponse = await fetch(`${IMAGE_API_URL}/api/assets`, {
      method: "POST",
      body: frontFormData,
    });
    if (frontResponse.ok) {
      const data = (await frontResponse.json()) as AssetUploadResponse;
      frontAssetId = data.data.id;
    }
  } catch {
    return null;
  }

  if (!frontAssetId) return null;

  // 裏面画像をアップロード
  const backPath = join(packDir, "pack-back.png");
  const backBuffer = await readFile(backPath);
  const backBlob = new Blob([backBuffer], { type: "image/png" });
  const backFormData = new FormData();
  backFormData.append("file", backBlob, `pack-${packNumber}-back.png`);
  backFormData.append("type", "pack-back");
  backFormData.append("packSetId", packSetId);

  let backAssetId: string | null = null;
  try {
    const backResponse = await fetch(`${IMAGE_API_URL}/api/assets`, {
      method: "POST",
      body: backFormData,
    });
    if (backResponse.ok) {
      const data = (await backResponse.json()) as AssetUploadResponse;
      backAssetId = data.data.id;
    }
  } catch {
    return null;
  }

  if (!backAssetId) return null;

  return {
    packNumber,
    packSetId,
    frontAssetId,
    backAssetId,
  };
}

/**
 * パック番号とpackIdのマッピング
 * ディレクトリ番号（1-7）をgacha_packsのIDにマッピング
 */
function getPackIdMapping(): Record<number, string> {
  return {
    1: "hot-pack",
    2: "cute-pack",
    3: "cool-pack",
    4: "dark-pack",
    5: "white-pack",
    6: "standard",
    7: "premium",
  };
}

// ========== メイン処理 ==========

async function main() {
  header("Trading Card Simulator - ローカル環境セットアップ");

  // Step 1: APIサーバー起動確認
  log("APIサーバーの起動を確認中...");

  const backendOk = await checkServer(BACKEND_API_URL, "Backend API");
  const imagesOk = await checkServer(IMAGE_API_URL, "Images API");

  if (!backendOk || !imagesOk) {
    console.log("");
    if (!backendOk) log(`Backend API (${BACKEND_API_URL}) が起動していません`, "error");
    if (!imagesOk) log(`Images API (${IMAGE_API_URL}) が起動していません`, "error");
    console.log("");
    log("先に以下のコマンドでサーバーを起動してください:", "warn");
    console.log("");
    console.log("  # ターミナル1");
    console.log("  bun run dev:backend");
    console.log("");
    console.log("  # ターミナル2");
    console.log("  bun run dev:images");
    console.log("");
    process.exit(1);
  }

  log("Backend API: OK", "success");
  log("Images API: OK", "success");

  // Step 2: D1マイグレーション適用
  header("Step 1: D1マイグレーション適用");
  log("D1マイグレーションを適用中...");

  const migrationResult = spawnSync(
    "bunx",
    ["wrangler", "d1", "migrations", "apply", "trading-cards", "--local"],
    {
      cwd: resolve(BACKEND_DIR),
      stdio: "pipe",
    },
  );

  if (migrationResult.status === 0) {
    log("D1マイグレーション適用完了", "success");
  } else {
    log("D1マイグレーション適用失敗（既に適用済みの可能性あり）", "warn");
  }

  // Step 3: 画像アセットアップロード
  header("Step 2: 画像アセットアップロード");

  const files = await readdir(CARDS_DIR);
  const cardImages: CardImageInfo[] = [];

  for (const file of files) {
    const info = parseCardFilename(file);
    if (info) cardImages.push(info);
  }

  cardImages.sort((a, b) => {
    if (a.pack !== b.pack) return a.pack - b.pack;
    if (a.series !== b.series) return a.series - b.series;
    return a.number - b.number;
  });

  log(`${cardImages.length}枚のカード画像を検出`);

  const cardDefs = getCardDefinitions();
  const cardCount = Math.min(cardImages.length, cardDefs.length);

  if (cardImages.length !== cardDefs.length) {
    log(`画像数(${cardImages.length})とカード定義数(${cardDefs.length})が異なります`, "warn");
  }

  const results: UploadResult[] = [];

  for (let i = 0; i < cardCount; i++) {
    const image = cardImages[i];
    const cardDef = cardDefs[i];
    const cardId = i + 1;

    const filepath = join(CARDS_DIR, image.filename);
    process.stdout.write(`  [${cardId}/${cardCount}] ${image.filename} → ${cardDef.name}... `);

    const uploadResult = await uploadAsset(filepath, image.filename);

    if (uploadResult) {
      console.log("✅");
      results.push({
        cardId,
        assetId: uploadResult.id,
        r2Key: uploadResult.r2Key,
        originalName: uploadResult.originalName,
        contentType: uploadResult.contentType,
        size: uploadResult.size,
        cardDef,
      });
    } else {
      console.log("❌");
    }
  }

  console.log("");
  log(`アップロード成功: ${results.length}/${cardCount}`, results.length === cardCount ? "success" : "warn");

  if (results.length === 0) {
    log("アップロードされた画像がありません", "error");
    process.exit(1);
  }

  // Step 3: パック画像アップロード
  header("Step 3: パック画像アセットアップロード");

  // パックディレクトリを読み込んでソート
  const packDirs = await readdir(PACKS_DIR);
  const packNumbers = packDirs
    .filter((dir) => /^\d+$/.test(dir))
    .map((dir) => Number.parseInt(dir))
    .sort((a, b) => a - b);

  log(`${packNumbers.length}個のパックディレクトリを検出`);

  const packResults: PackUploadResult[] = [];
  const packIdMapping = getPackIdMapping();

  for (const packNumber of packNumbers) {
    const packId = packIdMapping[packNumber];
    process.stdout.write(`  [${packNumber}/${packNumbers.length}] Pack ${packNumber} → ${packId || "(unmapped)"}... `);

    const packResult = await uploadPackImages(packNumber);

    if (packResult) {
      console.log("✅");
      packResults.push(packResult);
    } else {
      console.log("❌");
    }
  }

  console.log("");
  log(`パック画像アップロード成功: ${packResults.length}/${packNumbers.length}`, packResults.length === packNumbers.length ? "success" : "warn");

  // Step 4: SQLを生成してD1に適用
  header("Step 4: カード・パックデータをD1に登録");

  // SQLインジェクション対策として文字列をエスケープ
  const escapeSQL = (str: string) => str.replace(/'/g, "''");

  const sqlStatements = [
    // 既存データを削除（外部キー順）
    "DELETE FROM news_cards;",
    "DELETE FROM gacha_rates;",
    "DELETE FROM cards;",
    // assetsテーブルのアセットを削除（カード、パック画像）
    "DELETE FROM assets WHERE type = 'card';",
    "DELETE FROM assets WHERE type = 'pack-front';",
    "DELETE FROM assets WHERE type = 'pack-back';",
    "",
    // まずassetsテーブルにカードアセットを挿入
    "-- カードアセット登録",
    ...results.map((r) => {
      return `INSERT INTO assets (id, type, original_name, content_type, size, r2_key, has_webp) VALUES ('${escapeSQL(r.assetId)}', 'card', '${escapeSQL(r.originalName)}', '${escapeSQL(r.contentType)}', ${r.size}, '${escapeSQL(r.r2Key)}', 0);`;
    }),
    "",
    // パックアセットを挿入
    "-- パックアセット登録",
    ...packResults.flatMap((p) => {
      const packId = packIdMapping[p.packNumber];
      return [
        `INSERT INTO assets (id, type, original_name, content_type, size, r2_key, has_webp, pack_set_id) VALUES ('${escapeSQL(p.frontAssetId)}', 'pack-front', 'pack-${p.packNumber}-front.png', 'image/png', 0, 'assets/pack-front/${escapeSQL(p.frontAssetId)}', 0, '${escapeSQL(p.packSetId)}');`,
        `INSERT INTO assets (id, type, original_name, content_type, size, r2_key, has_webp, pack_set_id) VALUES ('${escapeSQL(p.backAssetId)}', 'pack-back', 'pack-${p.packNumber}-back.png', 'image/png', 0, 'assets/pack-back/${escapeSQL(p.backAssetId)}', 0, '${escapeSQL(p.packSetId)}');`,
      ];
    }),
    "",
    // 次にcardsテーブルにレコードを挿入
    "-- カード登録",
    ...results.map((r) => {
      const def = r.cardDef;
      return `INSERT INTO cards (id, name, type, holo_type, text_style, asset_id, description, icon_name, rarity) VALUES (${r.cardId}, '${escapeSQL(def.name)}', '${escapeSQL(def.type)}', '${escapeSQL(def.holoType)}', '${escapeSQL(def.textStyle)}', '${escapeSQL(r.assetId)}', '${escapeSQL(def.description)}', '${escapeSQL(def.iconName)}', '${escapeSQL(def.rarity)}');`;
    }),
    "",
    // ガチャパックのpack_set_idを更新
    "-- ガチャパックのpack_set_id更新",
    ...packResults.map((p) => {
      const packId = packIdMapping[p.packNumber];
      if (packId) {
        return `UPDATE gacha_packs SET pack_set_id = '${escapeSQL(p.packSetId)}' WHERE id = '${escapeSQL(packId)}';`;
      }
      return "";
    }).filter(Boolean),
    "",
    // ガチャレート登録
    "-- ガチャレート登録",
    "INSERT INTO gacha_rates (pack_id, card_id, weight, is_pickup) SELECT 'standard', id, 100, 0 FROM cards;",
    "INSERT INTO gacha_rates (pack_id, card_id, weight, is_pickup) SELECT 'premium', id, 100, 0 FROM cards;",
    "INSERT INTO gacha_rates (pack_id, card_id, weight, is_pickup) SELECT 'hot-pack', id, 100, 0 FROM cards WHERE rarity = 'hot';",
    "INSERT INTO gacha_rates (pack_id, card_id, weight, is_pickup) SELECT 'cute-pack', id, 100, 0 FROM cards WHERE rarity = 'cute';",
    "INSERT INTO gacha_rates (pack_id, card_id, weight, is_pickup) SELECT 'cool-pack', id, 100, 0 FROM cards WHERE rarity = 'cool';",
    "INSERT INTO gacha_rates (pack_id, card_id, weight, is_pickup) SELECT 'dark-pack', id, 100, 0 FROM cards WHERE rarity = 'dark';",
    "INSERT INTO gacha_rates (pack_id, card_id, weight, is_pickup) SELECT 'white-pack', id, 100, 0 FROM cards WHERE rarity = 'white';",
  ];

  log("カード・パックデータをD1に登録中...");

  // 各SQLコマンドを個別に実行（ファイルハンドル問題を回避）
  let successCount = 0;
  let errorCount = 0;

  for (const sql of sqlStatements) {
    // 空行やコメントのみの行はスキップ
    const trimmedSql = sql.trim();
    if (!trimmedSql || trimmedSql.startsWith("--")) {
      continue;
    }

    const result = spawnSync(
      "bunx",
      ["wrangler", "d1", "execute", "trading-cards", "--local", "--command", trimmedSql],
      {
        cwd: resolve(BACKEND_DIR),
        stdio: "pipe",
      },
    );

    if (result.status === 0) {
      successCount++;
    } else {
      errorCount++;
      // 最初のエラーで詳細を出力
      if (errorCount === 1) {
        const stderr = result.stderr?.toString() ?? "";
        if (stderr && !stderr.includes("UNIQUE constraint")) {
          console.error(`  SQL: ${trimmedSql.substring(0, 80)}...`);
          console.error(`  Error: ${stderr}`);
        }
      }
    }
  }

  if (errorCount > 0) {
    log(`データ登録: ${successCount}件成功, ${errorCount}件失敗`, "warn");
  } else {
    log(`データ登録完了 (${successCount}件)`, "success");
  }

  // Step 5: 完了
  header("セットアップ完了 🎉");

  console.log("以下の内容がセットアップされました:");
  console.log(`  - カード: ${results.length}枚`);
  console.log(`  - ガチャパック: 7種類`);
  console.log(`  - カード画像アセット: ${results.length}枚 (R2)`);
  console.log(`  - パック画像アセット: ${packResults.length * 2}枚 (R2) [${packResults.length}セット]`);
  console.log("");
  console.log("フロントエンド: http://localhost:5173");
  console.log("管理画面: http://localhost:5174");
  console.log("");
}

main().catch((error) => {
  log(`セットアップに失敗しました: ${error.message}`, "error");
  process.exit(1);
});
