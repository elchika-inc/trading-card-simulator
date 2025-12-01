/**
 * 画像配信ハンドラ
 * GET /api/images/:id
 */

import type { Env, ImageResizeParams } from "@repo/types";
import type { Context } from "hono";
import { getFromR2 } from "../lib/r2";

export async function handleServe(c: Context<{ Bindings: Env }>): Promise<Response> {
  try {
    const id = c.req.param("id");
    const key = `images/${id}`;

    // Cache APIでキャッシュチェック
    const cache = caches.default;
    const cacheKey = new Request(c.req.url, c.req.raw);
    let response = await cache.match(cacheKey);

    if (response) {
      return response;
    }

    // R2から画像取得
    const object = await getFromR2(c.env.CARD_IMAGES!, key);
    if (!object) {
      return c.json({ error: "Image not found" }, 404);
    }

    // Image Resizingパラメータ
    const params: ImageResizeParams = {
      width: c.req.query("width") ? Number(c.req.query("width")) : undefined,
      height: c.req.query("height") ? Number(c.req.query("height")) : undefined,
      fit: c.req.query("fit") as ImageResizeParams["fit"],
      format: (c.req.query("format") as ImageResizeParams["format"]) ?? "auto",
      quality: c.req.query("quality") ? Number(c.req.query("quality")) : undefined,
    };

    // R2 URLを生成してImage Resizingを適用
    const r2Url = `${new URL(c.req.url).origin}/${key}`;

    // Image Resizing適用
    response = await fetch(r2Url, {
      cf: {
        image: {
          width: params.width,
          height: params.height,
          fit: params.fit,
          format: params.format,
          quality: params.quality ?? 85,
          metadata: "none", // EXIF削除
        },
      },
    });

    // キャッシュヘッダー付与
    response = new Response(object.body, {
      headers: {
        ...Object.fromEntries(response.headers),
        "Content-Type": object.httpMetadata?.contentType ?? "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });

    // Cache APIに保存
    c.executionCtx.waitUntil(cache.put(cacheKey, response.clone()));

    return response;
  } catch (error) {
    console.error("Serve error:", error);
    return c.json(
      {
        error: error instanceof Error ? error.message : "Failed to serve image",
      },
      500,
    );
  }
}
