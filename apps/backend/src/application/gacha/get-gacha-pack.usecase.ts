import type { Card, CardRepository } from "../../domain/card";
import { CardId } from "../../domain/card";
import { type GachaPack, GachaPackId, type GachaPackRepository } from "../../domain/gacha";

/**
 * GetGachaPackUseCase
 * 特定のガチャパックを取得するユースケース
 * 注目カード（pickup）も含めて返す
 */
export class GetGachaPackUseCase {
  constructor(
    private readonly gachaPackRepository: GachaPackRepository,
    private readonly cardRepository: CardRepository,
  ) {}

  async execute(input: GetGachaPackInput): Promise<GetGachaPackOutput> {
    const packId = GachaPackId.create(input.packId);
    const pack = await this.gachaPackRepository.findById(packId);

    if (!pack) {
      return { pack: null, featuredCards: [] };
    }

    // ピックアップカードを取得
    const pickupCardIds = pack.getPickupCardIds();
    const featuredCards: Card[] = [];

    for (const cardIdValue of pickupCardIds) {
      const card = await this.cardRepository.findById(CardId.create(cardIdValue));
      if (card) {
        featuredCards.push(card);
      }
    }

    return {
      pack: pack.toPlainObject(),
      featuredCards: featuredCards.map((card) => card.toPlainObject()),
    };
  }
}

export interface GetGachaPackInput {
  packId: string;
}

export interface GetGachaPackOutput {
  pack: ReturnType<GachaPack["toPlainObject"]> | null;
  featuredCards: ReturnType<Card["toPlainObject"]>[];
}
