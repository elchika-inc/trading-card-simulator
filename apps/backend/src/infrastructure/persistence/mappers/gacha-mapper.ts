import { CardId } from "../../../domain/card";
import { GachaLog, GachaPack, GachaPackId, GachaRate, Weight } from "../../../domain/gacha";

/**
 * D1データベースのガチャパックレコード型
 */
export interface GachaPackRow {
  id: string;
  name: string;
  description: string | null;
  /** パック画像セットID（表面・裏面をまとめて管理） */
  pack_set_id: string | null;
  cost: number;
  cards_per_pack: number;
  is_active: number;
  group_id: string | null;
  created_at: string;
  // UI表示用カラム
  sub_title: string | null;
  contents_info: string | null;
  color_from: string | null;
  color_to: string | null;
  accent_color: string | null;
  icon: string | null;
  rare_rate: string | null;
  back_title: string | null;
  feature_title: string | null;
  sort_order: number | null;
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
      packSetId: row.pack_set_id,
      cost: row.cost,
      cardsPerPack: row.cards_per_pack,
      isActive: row.is_active === 1,
      rates,
      groupId: row.group_id,
      // UI表示用プロパティ
      subTitle: row.sub_title ?? undefined,
      contentsInfo: row.contents_info ?? undefined,
      colorFrom: row.color_from ?? undefined,
      colorTo: row.color_to ?? undefined,
      accentColor: row.accent_color ?? undefined,
      icon: row.icon ?? undefined,
      rareRate: row.rare_rate ?? undefined,
      backTitle: row.back_title ?? undefined,
      featureTitle: row.feature_title ?? undefined,
      sortOrder: row.sort_order ?? undefined,
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

  /**
   * GachaRateRow からDomain Entityに変換
   */
  static toGachaRateDomain(row: GachaRateRow): GachaRate {
    return GachaRate.create({
      id: row.id,
      packId: GachaPackId.create(row.pack_id),
      cardId: CardId.create(row.card_id),
      weight: Weight.create(row.weight),
      isPickup: row.is_pickup === 1,
    });
  }
}
