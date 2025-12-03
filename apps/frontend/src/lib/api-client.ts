import type { AppType } from "@repo/backend";
import type { ActiveAssetResponse, AssetType } from "@repo/types";
import { hc } from "hono/client";

/**
 * Hono RPC クライアント
 * バックエンド API を型安全に呼び出すためのクライアント
 *
 * 使用例:
 * ```ts
 * import { apiClient } from "@/lib/api-client";
 *
 * const response = await apiClient.api.config.$get();
 * const data = await response.json();
 * ```
 */
export const apiClient = hc<AppType>(
  // 開発環境: wrangler dev のデフォルトポート
  // 本番環境: 環境変数またはデフォルトで同じオリジン
  import.meta.env.VITE_API_URL || "http://localhost:8787",
);

/**
 * Images API ベースURL
 */
const IMAGES_API_URL = import.meta.env.VITE_IMAGES_API_URL || "http://localhost:8788";

/**
 * 画像URLを構築するヘルパー関数
 *
 * @param imageFileName - 画像ファイル名（例: "1-1-1_Gemini_Generated_Image_xxx.png"）
 * @param options - オプション（format, width, height, quality）
 * @returns 完全な画像URL
 *
 * 使用例:
 * ```ts
 * import { getImageUrl } from "@/lib/api-client";
 *
 * const imageUrl = getImageUrl("1-1-1_xxx.png", { format: "webp", width: 320 });
 * // => "http://localhost:8788/api/images/1-1-1_xxx.png?format=webp&width=320"
 * ```
 */
export function getImageUrl(
  imageFileName: string,
  options?: {
    format?: "webp" | "auto" | "original";
    width?: number;
    height?: number;
    quality?: number;
  },
): string {
  const params = new URLSearchParams();
  if (options?.format) params.set("format", options.format);
  if (options?.width) params.set("width", options.width.toString());
  if (options?.height) params.set("height", options.height.toString());
  if (options?.quality) params.set("quality", options.quality.toString());

  const queryString = params.toString();
  return `${IMAGES_API_URL}/api/images/${imageFileName}${queryString ? `?${queryString}` : ""}`;
}

/**
 * アセットURLを構築するヘルパー関数
 *
 * @param assetType - アセットタイプ（"card-back", "pack-front", "pack-back"）
 * @param assetId - アセットID（ファイル名）
 * @param options - オプション（format, width, height, quality）
 * @returns 完全なアセットURL
 */
export function getAssetUrl(
  assetType: AssetType,
  assetId: string,
  options?: {
    format?: "webp" | "auto" | "original";
    width?: number;
    height?: number;
    quality?: number;
  },
): string {
  const params = new URLSearchParams();
  if (options?.format) params.set("format", options.format);
  if (options?.width) params.set("width", options.width.toString());
  if (options?.height) params.set("height", options.height.toString());
  if (options?.quality) params.set("quality", options.quality.toString());

  const queryString = params.toString();
  return `${IMAGES_API_URL}/api/assets/${assetType}/${assetId}${queryString ? `?${queryString}` : ""}`;
}

/**
 * アクティブなアセットを取得する
 *
 * @param assetType - アセットタイプ（"card-back", "pack-front", "pack-back"）
 * @returns アクティブなアセットのURL、またはnull
 */
export async function getActiveAssetUrl(
  assetType: AssetType,
  options?: {
    format?: "webp" | "auto" | "original";
    width?: number;
    height?: number;
    quality?: number;
  },
): Promise<string | null> {
  try {
    const response = await fetch(`${IMAGES_API_URL}/api/assets/active/${assetType}`);
    if (!response.ok) return null;

    const data: ActiveAssetResponse = await response.json();
    if (!data.success || !data.data.asset) return null;

    return getAssetUrl(assetType, data.data.asset.id, options);
  } catch {
    return null;
  }
}
