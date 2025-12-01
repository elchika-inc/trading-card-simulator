import type { GachaLog } from "./gacha-log";
import type { GachaPackId } from "./gacha-pack-id";

/**
 * GachaLogRepository Interface
 * ガチャログのリポジトリインターフェース
 */
export interface GachaLogRepository {
  save(log: GachaLog): Promise<void>;
  findByPackId(packId: GachaPackId, limit?: number): Promise<GachaLog[]>;
  countByPackId(packId: GachaPackId): Promise<number>;
}
