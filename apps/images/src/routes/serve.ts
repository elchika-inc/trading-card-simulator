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

    for (const ext of extensions) {
      const key = `images/${cleanId}.${ext}`;
      object = await getFromR2(bucket, key);
      if (object) {
        _foundKey = key;
        break;
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

    // If format=auto or format=webp, use Container for transformation
    const shouldTransform = format === "auto" || format === "webp" || width || height;

    let responseBody: ArrayBuffer | ReadableStream;
    let contentType = object.httpMetadata?.contentType ?? "image/png";

    if (shouldTransform && c.env.IMAGE_TRANSFORMER_URL) {
      // Local development: use Docker container directly
      const imageBuffer = await object.arrayBuffer();
      responseBody = await transformImageLocal(c.env.IMAGE_TRANSFORMER_URL, imageBuffer, {
        width,
        height,
        quality,
      });
      contentType = "image/webp";
    } else if (shouldTransform && c.env.IMAGE_TRANSFORMER) {
      // Production: use Cloudflare Container via Durable Object
      const imageBuffer = await object.arrayBuffer();
      const containerId = c.env.IMAGE_TRANSFORMER.idFromName("image-transformer");
      const container = c.env.IMAGE_TRANSFORMER.get(containerId);
      responseBody = await transformImage(container, imageBuffer, {
        width,
        height,
        quality,
      });
      contentType = "image/webp";
    } else {
      // Return original image
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
