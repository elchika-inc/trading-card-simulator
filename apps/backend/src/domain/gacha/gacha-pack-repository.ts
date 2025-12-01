import type { GachaPack } from "./gacha-pack";
import type { GachaPackId } from "./gacha-pack-id";

/**
 * GachaPackRepository Interface
 * ガチャパックのリポジトリインターフェース
 */
export interface GachaPackRepository {
  findById(id: GachaPackId): Promise<GachaPack | null>;
  findAll(): Promise<GachaPack[]>;
  findActive(): Promise<GachaPack[]>;
  save(pack: GachaPack): Promise<void>;
}
