import type { CardId } from "../../../domain/card";
import type {
  CardRateInput,
  GachaPack,
  GachaPackId,
  GachaPackRepository,
  GachaRate,
  PackRateInput,
} from "../../../domain/gacha";
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
      .prepare("SELECT * FROM gacha_packs ORDER BY sort_order, id")
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
      .prepare("SELECT * FROM gacha_packs WHERE is_active = 1 ORDER BY sort_order, id")
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
        (id, name, description, pack_set_id, cost, cards_per_pack, is_active, group_id,
         sub_title, contents_info, color_from, color_to, accent_color, icon, rare_rate, back_title, feature_title, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      )
      .bind(
        plain.id,
        plain.name,
        plain.description || null,
        plain.packSetId || null,
        plain.cost,
        plain.cardsPerPack,
        plain.isActive ? 1 : 0,
        plain.groupId || null,
        plain.subTitle || null,
        plain.contentsInfo || null,
        plain.colorFrom || null,
        plain.colorTo || null,
        plain.accentColor || null,
        plain.icon || null,
        plain.rareRate || null,
        plain.backTitle || null,
        plain.featureTitle || null,
        plain.sortOrder || 0,
      )
      .run();
  }

  async findByGroupId(groupId: string): Promise<GachaPack[]> {
    const packRows = await this.db
      .prepare(
        "SELECT * FROM gacha_packs WHERE group_id = ? AND is_active = 1 ORDER BY sort_order, id",
      )
      .bind(groupId)
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

  async updatePackGroup(packId: GachaPackId, groupId: string | null): Promise<void> {
    await this.db
      .prepare("UPDATE gacha_packs SET group_id = ? WHERE id = ?")
      .bind(groupId, packId.getValue())
      .run();
  }

  async updatePickupCards(packId: GachaPackId, cardIds: number[]): Promise<void> {
    const packIdValue = packId.getValue();

    // まず該当パックの全カードのis_pickupをリセット
    await this.db
      .prepare("UPDATE gacha_rates SET is_pickup = 0 WHERE pack_id = ?")
      .bind(packIdValue)
      .run();

    // 指定されたカードIDをピックアップに設定
    if (cardIds.length > 0) {
      const placeholders = cardIds.map(() => "?").join(", ");
      await this.db
        .prepare(
          `UPDATE gacha_rates SET is_pickup = 1 WHERE pack_id = ? AND card_id IN (${placeholders})`,
        )
        .bind(packIdValue, ...cardIds)
        .run();
    }
  }

  /**
   * パック画像セットIDを更新
   */
  async updatePackSetId(packId: GachaPackId, packSetId: string | null): Promise<void> {
    await this.db
      .prepare("UPDATE gacha_packs SET pack_set_id = ? WHERE id = ?")
      .bind(packSetId, packId.getValue())
      .run();
  }

  /**
   * 1パックあたりの封入枚数を更新
   */
  async updateCardsPerPack(packId: GachaPackId, cardsPerPack: number): Promise<void> {
    await this.db
      .prepare("UPDATE gacha_packs SET cards_per_pack = ? WHERE id = ?")
      .bind(cardsPerPack, packId.getValue())
      .run();
  }

  // ============================================================================
  // パック割当管理（双方向）
  // ============================================================================

  /**
   * カードIDで排出レートを取得（カード視点）
   */
  async findRatesByCardId(cardId: CardId): Promise<GachaRate[]> {
    const rateRows = await this.db
      .prepare("SELECT * FROM gacha_rates WHERE card_id = ?")
      .bind(cardId.getValue())
      .all<GachaRateRow>();

    return rateRows.results.map((row) => GachaMapper.toGachaRateDomain(row));
  }

  /**
   * パックIDで排出レートを取得（パック視点）
   */
  async findRatesByPackId(packId: GachaPackId): Promise<GachaRate[]> {
    const rateRows = await this.db
      .prepare("SELECT * FROM gacha_rates WHERE pack_id = ?")
      .bind(packId.getValue())
      .all<GachaRateRow>();

    return rateRows.results.map((row) => GachaMapper.toGachaRateDomain(row));
  }

  /**
   * カードの排出レートを更新（カード視点）
   * 既存のレートを全削除して新規挿入
   */
  async updateCardRates(cardId: CardId, rates: PackRateInput[]): Promise<void> {
    const cardIdValue = cardId.getValue();

    // 既存のレートを全削除
    await this.db.prepare("DELETE FROM gacha_rates WHERE card_id = ?").bind(cardIdValue).run();

    // 新規挿入
    for (const rate of rates) {
      await this.db
        .prepare(
          "INSERT INTO gacha_rates (pack_id, card_id, weight, is_pickup) VALUES (?, ?, ?, ?)",
        )
        .bind(rate.packId, cardIdValue, rate.weight, rate.isPickup ? 1 : 0)
        .run();
    }
  }

  /**
   * パックの排出レートを更新（パック視点）
   * 既存のレートを全削除して新規挿入
   */
  async updatePackRates(packId: GachaPackId, rates: CardRateInput[]): Promise<void> {
    const packIdValue = packId.getValue();

    // 既存のレートを全削除
    await this.db.prepare("DELETE FROM gacha_rates WHERE pack_id = ?").bind(packIdValue).run();

    // 新規挿入
    for (const rate of rates) {
      await this.db
        .prepare(
          "INSERT INTO gacha_rates (pack_id, card_id, weight, is_pickup) VALUES (?, ?, ?, ?)",
        )
        .bind(packIdValue, rate.cardId, rate.weight, rate.isPickup ? 1 : 0)
        .run();
    }
  }
}
