/**
 * 画像アップロードハンドラ
 * POST /api/images - 単一画像アップロード
 * POST /api/images/bulk - 一括画像アップロード
 */

import type { Env, ImageBulkUploadResponse, ImageMetadata, ImageUploadResponse } from "@repo/types";
import type { Context } from "hono";
import { transformImage, transformImageLocal } from "../container";
import { uploadToR2 } from "../lib/r2";
import { getFileExtension, validateImageFile } from "../lib/validation";

/**
 * Container を使ってWebPに変換
 */
async function convertToWebP(
  c: Context<{ Bindings: Env }>,
  imageBuffer: ArrayBuffer,
): Promise<ArrayBuffer> {
  // ローカル開発環境: Docker containerを使用
  if (c.env.IMAGE_TRANSFORMER_URL) {
    return await transformImageLocal(c.env.IMAGE_TRANSFORMER_URL, imageBuffer, {
      quality: 85, // 高品質で保存
    });
  }

  // 本番環境: Cloudflare Containerを使用
  if (c.env.IMAGE_TRANSFORMER) {
    const containerId = c.env.IMAGE_TRANSFORMER.idFromName("image-transformer");
    const container = c.env.IMAGE_TRANSFORMER.get(containerId);
    return await transformImage(container, imageBuffer, {
      quality: 85,
    });
  }

  throw new Error("Image transformer not configured");
}

/**
 * 単一ファイルを処理してアップロード（WebP変換含む）
 * ファイル名をそのままR2のキーとして使用
 */
async function processAndUploadFile(
  c: Context<{ Bindings: Env }>,
  file: File,
  bucket: R2Bucket,
): Promise<ImageMetadata> {
  // ファイル名をそのままIDとして使用（拡張子を除いた部分）
  const originalName = file.name;
  const nameWithoutExt = originalName.replace(/\.\w+$/, "");
  const key = `images/${originalName}`;

  const fileBuffer = await file.arrayBuffer();
  await uploadToR2(bucket, key, fileBuffer, {
    contentType: file.type,
    originalName: originalName,
    size: file.size,
  });

  let hasWebP = false;
  try {
    const webpBuffer = await convertToWebP(c, fileBuffer);
    const webpKey = `images/${nameWithoutExt}.webp`;
    await uploadToR2(bucket, webpKey, webpBuffer, {
      contentType: "image/webp",
      originalName: `${nameWithoutExt}.webp`,
      size: webpBuffer.byteLength,
    });
    console.log(`WebP version uploaded: ${webpKey}`);
    hasWebP = true;
  } catch (error) {
    console.error("WebP conversion failed (original image saved):", error);
  }

  const baseUrl = new URL(c.req.url).origin;
  return {
    id: originalName, // ファイル名をIDとして使用
    url: `${baseUrl}/api/images/${originalName}?format=auto`,
    thumbnailUrl: `${baseUrl}/api/images/${originalName}?width=320&format=auto`,
    originalName: originalName,
    contentType: file.type,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    hasWebP,
  };
}

export async function handleUpload(c: Context<{ Bindings: Env }>): Promise<Response> {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return c.json({ success: false, error: "No file provided" }, 400);
    }

    // バリデーション
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return c.json({ success: false, error: validation.error }, 400);
    }

    // UUIDを生成
    const uuid = crypto.randomUUID();
    const ext = getFileExtension(file.type);
    const _key = `images/${uuid}.${ext}`;

    // R2バケットの確認
    const bucket = c.env.CARD_IMAGES;
    if (!bucket) {
      return c.json({ success: false, error: "R2 bucket not configured" }, 500);
    }

    const imageMetadata = await processAndUploadFile(c, file, bucket);

    const response: ImageUploadResponse = {
      success: true,
      data: imageMetadata,
    };

    return c.json(response, 201);
  } catch (error) {
    console.error("Upload error:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      },
      500,
    );
  }
}

/**
 * 一括画像アップロードハンドラ
 * POST /api/images/bulk
 */
export async function handleBulkUpload(c: Context<{ Bindings: Env }>): Promise<Response> {
  try {
    const formData = await c.req.formData();

    const bucket = c.env.CARD_IMAGES;
    if (!bucket) {
      return c.json({ success: false, error: "R2 bucket not configured" }, 500);
    }

    const files: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (key === "files" && value instanceof File) {
        files.push(value);
      }
    }

    if (files.length === 0) {
      return c.json({ success: false, error: "No files provided" }, 400);
    }

    console.log(`Starting bulk upload of ${files.length} files`);

    const uploaded: ImageMetadata[] = [];
    const failed: Array<{ filename: string; error: string }> = [];

    for (const file of files) {
      try {
        const validation = validateImageFile(file);
        if (!validation.valid) {
          failed.push({
            filename: file.name,
            error: validation.error || "Validation failed",
          });
          console.log(`Validation failed for ${file.name}: ${validation.error}`);
          continue;
        }

        const imageMetadata = await processAndUploadFile(c, file, bucket);
        uploaded.push(imageMetadata);
        console.log(`Successfully uploaded ${file.name} (${uploaded.length}/${files.length})`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Upload failed";
        failed.push({
          filename: file.name,
          error: errorMessage,
        });
        console.error(`Failed to upload ${file.name}:`, error);
      }
    }

    const response: ImageBulkUploadResponse = {
      success: true,
      data: {
        uploaded,
        failed,
        total: files.length,
        successCount: uploaded.length,
        failedCount: failed.length,
      },
    };

    console.log(
      `Bulk upload completed: ${uploaded.length} succeeded, ${failed.length} failed out of ${files.length} total`,
    );

    return c.json(response, 201);
  } catch (error) {
    console.error("Bulk upload error:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Bulk upload failed",
      },
      500,
    );
  }
}
