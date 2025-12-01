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

    // R2からリスト取得
    const result = await listFromR2(c.env.CARD_IMAGES!, {
      limit,
      cursor,
      prefix: prefix ? `images/${prefix}` : "images/",
    });

    // ImageMetadataに変換
    const baseUrl = new URL(c.req.url).origin;
    const images = result.objects.map((obj) => r2ObjectToImageMetadata(obj as any, baseUrl));

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
