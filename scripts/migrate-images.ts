/**
 * 画像マイグレーションスクリプト
 * public/assets/cards 配下の画像をアセットAPIでR2+DBに一括登録する
 *
 * Usage:
 *   bun run scripts/migrate-images.ts
 *
 * Prerequisites:
 *   - backend dev server running (bun run dev:backend)
 *   - images dev server running (bun run dev:images)
 */

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const IMAGE_API_URL = process.env.IMAGE_API_URL || "http://localhost:8788";
const PUBLIC_DIR = "./public/assets/cards";

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

async function migrateImages() {
  console.log("=== Card Image Migration to Asset API ===\n");
  console.log(`API URL: ${IMAGE_API_URL}`);
  console.log(`Source: ${PUBLIC_DIR}\n`);

  try {
    const files = await readdir(PUBLIC_DIR);
    const imageFiles = files.filter((f) => f.match(/\.(png|jpg|jpeg|webp)$/i));

    console.log(`Found ${imageFiles.length} images to migrate\n`);

    const results: { filename: string; assetId: string; success: boolean; error?: string }[] = [];

    for (const filename of imageFiles) {
      const filepath = join(PUBLIC_DIR, filename);
      const fileBuffer = await readFile(filepath);

      // Content-Typeを適切に設定
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
      formData.append("type", "card"); // カード画像としてアップロード

      try {
        const response = await fetch(`${IMAGE_API_URL}/api/assets`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          results.push({ filename, assetId: "", success: false, error: errorText });
          console.log(`  ❌ ${filename}: ${response.status} - ${errorText}`);
          continue;
        }

        const data = (await response.json()) as AssetUploadResponse;
        results.push({ filename, assetId: data.data.id, success: true });
        console.log(`  ✅ ${filename} → ${data.data.id}`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        results.push({ filename, assetId: "", success: false, error: errorMsg });
        console.log(`  ❌ ${filename}: ${errorMsg}`);
      }
    }

    // サマリー
    const successCount = results.filter((r) => r.success).length;
    const failedCount = results.filter((r) => !r.success).length;

    console.log("\n=== Migration Summary ===");
    console.log(`Success: ${successCount}`);
    console.log(`Failed: ${failedCount}`);
    console.log(`Total: ${results.length}\n`);

    if (failedCount > 0) {
      console.log("Failed uploads:");
      for (const r of results.filter((r) => !r.success)) {
        console.log(`  - ${r.filename}: ${r.error}`);
      }
      console.log("");
    }

    // DBのcardsテーブル更新用のSQL出力
    if (successCount > 0) {
      console.log("=== SQL to update cards table ===\n");
      console.log("-- Run these queries to link cards with uploaded assets:");
      console.log("-- (Modify card IDs as needed based on your card data)\n");

      const successResults = results.filter((r) => r.success);
      for (let i = 0; i < successResults.length; i++) {
        const r = successResults[i];
        console.log(`UPDATE cards SET asset_id = '${r.assetId}' WHERE id = ${i + 1}; -- ${r.filename}`);
      }
      console.log("");
    }
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrateImages();
