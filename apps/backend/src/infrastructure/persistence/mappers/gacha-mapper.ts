import { CardId } from "../../../domain/card";
import { GachaLog, GachaPack, GachaPackId, GachaRate, Weight } from "../../../domain/gacha";

/**
 * D1データベースのガチャパックレコード型
 */
export interface GachaPackRow {
  id: string;
  name: string;
  description: string | null;
  pack_image_url: string | null;
  cost: number;
  cards_per_pack: number;
  is_active: number;
  created_at: string;
}

/**
 * D1データベースのガチャレートレコード型
 */
export interface GachaRateRow {
  id: number;
  pack_id: string;
  card_id: number;
  weight: number;
  is_pickup: number;
}

/**
 * D1データベースのガチャログレコード型
 */
export interface GachaLogRow {
  id: string;
  pack_id: string;
  card_ids: string; // JSON array string
  executed_at: string;
}

/**
 * GachaMapper
 * DB Row ↔ Domain Entity の変換を行う
 */
export class GachaMapper {
  /**
   * GachaPackRow + GachaRateRow[] からDomain Entityに変換
   */
  static toGachaPackDomain(row: GachaPackRow, rateRows: GachaRateRow[]): GachaPack {
    const rates = rateRows.map((rateRow) =>
      GachaRate.create({
        id: rateRow.id,
        packId: GachaPackId.create(rateRow.pack_id),
        cardId: CardId.create(rateRow.card_id),
        weight: Weight.create(rateRow.weight),
        isPickup: rateRow.is_pickup === 1,
      }),
    );

    return GachaPack.reconstruct({
      id: row.id,
      name: row.name,
      description: row.description ?? "",
      packImageUrl: row.pack_image_url ?? "",
      cost: row.cost,
      cardsPerPack: row.cards_per_pack,
      isActive: row.is_active === 1,
      rates,
    });
  }

  /**
   * GachaLogRow からDomain Entityに変換
   */
  static toGachaLogDomain(row: GachaLogRow): GachaLog {
    const cardIds = JSON.parse(row.card_ids).map((id: number) => CardId.create(id));

    return GachaLog.reconstruct({
      id: row.id,
      packId: GachaPackId.create(row.pack_id),
      cardIds,
      executedAt: new Date(row.executed_at),
    });
  }

  /**
   * GachaLog をDBレコードに変換
   */
  static toGachaLogPersistence(
    log: GachaLog,
  ): Omit<GachaLogRow, "executed_at"> & { executed_at: string } {
    return {
      id: log.getId().getValue(),
      pack_id: log.getPackId().getValue(),
      card_ids: JSON.stringify(log.getCardIds().map((id) => id.getValue())),
      executed_at: log.getExecutedAt().toISOString(),
    };
  }
}
