import type { PackGroup, PackGroupId, PackGroupRepository } from "../../../domain/gacha";
import { PackGroupMapper, type PackGroupRow } from "../mappers/pack-group-mapper";

/**
 * D1PackGroupRepository
 * Cloudflare D1を使用したPackGroupRepositoryの実装
 */
export class D1PackGroupRepository implements PackGroupRepository {
  constructor(private readonly db: D1Database) {}

  async findById(id: PackGroupId): Promise<PackGroup | null> {
    const row = await this.db
      .prepare("SELECT * FROM pack_groups WHERE id = ?")
      .bind(id.getValue())
      .first<PackGroupRow>();

    if (!row) {
      return null;
    }

    return PackGroupMapper.toDomain(row);
  }

  async findAll(): Promise<PackGroup[]> {
    const result = await this.db
      .prepare("SELECT * FROM pack_groups ORDER BY sort_order, name")
      .all<PackGroupRow>();

    return result.results.map((row) => PackGroupMapper.toDomain(row));
  }

  async findActive(): Promise<PackGroup[]> {
    const result = await this.db
      .prepare("SELECT * FROM pack_groups WHERE is_active = 1 ORDER BY sort_order, name")
      .all<PackGroupRow>();

    return result.results.map((row) => PackGroupMapper.toDomain(row));
  }

  async save(group: PackGroup): Promise<void> {
    const row = PackGroupMapper.toPersistence(group);

    await this.db
      .prepare(
        `INSERT INTO pack_groups
         (id, name, description, icon, color_from, color_to, is_active, sort_order, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        row.id,
        row.name,
        row.description,
        row.icon,
        row.color_from,
        row.color_to,
        row.is_active,
        row.sort_order,
        row.created_at,
      )
      .run();
  }

  async update(group: PackGroup): Promise<void> {
    const row = PackGroupMapper.toPersistence(group);

    await this.db
      .prepare(
        `UPDATE pack_groups
         SET name = ?, description = ?, icon = ?, color_from = ?, color_to = ?, is_active = ?, sort_order = ?
         WHERE id = ?`,
      )
      .bind(
        row.name,
        row.description,
        row.icon,
        row.color_from,
        row.color_to,
        row.is_active,
        row.sort_order,
        row.id,
      )
      .run();
  }

  async delete(id: PackGroupId): Promise<void> {
    // まず、このグループに属するパックのgroup_idをNULLに更新
    await this.db
      .prepare("UPDATE gacha_packs SET group_id = NULL WHERE group_id = ?")
      .bind(id.getValue())
      .run();

    // グループを削除
    await this.db.prepare("DELETE FROM pack_groups WHERE id = ?").bind(id.getValue()).run();
  }
}
