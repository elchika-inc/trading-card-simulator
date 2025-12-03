/**
 * 画像一覧ハンドラ
 * GET /api/images
 */

import type { Env, ImageListResponse } from "@repo/types";
import type { Context } from "hono";
import { listFromR2, r2ObjectToImageMetadata } from "../lib/r2";

export async function handleList(c: Context<{ Bindings: Env }>): Promise<Response> {
  try {
    const limit = c.req.query("limit") ? Number(c.req.query("limit")) : undefined;
    const cursor = c.req.query("cursor");
    const prefix = c.req.query("prefix");

    // R2バケットの存在確認
    const bucket = c.env.CARD_IMAGES;
    if (!bucket) {
      return c.json({ success: false, error: "R2 bucket not configured" }, 500);
    }

    // R2からリスト取得
    const result = await listFromR2(bucket, {
      limit,
      cursor,
      prefix: prefix ? `images/${prefix}` : "images/",
    });

    // ImageMetadataに変換
    // WebP版は最適化のための内部ファイルなので、リストから除外
    // ただし、WebPの存在を確認するためにIDセットを作成
    const baseUrl = new URL(c.req.url).origin;
    const webpIds = new Set(
      result.objects
        .filter((obj) => obj.key.endsWith(".webp"))
        .map((obj) => obj.key.replace(/^images\//, "").replace(/\.\w+$/, "")),
    );

    const images = result.objects
      .filter((obj) => !obj.key.endsWith(".webp"))
      .map((obj) => {
        const id = obj.key.replace(/^images\//, "").replace(/\.\w+$/, "");
        return r2ObjectToImageMetadata(obj, baseUrl, webpIds.has(id));
      });

    const response: ImageListResponse = {
      success: true,
      data: {
        images,
        cursor: result.truncated ? result.cursor : undefined,
        hasMore: result.truncated,
      },
    };

    return c.json(response);
  } catch (error) {
    console.error("List error:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to list images",
      },
      500,
    );
  }
}
