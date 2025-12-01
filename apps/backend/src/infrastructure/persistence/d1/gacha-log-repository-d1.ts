import type { GachaLog, GachaLogRepository, GachaPackId } from "../../../domain/gacha";
import { type GachaLogRow, GachaMapper } from "../mappers/gacha-mapper";

/**
 * D1GachaLogRepository
 * Cloudflare D1を使用したGachaLogRepositoryの実装
 */
export class D1GachaLogRepository implements GachaLogRepository {
  constructor(private readonly db: D1Database) {}

  async save(log: GachaLog): Promise<void> {
    const row = GachaMapper.toGachaLogPersistence(log);

    await this.db
      .prepare(
        `
        INSERT INTO gacha_logs (id, pack_id, card_ids, executed_at)
        VALUES (?, ?, ?, ?)
      `,
      )
      .bind(row.id, row.pack_id, row.card_ids, row.executed_at)
      .run();
  }

  async findByPackId(packId: GachaPackId, limit = 100): Promise<GachaLog[]> {
    const rows = await this.db
      .prepare(
        `
        SELECT * FROM gacha_logs
        WHERE pack_id = ?
        ORDER BY executed_at DESC
        LIMIT ?
      `,
      )
      .bind(packId.getValue(), limit)
      .all<GachaLogRow>();

    return rows.results.map((row) => GachaMapper.toGachaLogDomain(row));
  }

  async countByPackId(packId: GachaPackId): Promise<number> {
    const result = await this.db
      .prepare("SELECT COUNT(*) as count FROM gacha_logs WHERE pack_id = ?")
      .bind(packId.getValue())
      .first<{ count: number }>();

    return result?.count ?? 0;
  }
}
