/**
 * 画像アップロードハンドラ
 * POST /api/images
 */

import type { Env, ImageUploadResponse } from "@repo/types";
import type { Context } from "hono";
import { uploadToR2 } from "../lib/r2";
import { getFileExtension, validateImageFile } from "../lib/validation";

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
    const key = `images/${uuid}.${ext}`;

    // R2にアップロード
    const fileBuffer = await file.arrayBuffer();
    const bucket = c.env.CARD_IMAGES;
    if (!bucket) {
      return c.json({ success: false, error: "R2 bucket not configured" }, 500);
    }
    await uploadToR2(bucket, key, fileBuffer, {
      contentType: file.type,
      originalName: file.name,
      size: file.size,
    });

    // レスポンス
    const baseUrl = new URL(c.req.url).origin;
    const response: ImageUploadResponse = {
      success: true,
      data: {
        id: uuid,
        url: `${baseUrl}/api/images/${uuid}.${ext}?format=auto`,
        thumbnailUrl: `${baseUrl}/api/images/${uuid}.${ext}?width=320&format=auto`,
        originalName: file.name,
        contentType: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      },
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
