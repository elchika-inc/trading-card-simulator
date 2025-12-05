import type { SiteSettings } from "./site-settings";

/**
 * サイト設定リポジトリインターフェース
 */
export interface SiteSettingsRepository {
  /**
   * サイト設定を取得
   */
  get(): Promise<SiteSettings | null>;

  /**
   * サイト設定を保存（upsert）
   */
  save(settings: SiteSettings): Promise<void>;
}
