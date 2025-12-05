import type { BackgroundPresetId } from "@repo/types";
import { SiteSettings, type SiteSettingsRepository } from "../../../domain/settings";

interface SiteSettingsRow {
  id: string;
  background_preset_id: string;
  updated_at: string;
}

/**
 * D1を使用したサイト設定リポジトリ実装
 */
export class SiteSettingsRepositoryD1 implements SiteSettingsRepository {
  constructor(private readonly db: D1Database) {}

  async get(): Promise<SiteSettings | null> {
    const row = await this.db
      .prepare("SELECT id, background_preset_id, updated_at FROM site_settings WHERE id = ?")
      .bind("site")
      .first<SiteSettingsRow>();

    if (!row) {
      return null;
    }

    return SiteSettings.reconstruct(
      row.id,
      row.background_preset_id as BackgroundPresetId,
      new Date(row.updated_at),
    );
  }

  async save(settings: SiteSettings): Promise<void> {
    const plain = settings.toPlainObject();

    await this.db
      .prepare(
        `INSERT INTO site_settings (id, background_preset_id, updated_at)
         VALUES (?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           background_preset_id = excluded.background_preset_id,
           updated_at = excluded.updated_at`,
      )
      .bind(plain.id, plain.backgroundPresetId, plain.updatedAt)
      .run();
  }
}
