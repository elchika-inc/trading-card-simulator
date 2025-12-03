/**
 * アセット関連の型定義
 * カード背面画像、パック画像などのゲームアセットを管理
 */

/**
 * アセットの種類
 */
export type AssetType = "card-back" | "pack-front" | "pack-back";

/**
 * アセットのラベル表示用
 */
export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  "card-back": "カード背面",
  "pack-front": "パック表面",
  "pack-back": "パック裏面",
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
  isActive: boolean;
  hasWebP?: boolean;
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
 * アクティブアセット取得レスポンス
 */
export interface ActiveAssetResponse {
  success: true;
  data: {
    asset: AssetMetadata | null;
  };
}

/**
 * アセット設定更新レスポンス
 */
export interface AssetSetActiveResponse {
  success: true;
  message: string;
}

/**
 * アセット削除レスポンス
 */
export interface AssetDeleteResponse {
  success: true;
  message: string;
}
