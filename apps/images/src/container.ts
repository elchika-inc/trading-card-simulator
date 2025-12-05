/**
 * Image Transformer Container
 *
 * ローカル開発: Docker container を直接使用
 * 本番環境: Cloudflare Container を使用（今後実装予定）
 *
 * Note: Cloudflare Containers はベータ版のため、
 * cloudflare:container モジュールの型定義が完全ではありません。
 * 本番環境での Container 統合は Containers が GA になった後に実装します。
 */

import type { Env } from "@repo/types";

// Env型を再エクスポート
export type { Env };

/**
 * Transform image using local Docker container (for development)
 */
export async function transformImageLocal(
  baseUrl: string,
  imageBuffer: ArrayBuffer,
  options: {
    width?: number;
    height?: number;
    quality?: number;
  } = {},
): Promise<ArrayBuffer> {
  const params = new URLSearchParams();
  if (options.width) params.set("width", options.width.toString());
  if (options.height) params.set("height", options.height.toString());
  if (options.quality) params.set("quality", options.quality.toString());

  const queryString = params.toString();
  const url = `${baseUrl}/transform${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    method: "POST",
    body: imageBuffer,
    headers: {
      "Content-Type": "application/octet-stream",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Transform failed: ${error}`);
  }

  return response.arrayBuffer();
}

/**
 * Transform image using Cloudflare Container (for production)
 *
 * Note: この関数は Cloudflare Containers が GA になった後に実装予定
 */
export async function transformImage(
  container: DurableObjectStub,
  imageBuffer: ArrayBuffer,
  options: {
    width?: number;
    height?: number;
    quality?: number;
  } = {},
): Promise<ArrayBuffer> {
  const params = new URLSearchParams();
  if (options.width) params.set("width", options.width.toString());
  if (options.height) params.set("height", options.height.toString());
  if (options.quality) params.set("quality", options.quality.toString());

  const queryString = params.toString();
  const url = `/transform${queryString ? `?${queryString}` : ""}`;

  const response = await container.fetch(url, {
    method: "POST",
    body: imageBuffer,
    headers: {
      "Content-Type": "application/octet-stream",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Transform failed: ${error}`);
  }

  return response.arrayBuffer();
}

/**
 * Placeholder Container class for Cloudflare Containers
 *
 * 本番環境での Cloudflare Container 統合時に実装予定
 * 現在は wrangler.jsonc の Container 設定でビルド時に使用される
 */
export class ImageTransformerContainer {
  // Container settings (used by Cloudflare at runtime)
  defaultPort = 8080;
  sleepAfter = "30s";

  // biome-ignore lint/complexity/noUselessConstructor: Required for Cloudflare Container
  constructor(_state: DurableObjectState, _env: Env) {}

  async fetch(_request: Request): Promise<Response> {
    // This will be handled by the container runtime
    return new Response("Container not configured", { status: 500 });
  }
}
