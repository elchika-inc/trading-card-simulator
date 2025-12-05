import type { PackGroup } from "./pack-group";
import type { PackGroupId } from "./pack-group-id";

/**
 * PackGroupRepository Interface
 * パックグループのリポジトリインターフェース
 */
export interface PackGroupRepository {
  findById(id: PackGroupId): Promise<PackGroup | null>;
  findAll(): Promise<PackGroup[]>;
  findActive(): Promise<PackGroup[]>;
  save(group: PackGroup): Promise<void>;
  update(group: PackGroup): Promise<void>;
  delete(id: PackGroupId): Promise<void>;
}
