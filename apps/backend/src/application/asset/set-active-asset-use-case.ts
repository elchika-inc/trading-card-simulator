import { AssetId, type AssetRepository, AssetType } from "../../domain/asset";

/**
 * SetActiveAssetUseCase
 * 指定したアセットをアクティブに設定するユースケース
 * 同じ種類の他のアセットは非アクティブになる
 */
export class SetActiveAssetUseCase {
  constructor(private readonly assetRepository: AssetRepository) {}

  /**
   * アセットをアクティブに設定する
   */
  async execute(assetId: string, type: string): Promise<void> {
    const id = AssetId.create(assetId);
    const assetType = AssetType.create(type);

    // アセットを取得
    const asset = await this.assetRepository.findById(id);
    if (!asset) {
      throw new Error(`Asset not found: ${assetId}`);
    }

    // 種類が一致するか確認
    if (!asset.getType().equals(assetType)) {
      throw new Error(`Asset type mismatch: expected ${type}, got ${asset.getType().getValue()}`);
    }

    // 同じ種類の他のアセットを非アクティブにする
    await this.assetRepository.deactivateAllByType(assetType);

    // 指定したアセットをアクティブにする
    asset.activate();
    await this.assetRepository.save(asset);
  }
}
