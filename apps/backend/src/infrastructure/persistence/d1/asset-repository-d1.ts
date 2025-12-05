import type { Asset, AssetId, AssetRepository, AssetType } from "../../../domain/asset";
import { AssetMapper, type AssetRow } from "../mappers/asset-mapper";

/**
 * D1AssetRepository
 * Cloudflare D1を使用したAssetRepositoryの実装
 */
export class D1AssetRepository implements AssetRepository {
  constructor(private readonly db: D1Database) {}

  async findById(id: AssetId): Promise<Asset | null> {
    const result = await this.db
      .prepare("SELECT * FROM assets WHERE id = ?")
      .bind(id.getValue())
      .first<AssetRow>();

    return result ? AssetMapper.toDomain(result) : null;
  }

  async findByType(type: AssetType): Promise<Asset[]> {
    const results = await this.db
      .prepare("SELECT * FROM assets WHERE type = ? ORDER BY created_at DESC")
      .bind(type.getValue())
      .all<AssetRow>();

    return results.results.map((row) => AssetMapper.toDomain(row));
  }

  async findActiveByType(type: AssetType): Promise<Asset | null> {
    const result = await this.db
      .prepare("SELECT * FROM assets WHERE type = ? AND is_active = 1 LIMIT 1")
      .bind(type.getValue())
      .first<AssetRow>();

    return result ? AssetMapper.toDomain(result) : null;
  }

  async findByR2Key(r2Key: string): Promise<Asset | null> {
    const result = await this.db
      .prepare("SELECT * FROM assets WHERE r2_key = ?")
      .bind(r2Key)
      .first<AssetRow>();

    return result ? AssetMapper.toDomain(result) : null;
  }

  async findAll(): Promise<Asset[]> {
    const results = await this.db
      .prepare("SELECT * FROM assets ORDER BY created_at DESC")
      .all<AssetRow>();

    return results.results.map((row) => AssetMapper.toDomain(row));
  }

  async save(asset: Asset): Promise<void> {
    const row = AssetMapper.toFullPersistence(asset);

    await this.db
      .prepare(
        `
        INSERT INTO assets
        (id, type, original_name, content_type, size, r2_key, has_webp, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          type = excluded.type,
          original_name = excluded.original_name,
          content_type = excluded.content_type,
          size = excluded.size,
          r2_key = excluded.r2_key,
          has_webp = excluded.has_webp,
          is_active = excluded.is_active,
          updated_at = excluded.updated_at
      `,
      )
      .bind(
        row.id,
        row.type,
        row.original_name,
        row.content_type,
        row.size,
        row.r2_key,
        row.has_webp,
        row.is_active,
        row.created_at,
        row.updated_at,
      )
      .run();
  }

  async delete(id: AssetId): Promise<void> {
    await this.db.prepare("DELETE FROM assets WHERE id = ?").bind(id.getValue()).run();
  }

  async deactivateAllByType(type: AssetType): Promise<void> {
    await this.db
      .prepare("UPDATE assets SET is_active = 0, updated_at = ? WHERE type = ? AND is_active = 1")
      .bind(new Date().toISOString(), type.getValue())
      .run();
  }

  async count(): Promise<number> {
    const result = await this.db
      .prepare("SELECT COUNT(*) as count FROM assets")
      .first<{ count: number }>();

    return result?.count ?? 0;
  }

  async countByType(): Promise<Record<string, number>> {
    const results = await this.db
      .prepare("SELECT type, COUNT(*) as count FROM assets GROUP BY type ORDER BY type")
      .all<{ type: string; count: number }>();

    return results.results.reduce(
      (acc, row) => {
        acc[row.type] = row.count;
        return acc;
      },
      {} as Record<string, number>,
    );
  }
}
