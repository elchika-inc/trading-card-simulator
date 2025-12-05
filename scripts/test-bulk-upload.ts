/**
 * 画像一括アップロードテストスクリプト
 * /api/images/bulk エンドポイントをテスト（アセットAPIではなく画像API）
 *
 * Usage:
 *   bun run scripts/test-bulk-upload.ts
 *
 * Note:
 *   - アセットAPI（/api/assets）を使う場合は test-asset-api.ts を使用
 *   - このスクリプトは画像API（DB連携なし）のテスト用
 */

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const IMAGE_API_URL = "http://localhost:8788";
const TEST_DIR = "./public/assets/cards";

async function testBulkUpload() {
  console.log("Starting bulk upload test...\n");

  try {
    const files = await readdir(TEST_DIR);
    const imageFiles = files.filter((f) => f.match(/\.(png|jpg|jpeg|webp)$/i));

    console.log(`Found ${imageFiles.length} images to upload\n`);

    const formData = new FormData();

    for (const filename of imageFiles) {
      const filepath = join(TEST_DIR, filename);
      const fileBuffer = await readFile(filepath);
      const blob = new Blob([fileBuffer], { type: "image/png" });
      formData.append("files", blob, filename);
      console.log(`Added to batch: ${filename}`);
    }

    console.log(`\nUploading ${imageFiles.length} images in bulk...`);

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

    console.log("Successfully uploaded images:");
    for (const img of data.data.uploaded) {
      console.log(`  - ID: ${img.id}, File: ${img.originalName}, HasWebP: ${img.hasWebP}`);
    }
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
}

testBulkUpload();
