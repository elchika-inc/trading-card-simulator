import type { BackgroundPresetId } from "@repo/types";
import { Entity } from "../shared/entity";

/**
 * サイト設定エンティティ
 * サイト全体の設定を管理（シングルトン）
 */
export class SiteSettings extends Entity<string> {
  private _backgroundPresetId: BackgroundPresetId;
  private _updatedAt: Date;

  private constructor(id: string, backgroundPresetId: BackgroundPresetId, updatedAt: Date) {
    super(id);
    this._backgroundPresetId = backgroundPresetId;
    this._updatedAt = updatedAt;
  }

  /**
   * 既存の設定を復元
   */
  static reconstruct(
    id: string,
    backgroundPresetId: BackgroundPresetId,
    updatedAt: Date,
  ): SiteSettings {
    return new SiteSettings(id, backgroundPresetId, updatedAt);
  }

  /**
   * デフォルトの設定を作成
   */
  static createDefault(): SiteSettings {
    return new SiteSettings("site", "purple-cosmos", new Date());
  }

  get backgroundPresetId(): BackgroundPresetId {
    return this._backgroundPresetId;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * 背景プリセットを変更
   */
  changeBackgroundPreset(presetId: BackgroundPresetId): void {
    this._backgroundPresetId = presetId;
    this._updatedAt = new Date();
  }

  /**
   * プレーンオブジェクトに変換
   */
  toPlainObject() {
    return {
      id: this._id,
      backgroundPresetId: this._backgroundPresetId,
      updatedAt: this._updatedAt.toISOString(),
    };
  }
}
