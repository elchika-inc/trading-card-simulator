/**
 * サイト設定の型定義
 *
 * admin設定とuser設定の2レベルを想定
 * 現状はadminの背景設定のみ実装
 */

/**
 * 背景プリセットID
 */
export type BackgroundPresetId =
  | "purple-cosmos" // 現在のfrontend背景（デフォルト）
  | "blue-ocean"
  | "dark-abyss"
  | "sunset-glow"
  | "emerald-forest";

/**
 * 背景プリセット設定
 */
export interface BackgroundPreset {
  id: BackgroundPresetId;
  name: string;
  colors: {
    from: string; // グラデーション開始色
    via: string; // グラデーション中間色
    to: string; // グラデーション終了色
  };
  showParticles: boolean;
  animate: boolean;
}

/**
 * サイト全体の設定（adminが管理）
 */
export interface SiteSettings {
  id: string; // "site" (シングルトン)
  backgroundPresetId: BackgroundPresetId;
  updatedAt: string;
}

/**
 * サイト設定取得レスポンス
 */
export interface SiteSettingsResponse {
  settings: SiteSettings;
}

/**
 * サイト設定更新リクエスト
 */
export interface SiteSettingsUpdateRequest {
  backgroundPresetId: BackgroundPresetId;
}

/**
 * サイト設定更新レスポンス
 */
export interface SiteSettingsUpdateResponse {
  settings: SiteSettings;
}
