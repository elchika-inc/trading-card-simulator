import type { CardId } from "../card";
import type { GachaPack } from "./gacha-pack";
import type { GachaPackId } from "./gacha-pack-id";
import type { GachaRate } from "./gacha-rate";

/**
 * カード割当情報（パック視点）
 */
export interface CardRateInput {
  cardId: number;
  weight: number;
  isPickup: boolean;
}

/**
 * パック割当情報（カード視点）
 */
export interface PackRateInput {
  packId: string;
  weight: number;
  isPickup: boolean;
}

/**
 * GachaPackRepository Interface
 * ガチャパックのリポジトリインターフェース
 */
export interface GachaPackRepository {
  findById(id: GachaPackId): Promise<GachaPack | null>;
  findAll(): Promise<GachaPack[]>;
  findActive(): Promise<GachaPack[]>;
  findByGroupId(groupId: string): Promise<GachaPack[]>;
  save(pack: GachaPack): Promise<void>;
  updatePickupCards(packId: GachaPackId, cardIds: number[]): Promise<void>;
  /**
   * パック画像セットIDを更新
   */
  updatePackSetId(packId: GachaPackId, packSetId: string | null): Promise<void>;
  updatePackGroup(packId: GachaPackId, groupId: string | null): Promise<void>;
  /**
   * 1パックあたりの封入枚数を更新
   */
  updateCardsPerPack(packId: GachaPackId, cardsPerPack: number): Promise<void>;

  // ============================================================================
  // パック割当管理（双方向）
  // ============================================================================

  /**
   * カードIDで排出レートを取得（カード視点）
   */
  findRatesByCardId(cardId: CardId): Promise<GachaRate[]>;

  /**
   * パックIDで排出レートを取得（パック視点）
   */
  findRatesByPackId(packId: GachaPackId): Promise<GachaRate[]>;

  /**
   * カードの排出レートを更新（カード視点）
   * 既存のレートを全削除して新規挿入
   */
  updateCardRates(cardId: CardId, rates: PackRateInput[]): Promise<void>;

  /**
   * パックの排出レートを更新（パック視点）
   * 既存のレートを全削除して新規挿入
   */
  updatePackRates(packId: GachaPackId, rates: CardRateInput[]): Promise<void>;
}
