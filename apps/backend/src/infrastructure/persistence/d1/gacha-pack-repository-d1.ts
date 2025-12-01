import type { GachaPack, GachaPackId, GachaPackRepository } from "../../../domain/gacha";
import { GachaMapper, type GachaPackRow, type GachaRateRow } from "../mappers/gacha-mapper";

/**
 * D1GachaPackRepository
 * Cloudflare D1を使用したGachaPackRepositoryの実装
 */
export class D1GachaPackRepository implements GachaPackRepository {
  constructor(private readonly db: D1Database) {}

  async findById(id: GachaPackId): Promise<GachaPack | null> {
    const packRow = await this.db
      .prepare("SELECT * FROM gacha_packs WHERE id = ?")
      .bind(id.getValue())
      .first<GachaPackRow>();

    if (!packRow) {
      return null;
    }

    const rateRows = await this.db
      .prepare("SELECT * FROM gacha_rates WHERE pack_id = ?")
      .bind(id.getValue())
      .all<GachaRateRow>();

    return GachaMapper.toGachaPackDomain(packRow, rateRows.results);
  }

  async findAll(): Promise<GachaPack[]> {
    const packRows = await this.db
      .prepare("SELECT * FROM gacha_packs ORDER BY id")
      .all<GachaPackRow>();

    const packs: GachaPack[] = [];

    for (const packRow of packRows.results) {
      const rateRows = await this.db
        .prepare("SELECT * FROM gacha_rates WHERE pack_id = ?")
        .bind(packRow.id)
        .all<GachaRateRow>();

      packs.push(GachaMapper.toGachaPackDomain(packRow, rateRows.results));
    }

    return packs;
  }

  async findActive(): Promise<GachaPack[]> {
    const packRows = await this.db
      .prepare("SELECT * FROM gacha_packs WHERE is_active = 1 ORDER BY id")
      .all<GachaPackRow>();

    const packs: GachaPack[] = [];

    for (const packRow of packRows.results) {
      const rateRows = await this.db
        .prepare("SELECT * FROM gacha_rates WHERE pack_id = ?")
        .bind(packRow.id)
        .all<GachaRateRow>();

      packs.push(GachaMapper.toGachaPackDomain(packRow, rateRows.results));
    }

    return packs;
  }

  async save(pack: GachaPack): Promise<void> {
    const plain = pack.toPlainObject();

    await this.db
      .prepare(
        `
        INSERT OR REPLACE INTO gacha_packs
        (id, name, description, pack_image_url, cost, cards_per_pack, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      )
      .bind(
        plain.id,
        plain.name,
        plain.description || null,
        plain.packImageUrl || null,
        plain.cost,
        plain.cardsPerPack,
        plain.isActive ? 1 : 0,
      )
      .run();
  }
}
