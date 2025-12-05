/**
 * 共有型定義パッケージ
 *
 * フロントエンドとバックエンドで共有する型定義をまとめてexportします。
 */

// API型定義
export type { ApiError, ApiResponse, Post } from "./api";
// アセット関連の型定義
export type {
  AssetCategory,
  AssetDeleteResponse,
  AssetListResponse,
  AssetMetadata,
  AssetRecord,
  AssetType,
  AssetUploadResponse,
  RegisterAssetInput,
  RegisterAssetResult,
} from "./asset";
export { ASSET_CATEGORY_LABELS, ASSET_TYPE_LABELS } from "./asset";
// カード関連の型定義
export type {
  Card,
  CardAssignment,
  CardCreateRequest,
  CardCreateResponse,
  CardDetailResponse,
  CardListResponse,
  CardRarity,
  CardUpdateRequest,
  CardUpdateResponse,
  FrameColor,
  FrameColorPreset,
  HoloType,
  PackAssignment,
  TextStyleType,
  WeightPreset,
} from "./card";
export { DEFAULT_FRAME_COLORS, FRAME_COLOR_LABELS, WEIGHT_PRESETS } from "./card";
// 環境変数の型定義
export type { AssetServiceRpc, Env } from "./env";
// ガチャパック関連の型定義
export type {
  GachaPack,
  GachaPackDetailResponse,
  GachaPackListResponse,
  GachaPackWithAssets,
} from "./gacha-pack";
// 画像関連の型定義
export type {
  ImageBulkUploadResponse,
  ImageDeleteResponse,
  ImageListResponse,
  ImageMetadata,
  ImageResizeParams,
  ImageUploadRequest,
  ImageUploadResponse,
} from "./image";
// News関連の型定義
export type {
  News,
  NewsCreateRequest,
  NewsDetailResponse,
  NewsListResponse,
  NewsMutationResponse,
  NewsUpdateRequest,
  NewsWithDetails,
} from "./news";
// パックグループ関連の型定義
export type {
  AssignPackToGroupRequest,
  PackGroup,
  PackGroupCreateRequest,
  PackGroupDetailResponse,
  PackGroupListResponse,
  PackGroupMutationResponse,
  PackGroupUpdateRequest,
  PackGroupWithPacks,
} from "./pack-group";
// 設定関連の型定義
export type {
  BackgroundPreset,
  BackgroundPresetId,
  SiteSettings,
  SiteSettingsResponse,
  SiteSettingsUpdateRequest,
  SiteSettingsUpdateResponse,
} from "./settings";
