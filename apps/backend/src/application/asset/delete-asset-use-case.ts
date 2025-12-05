import { AssetId, type AssetRepository } from "../../domain/asset";

/**
 * DeleteAssetUseCase
 * アセットを削除するユースケース
 */
export class DeleteAssetUseCase {
  constructor(private readonly assetRepository: AssetRepository) {}

  /**
   * アセットを削除する
   * @returns 削除されたアセットのR2キー（R2からも削除するために使用）
   */
  async execute(assetId: string): Promise<string | null> {
    const id = AssetId.create(assetId);

    // アセットを取得
    const asset = await this.assetRepository.findById(id);
    if (!asset) {
      return null;
    }

    const r2Key = asset.getR2Key();

    // DBから削除
    await this.assetRepository.delete(id);

    return r2Key;
  }
}
