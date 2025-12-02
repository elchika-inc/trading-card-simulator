import type { CardId } from "../card";
import { GachaLog } from "./gacha-log";
import type { GachaPack } from "./gacha-pack";

/**
 * GachaService
 * ガチャ抽選ロジックを担当するDomain Service
 */
export class GachaService {
  /**
   * ガチャを実行してカードを抽選
   * @param pack ガチャパック
   * @returns 抽選されたカードIDの配列とガチャログ
   */
  draw(pack: GachaPack): { cardIds: CardId[]; log: GachaLog } {
    if (!pack.getIsActive()) {
      throw new Error("This gacha pack is not active");
    }

    const rates = pack.getRates();
    if (rates.length === 0) {
      throw new Error("This gacha pack has no cards");
    }

    const totalWeight = pack.getTotalWeight();
    const cardsPerPack = pack.getCardsPerPack();
    const drawnCardIds: CardId[] = [];

    for (let i = 0; i < cardsPerPack; i++) {
      const cardId = this.drawOne(rates, totalWeight);
      drawnCardIds.push(cardId);
    }

    const log = GachaLog.create(pack.getId(), drawnCardIds);

    return { cardIds: drawnCardIds, log };
  }

  /**
   * 1枚のカードを抽選
   */
  private drawOne(
    rates: { getCardId(): CardId; getWeight(): { getValue(): number } }[],
    totalWeight: number,
  ): CardId {
    const random = Math.random() * totalWeight;
    let cumulative = 0;

    for (const rate of rates) {
      cumulative += rate.getWeight().getValue();
      if (random < cumulative) {
        return rate.getCardId();
      }
    }

    // フォールバック（理論上は到達しない）
    // biome-ignore lint/style/noNonNullAssertion: rates.length > 0 は呼び出し元で保証
    return rates[rates.length - 1]!.getCardId();
  }
}
