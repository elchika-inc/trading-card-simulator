import { PackGroup } from "../../../domain/gacha";

/**
 * D1データベースのパックグループレコード型
 */
export interface PackGroupRow {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color_from: string;
  color_to: string;
  is_active: number;
  sort_order: number;
  created_at: string;
}

/**
 * PackGroupMapper
 * DB Row ↔ Domain Entity の変換を行う
 */
export class PackGroupMapper {
  /**
   * PackGroupRow からDomain Entityに変換
   */
  static toDomain(row: PackGroupRow): PackGroup {
    return PackGroup.reconstruct({
      id: row.id,
      name: row.name,
      description: row.description,
      icon: row.icon,
      colorFrom: row.color_from,
      colorTo: row.color_to,
      isActive: row.is_active === 1,
      sortOrder: row.sort_order,
      createdAt: row.created_at,
    });
  }

  /**
   * PackGroup をDBレコードに変換
   */
  static toPersistence(group: PackGroup): PackGroupRow {
    const plain = group.toPlainObject();
    return {
      id: plain.id,
      name: plain.name,
      description: plain.description,
      icon: plain.icon,
      color_from: plain.colorFrom,
      color_to: plain.colorTo,
      is_active: plain.isActive ? 1 : 0,
      sort_order: plain.sortOrder,
      created_at: plain.createdAt,
    };
  }
}
