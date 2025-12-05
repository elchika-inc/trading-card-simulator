import type { AssetRecord } from "@repo/types";
import { AssetId, type AssetRepository, AssetType } from "../../domain/asset";

/**
 * GetAssetUseCase
 * アセットを取得するユースケース
 */
export class GetAssetUseCase {
  constructor(private readonly assetRepository: AssetRepository) {}

  /**
   * IDでアセットを取得
   */
  async getById(assetId: string): Promise<AssetRecord | null> {
    const id = AssetId.create(assetId);
    const asset = await this.assetRepository.findById(id);

    if (!asset) {
      return null;
    }

    return this.toRecord(asset);
  }

  /**
   * 種類でアクティブなアセットを取得
   */
  async getActiveByType(type: string): Promise<AssetRecord | null> {
    const assetType = AssetType.create(type);
    const asset = await this.assetRepository.findActiveByType(assetType);

    if (!asset) {
      return null;
    }

    return this.toRecord(asset);
  }

  /**
   * 種類でアセット一覧を取得
   */
  async getByType(type: string): Promise<AssetRecord[]> {
    const assetType = AssetType.create(type);
    const assets = await this.assetRepository.findByType(assetType);

    return assets.map((asset) => this.toRecord(asset));
  }

  private toRecord(
    asset: ReturnType<typeof AssetId.create> extends AssetId
      ? import("../../domain/asset").Asset
      : never,
  ): AssetRecord {
    const plain = asset.toPlainObject();
    return {
      id: plain.id,
      type: plain.type,
      originalName: plain.originalName,
      contentType: plain.contentType,
      size: plain.size,
      r2Key: plain.r2Key,
      hasWebP: plain.hasWebP,
      isActive: plain.isActive,
      createdAt: plain.createdAt,
      updatedAt: plain.updatedAt,
    };
  }
}
