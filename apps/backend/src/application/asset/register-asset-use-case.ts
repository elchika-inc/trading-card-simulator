import type { RegisterAssetInput, RegisterAssetResult } from "@repo/types";
import { Asset, type AssetRepository } from "../../domain/asset";

/**
 * RegisterAssetUseCase
 * アセットを登録するユースケース
 */
export class RegisterAssetUseCase {
  constructor(private readonly assetRepository: AssetRepository) {}

  /**
   * アセットを登録する
   */
  async execute(input: RegisterAssetInput): Promise<RegisterAssetResult> {
    // Entityを作成
    const asset = Asset.create({
      id: input.id,
      type: input.type,
      originalName: input.originalName,
      contentType: input.contentType,
      size: input.size,
      r2Key: input.r2Key,
      hasWebP: input.hasWebP,
    });

    // 保存
    await this.assetRepository.save(asset);

    return {
      success: true,
      assetId: asset.getId().getValue(),
    };
  }
}
