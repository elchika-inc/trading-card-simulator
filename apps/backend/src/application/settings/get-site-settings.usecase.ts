import { SiteSettings, type SiteSettingsRepository } from "../../domain/settings";

export interface GetSiteSettingsOutput {
  settings: ReturnType<SiteSettings["toPlainObject"]>;
}

/**
 * サイト設定取得ユースケース
 */
export class GetSiteSettingsUseCase {
  constructor(private readonly settingsRepository: SiteSettingsRepository) {}

  async execute(): Promise<GetSiteSettingsOutput> {
    let settings = await this.settingsRepository.get();

    // 設定が存在しない場合はデフォルトを作成
    if (!settings) {
      settings = SiteSettings.createDefault();
      await this.settingsRepository.save(settings);
    }

    return {
      settings: settings.toPlainObject(),
    };
  }
}
