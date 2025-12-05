import type { BackgroundPresetId } from "@repo/types";
import { SiteSettings, type SiteSettingsRepository } from "../../domain/settings";

export interface UpdateSiteSettingsInput {
  backgroundPresetId: BackgroundPresetId;
}

export interface UpdateSiteSettingsOutput {
  settings: ReturnType<SiteSettings["toPlainObject"]>;
}

/**
 * サイト設定更新ユースケース
 */
export class UpdateSiteSettingsUseCase {
  constructor(private readonly settingsRepository: SiteSettingsRepository) {}

  async execute(input: UpdateSiteSettingsInput): Promise<UpdateSiteSettingsOutput> {
    let settings = await this.settingsRepository.get();

    if (!settings) {
      settings = SiteSettings.createDefault();
    }

    settings.changeBackgroundPreset(input.backgroundPresetId);
    await this.settingsRepository.save(settings);

    return {
      settings: settings.toPlainObject(),
    };
  }
}
