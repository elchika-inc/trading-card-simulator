/**
 * アセット関連の型定義
 * カード背面画像、パック画像などのゲームアセットを管理
 */

/**
 * アセットの種類
 * - card: カード表面画像
 * - card-back: カード裏面画像
 * - pack-front: パック表面画像
 * - pack-back: パック裏面画像
 */
export type AssetType = "card" | "card-back" | "pack-front" | "pack-back";

/**
 * タブ表示用のカテゴリ
 */
export type AssetCategory = "card" | "pack";

/**
 * アセットのラベル表示用
 */
export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  card: "カード画像",
  "card-back": "カード背面",
  "pack-front": "パック表面",
  "pack-back": "パック裏面",
};

/**
 * カテゴリのラベル表示用
 */
export const ASSET_CATEGORY_LABELS: Record<AssetCategory, string> = {
  card: "カード画像",
  pack: "パック",
};

/**
 * アセットメタデータ
 */
export interface AssetMetadata {
  id: string;
  type: AssetType;
  url: string;
  thumbnailUrl: string;
  originalName: string;
  contentType: string;
  size: number;
  uploadedAt: string;
  hasWebP?: boolean;
  /** パック画像のセットID（表面と裏面を紐付ける） */
  packSetId?: string;
  /** アクティブ状態（カード画像用、パック画像では使用しない） */
  isActive?: boolean;
}

/**
 * アセットアップロードレスポンス
 */
export interface AssetUploadResponse {
  success: true;
  data: AssetMetadata;
}

/**
 * アセット一覧レスポンス
 */
export interface AssetListResponse {
  success: true;
  data: {
    assets: AssetMetadata[];
    cursor?: string;
    hasMore: boolean;
  };
}

/**
 * アセット削除レスポンス
 */
export interface AssetDeleteResponse {
  success: true;
  message: string;
}

// ============================================================================
// Database Types (D1用)
// ============================================================================

/**
 * アセット登録入力（images → backend RPC用）
 */
export interface RegisterAssetInput {
  id: string;
  type: AssetType;
  originalName: string;
  contentType: string;
  size: number;
  r2Key: string;
  hasWebP: boolean;
  /** パック画像のセットID（表面と裏面を紐付ける） */
  packSetId?: string;
}

/**
 * アセット登録結果
 */
export interface RegisterAssetResult {
  success: boolean;
  assetId: string;
}

/**
 * DBのアセットレコード
 */
export interface AssetRecord {
  id: string;
  type: AssetType;
  originalName: string;
  contentType: string;
  size: number;
  r2Key: string;
  hasWebP: boolean;
  /** パック画像のセットID（表面と裏面を紐付ける） */
  packSetId: string | null;
  /** アクティブ状態（card-backで使用中のアセットを示す） */
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
