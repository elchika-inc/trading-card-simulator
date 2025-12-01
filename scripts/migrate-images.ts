/**
 * 画像マイグレーションスクリプト
 * public/assets 配下の画像をR2にアップロードする
 */

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const IMAGE_API_URL = "http://localhost:8788";
const PUBLIC_DIR = "./apps/frontend/public/assets";

async function migrateImages() {
  console.log("🚀 Starting image migration...\n");

  try {
    // 画像ファイルを取得
    const files = await readdir(PUBLIC_DIR);
    const imageFiles = files.filter((f) => f.match(/\.(png|jpg|jpeg|webp)$/i));

    console.log(`📁 Found ${imageFiles.length} images to migrate\n`);

    const uploadedImages: Array<{ filename: string; id: string; url: string }> = [];

    for (const filename of imageFiles) {
      const filepath = join(PUBLIC_DIR, filename);
      const fileBuffer = await readFile(filepath);
      const blob = new Blob([fileBuffer], { type: "image/png" });

      const formData = new FormData();
      formData.append("file", blob, filename);
      formData.append("metadata", JSON.stringify({ originalName: filename }));

      console.log(`⏳ Uploading ${filename}...`);

      const response = await fetch(`${IMAGE_API_URL}/api/images`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        console.error(`❌ Failed to upload ${filename}`);
        console.error(await response.text());
        continue;
      }

      const data = await response.json();
      console.log(`✅ Uploaded ${filename} → ID: ${data.data.id}\n`);

      uploadedImages.push({
        filename,
        id: data.data.id,
        url: data.data.url,
      });
    }

    console.log("\n🎉 Migration complete!\n");
    console.log("📋 Update apps/backend/src/data/cards.ts with these UUIDs:\n");
    console.log("const CARD_IMAGE_IDS = [");
    for (const img of uploadedImages) {
      console.log(`  "${img.id}", // ${img.filename}`);
    }
    console.log("];\n");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrateImages();
