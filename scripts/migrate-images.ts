/**
 * 画像マイグレーションスクリプト
 * public/assets 配下の画像をR2に一括アップロードする
 */

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const IMAGE_API_URL = "http://localhost:8788";
const PUBLIC_DIR = "./public/assets/cards";

async function migrateImages() {
  console.log("Starting image migration...\n");

  try {
    const files = await readdir(PUBLIC_DIR);
    const imageFiles = files.filter((f) => f.match(/\.(png|jpg|jpeg|webp)$/i));

    console.log(`Found ${imageFiles.length} images to migrate\n`);

    const formData = new FormData();

    for (const filename of imageFiles) {
      const filepath = join(PUBLIC_DIR, filename);
      const fileBuffer = await readFile(filepath);
      const blob = new Blob([fileBuffer], { type: "image/png" });
      formData.append("files", blob, filename);
    }

    console.log(`Uploading ${imageFiles.length} images in bulk...`);

    const response = await fetch(`${IMAGE_API_URL}/api/images/bulk`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      console.error("Bulk upload failed");
      console.error(await response.text());
      process.exit(1);
    }

    const data = await response.json();

    console.log("\nBulk upload complete!\n");
    console.log(`Successfully uploaded: ${data.data.successCount}`);
    console.log(`Failed: ${data.data.failedCount}`);
    console.log(`Total: ${data.data.total}\n`);

    if (data.data.failed.length > 0) {
      console.log("Failed uploads:");
      for (const failed of data.data.failed) {
        console.log(`  - ${failed.filename}: ${failed.error}`);
      }
      console.log("");
    }

    console.log("Update apps/backend/src/data/cards.ts with these UUIDs:\n");
    console.log("const CARD_IMAGE_IDS = [");
    for (const img of data.data.uploaded) {
      console.log(`  "${img.id}", // ${img.originalName}`);
    }
    console.log("];\n");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrateImages();
