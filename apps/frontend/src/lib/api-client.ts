import type { AppType } from "@repo/backend";
import type {
  AssetType,
  Card,
  GachaPack,
  GachaPackWithAssets,
  News,
  NewsWithDetails,
  PackGroup,
  PackGroupWithPacks,
} from "@repo/types";
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
 * カード画像URLを構築するヘルパー関数
 *
 * カード画像はアセットAPI（/api/assets/card/）を使用して配信されます。
 *
 * @param imageFileName - 画像ファイル名（例: "5e45b10f-078c-4971-9494-cc6ce094e6e4.png"）
 * @param options - オプション（format, width, height, quality）
 * @returns 完全な画像URL
 *
 * 使用例:
 * ```ts
 * import { getImageUrl } from "@/lib/api-client";
 *
 * const imageUrl = getImageUrl("5e45b10f-xxx.png", { format: "webp", width: 320 });
 * // => "http://localhost:8788/api/assets/card/5e45b10f-xxx.png?format=webp&width=320"
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
  // カード画像はアセットAPI（/api/assets/card/）を使用
  return `${IMAGES_API_URL}/api/assets/card/${imageFileName}${queryString ? `?${queryString}` : ""}`;
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
    // バックエンドAPIからアクティブなアセット情報を取得
    const response = await apiClient.api.assets.active[":type"].$get({
      param: { type: assetType },
    });
    if (!response.ok) return null;

    const data = await response.json();
    if (!data.success || !data.asset) return null;

    return getAssetUrl(assetType, data.asset.id, options);
  } catch {
    return null;
  }
}

/**
 * packSetIdに対応するアセットマップを構築する
 */
async function fetchPackAssetMap(): Promise<Map<string, { frontUrl?: string; backUrl?: string }>> {
  const map = new Map<string, { frontUrl?: string; backUrl?: string }>();

  try {
    const [frontRes, backRes] = await Promise.all([
      fetch(`${IMAGES_API_URL}/api/assets?type=pack-front`),
      fetch(`${IMAGES_API_URL}/api/assets?type=pack-back`),
    ]);

    if (frontRes.ok) {
      const frontData = await frontRes.json();
      for (const asset of frontData.data?.assets || []) {
        if (asset.packSetId) {
          const existing = map.get(asset.packSetId) || {};
          map.set(asset.packSetId, {
            ...existing,
            frontUrl: getAssetUrl("pack-front", asset.id),
          });
        }
      }
    }

    if (backRes.ok) {
      const backData = await backRes.json();
      for (const asset of backData.data?.assets || []) {
        if (asset.packSetId) {
          const existing = map.get(asset.packSetId) || {};
          map.set(asset.packSetId, {
            ...existing,
            backUrl: getAssetUrl("pack-back", asset.id),
          });
        }
      }
    }
  } catch {
    // エラー時は空のマップを返す
  }

  return map;
}

/**
 * ガチャパック一覧を取得する
 * アセットURLも含めて返す
 */
export async function getGachaPacks(): Promise<GachaPackWithAssets[]> {
  try {
    const [response, assetMap] = await Promise.all([
      apiClient.api.gacha.packs.$get(),
      fetchPackAssetMap(),
    ]);

    if (!response.ok) return [];

    const data = await response.json();
    const packs = data.packs as GachaPack[];

    // 各パックのアセットURLを解決（packSetIdを使用）
    const packsWithAssets: GachaPackWithAssets[] = packs.map((pack) => {
      const assets = pack.packSetId ? assetMap.get(pack.packSetId) : undefined;

      return {
        ...pack,
        frontImageUrl: assets?.frontUrl,
        backImageUrl: assets?.backUrl,
      };
    });

    return packsWithAssets;
  } catch {
    return [];
  }
}

/**
 * 特定のガチャパックを取得する
 * 注目カード（featuredCards）も含めて返す
 */
export async function getGachaPack(packId: string): Promise<GachaPackWithAssets | null> {
  try {
    const [response, assetMap] = await Promise.all([
      apiClient.api.gacha.packs[":packId"].$get({
        param: { packId },
      }),
      fetchPackAssetMap(),
    ]);

    if (!response.ok) return null;

    const data = await response.json();
    const pack = data.pack as GachaPack;
    const featuredCards = (data as { featuredCards?: Card[] }).featuredCards || [];

    const assets = pack.packSetId ? assetMap.get(pack.packSetId) : undefined;

    return {
      ...pack,
      frontImageUrl: assets?.frontUrl,
      backImageUrl: assets?.backUrl,
      featuredCards,
    };
  } catch {
    return null;
  }
}

/**
 * パックのピックアップカードを更新する（Admin用）
 */
export async function updatePickupCards(
  packId: string,
  cardIds: number[],
): Promise<{ packId: string; cardIds: number[] } | null> {
  try {
    const response = await apiClient.api.gacha.packs[":packId"].pickup.$put({
      param: { packId },
      json: { cardIds },
    });
    if (!response.ok) return null;

    const data = await response.json();
    return {
      packId: data.packId,
      cardIds: data.cardIds,
    };
  } catch {
    return null;
  }
}

// ========== Pack Groups API ==========

/**
 * アクティブなパックグループ一覧を取得する
 */
export async function getPackGroups(): Promise<PackGroup[]> {
  try {
    const response = await apiClient.api.gacha.groups.$get();
    if (!response.ok) return [];

    const data = await response.json();
    return data.groups as PackGroup[];
  } catch {
    return [];
  }
}

/**
 * 全パックグループ一覧を取得する（Admin用、非アクティブ含む）
 */
export async function getAllPackGroups(): Promise<PackGroup[]> {
  try {
    const response = await apiClient.api.gacha.groups.all.$get();
    if (!response.ok) return [];

    const data = await response.json();
    return data.groups as PackGroup[];
  } catch {
    return [];
  }
}

/**
 * パックグループ詳細を取得する（パック含む）
 */
export async function getPackGroup(groupId: string): Promise<PackGroupWithPacks | null> {
  try {
    const [response, assetMap] = await Promise.all([
      apiClient.api.gacha.groups[":groupId"].$get({
        param: { groupId },
      }),
      fetchPackAssetMap(),
    ]);

    if (!response.ok) return null;

    const data = await response.json();
    const group = data.group as PackGroup;
    const packs = data.packs as GachaPack[];

    // 各パックのアセットURLを解決（packSetIdを使用）
    const packsWithAssets: GachaPackWithAssets[] = packs.map((pack) => {
      const assets = pack.packSetId ? assetMap.get(pack.packSetId) : undefined;

      return {
        ...pack,
        frontImageUrl: assets?.frontUrl,
        backImageUrl: assets?.backUrl,
      };
    });

    return {
      ...group,
      packs: packsWithAssets,
    };
  } catch {
    return null;
  }
}

/**
 * パックグループを作成する（Admin用）
 */
export async function createPackGroup(input: {
  name: string;
  description?: string | null;
  icon?: string;
  colorFrom?: string;
  colorTo?: string;
  isActive?: boolean;
  sortOrder?: number;
}): Promise<PackGroup | null> {
  try {
    const response = await apiClient.api.gacha.groups.$post({
      json: input,
    });
    if (!response.ok) return null;

    const data = await response.json();
    return data.group as PackGroup;
  } catch {
    return null;
  }
}

/**
 * パックグループを更新する（Admin用）
 */
export async function updatePackGroup(
  groupId: string,
  input: {
    name?: string;
    description?: string | null;
    icon?: string;
    colorFrom?: string;
    colorTo?: string;
    isActive?: boolean;
    sortOrder?: number;
  },
): Promise<PackGroup | null> {
  try {
    const response = await apiClient.api.gacha.groups[":groupId"].$put({
      param: { groupId },
      json: input,
    });
    if (!response.ok) return null;

    const data = await response.json();
    return data.group as PackGroup;
  } catch {
    return null;
  }
}

/**
 * パックグループを削除する（Admin用）
 */
export async function deletePackGroup(groupId: string): Promise<boolean> {
  try {
    const response = await apiClient.api.gacha.groups[":groupId"].$delete({
      param: { groupId },
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * パックをグループに割り当てる（Admin用）
 */
export async function assignPackToGroup(packId: string, groupId: string | null): Promise<boolean> {
  try {
    const response = await apiClient.api.gacha.packs[":packId"].group.$put({
      param: { packId },
      json: { groupId },
    });
    return response.ok;
  } catch {
    return false;
  }
}

// ========== News API ==========

/**
 * アクティブなNews一覧を取得する（Frontend用）
 */
export async function getActiveNews(): Promise<News[]> {
  try {
    const response = await apiClient.api.news.$get();
    if (!response.ok) return [];

    const data = await response.json();
    return data.newsList as News[];
  } catch {
    return [];
  }
}

/**
 * News詳細を取得する（カード詳細・パック詳細含む）
 */
export async function getNewsWithDetails(newsId: string): Promise<NewsWithDetails | null> {
  try {
    const [response, assetMap] = await Promise.all([
      apiClient.api.news[":newsId"].$get({
        param: { newsId },
      }),
      fetchPackAssetMap(),
    ]);
    if (!response.ok) return null;

    const data = await response.json();
    const news = data.news as News;
    const cards = data.cards as Card[];
    const rawPacks = (data as { packs?: GachaPack[] }).packs || [];

    // 各パックのアセットURLを解決（packSetIdを使用）
    const packs: GachaPackWithAssets[] = rawPacks.map((pack) => {
      const assets = pack.packSetId ? assetMap.get(pack.packSetId) : undefined;
      return {
        ...pack,
        frontImageUrl: assets?.frontUrl,
        backImageUrl: assets?.backUrl,
      };
    });

    return {
      ...news,
      cards,
      packs,
      bannerUrl: news.bannerAssetId ? getAssetUrl("pack-front", news.bannerAssetId) : null,
    };
  } catch {
    return null;
  }
}

/**
 * アクティブなNews一覧をカード詳細付きで取得する
 */
export async function getActiveNewsWithDetails(): Promise<NewsWithDetails[]> {
  try {
    const newsList = await getActiveNews();

    const newsWithDetails = await Promise.all(
      newsList.map(async (news) => {
        const details = await getNewsWithDetails(news.id);
        return details;
      }),
    );

    return newsWithDetails.filter((n): n is NewsWithDetails => n !== null);
  } catch {
    return [];
  }
}
