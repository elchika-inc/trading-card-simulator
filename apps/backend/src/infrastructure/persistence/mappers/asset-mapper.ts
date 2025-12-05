import { Asset } from "../../../domain/asset";

/**
 * D1データベースのアセットレコード型
 */
export interface AssetRow {
  id: string;
  type: string;
  original_name: string;
  content_type: string;
  size: number;
  r2_key: string;
  has_webp: number; // SQLite INTEGER (0 or 1)
  is_active: number; // SQLite INTEGER (0 or 1)
  created_at: string;
  updated_at: string;
}

/**
 * AssetMapper
 * DB Row ↔ Domain Entity の変換を行う
 */
export class AssetMapper {
  /**
   * DBレコードからDomain Entityに変換
   */
  static toDomain(row: AssetRow): Asset {
    return Asset.reconstruct({
      id: row.id,
      type: row.type,
      originalName: row.original_name,
      contentType: row.content_type,
      size: row.size,
      r2Key: row.r2_key,
      hasWebP: row.has_webp === 1,
      isActive: row.is_active === 1,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  /**
   * Domain EntityからDBレコードに変換（INSERT/UPDATE用）
   */
  static toPersistence(asset: Asset): Omit<AssetRow, "created_at" | "updated_at"> {
    return {
      id: asset.getId().getValue(),
      type: asset.getType().getValue(),
      original_name: asset.getOriginalName(),
      content_type: asset.getContentType(),
      size: asset.getSize(),
      r2_key: asset.getR2Key(),
      has_webp: asset.hasWebP() ? 1 : 0,
      is_active: asset.isActive() ? 1 : 0,
    };
  }

  /**
   * Domain EntityからDBレコードに変換（フル）
   */
  static toFullPersistence(asset: Asset): AssetRow {
    return {
      ...AssetMapper.toPersistence(asset),
      created_at: asset.getCreatedAt().toISOString(),
      updated_at: asset.getUpdatedAt().toISOString(),
    };
  }
}
