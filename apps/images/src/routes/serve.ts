/**
 * 画像配信ハンドラ
 * GET /api/images/:id
 * Container を使用して WebP 変換
 */

import type { Context } from "hono";
import type { Env } from "../container";
import { transformImage, transformImageLocal } from "../container";
import { getFromR2 } from "../lib/r2";

export async function handleServe(c: Context<{ Bindings: Env }>): Promise<Response> {
  try {
    const id = c.req.param("id");
    // Remove extension if present
    const cleanId = id.replace(/\.\w+$/, "");

    // Try to find the image with common extensions
    const extensions = ["png", "jpg", "jpeg", "webp", "gif"];
    let object: R2ObjectBody | null = null;
    let _foundKey = "";

    const bucket = c.env.CARD_IMAGES;
    if (!bucket) {
      return c.json({ error: "R2 bucket not configured" }, 500);
    }

    // 1. まずUUID形式で検索 (images/{cleanId}.{ext})
    for (const ext of extensions) {
      const key = `images/${cleanId}.${ext}`;
      object = await getFromR2(bucket, key);
      if (object) {
        _foundKey = key;
        break;
      }
    }

    // 2. 見つからなければ、元のファイル名で検索 (originalName として保存されたもの)
    if (!object) {
      // idにすでに拡張子が含まれている場合
      const originalKey = `images/${id}`;
      object = await getFromR2(bucket, originalKey);
      if (object) {
        _foundKey = originalKey;
      }
    }

    // 3. それでも見つからなければ、拡張子を付けて検索
    if (!object) {
      for (const ext of extensions) {
        const key = `images/${id}.${ext}`;
        object = await getFromR2(bucket, key);
        if (object) {
          _foundKey = key;
          break;
        }
      }
    }

    if (!object) {
      return c.json({ error: "Image not found" }, 404);
    }

    // Parse query parameters
    const format = c.req.query("format") ?? "auto";
    const width = c.req.query("width") ? Number(c.req.query("width")) : undefined;
    const height = c.req.query("height") ? Number(c.req.query("height")) : undefined;
    const quality = c.req.query("quality") ? Number(c.req.query("quality")) : 80;

    // WebPリクエストで、リサイズ不要な場合は事前変換済みWebPを返す
    const wantsWebP = format === "auto" || format === "webp";
    const needsResize = width || height;

    let responseBody: ArrayBuffer | ReadableStream;
    let contentType = object.httpMetadata?.contentType ?? "image/png";

    // 事前変換済みWebPがあればそれを返す（高速）
    if (wantsWebP && !needsResize) {
      const webpKey = `images/${cleanId}.webp`;
      const webpObject = await getFromR2(bucket, webpKey);

      if (webpObject) {
        console.log(`Serving pre-converted WebP: ${webpKey}`);
        responseBody = webpObject.body;
        contentType = "image/webp";
      } else {
        // WebPがない場合は従来通りリアルタイム変換
        console.log(`Pre-converted WebP not found, converting on-the-fly: ${webpKey}`);
        const imageBuffer = await object.arrayBuffer();

        if (c.env.IMAGE_TRANSFORMER_URL) {
          // Local development: use Docker container
          responseBody = await transformImageLocal(c.env.IMAGE_TRANSFORMER_URL, imageBuffer, {
            quality,
          });
        } else if (c.env.IMAGE_TRANSFORMER) {
          // Production: use Cloudflare Container
          const containerId = c.env.IMAGE_TRANSFORMER.idFromName("image-transformer");
          const container = c.env.IMAGE_TRANSFORMER.get(containerId);
          responseBody = await transformImage(container, imageBuffer, { quality });
        } else {
          // Transformer not available, return original
          responseBody = object.body;
          contentType = object.httpMetadata?.contentType ?? "image/png";
        }
        contentType = "image/webp";
      }
    } else if (needsResize) {
      // リサイズが必要な場合は従来通りリアルタイム変換
      console.log(`Resizing image: ${cleanId} (${width}x${height})`);
      const imageBuffer = await object.arrayBuffer();

      if (c.env.IMAGE_TRANSFORMER_URL) {
        responseBody = await transformImageLocal(c.env.IMAGE_TRANSFORMER_URL, imageBuffer, {
          width,
          height,
          quality,
        });
      } else if (c.env.IMAGE_TRANSFORMER) {
        const containerId = c.env.IMAGE_TRANSFORMER.idFromName("image-transformer");
        const container = c.env.IMAGE_TRANSFORMER.get(containerId);
        responseBody = await transformImage(container, imageBuffer, { width, height, quality });
      } else {
        // Transformer not available, return original
        responseBody = object.body;
        contentType = object.httpMetadata?.contentType ?? "image/png";
      }
      contentType = "image/webp";
    } else {
      // オリジナル画像をそのまま返す
      responseBody = object.body;
    }

    // Build response with caching headers
    return new Response(responseBody, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
        Vary: "Accept",
      },
    });
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
