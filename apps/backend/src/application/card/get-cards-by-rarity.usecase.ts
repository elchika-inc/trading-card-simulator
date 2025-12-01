import { type Card, type CardRepository, Rarity } from "../../domain/card";

/**
 * GetCardsByRarityUseCase
 * レアリティでカードを取得するユースケース
 */
export class GetCardsByRarityUseCase {
  constructor(private readonly cardRepository: CardRepository) {}

  async execute(input: GetCardsByRarityInput): Promise<GetCardsByRarityOutput> {
    const rarity = Rarity.create(input.rarity);
    const cards = await this.cardRepository.findByRarity(rarity);

    return {
      cards: cards.map((card) => card.toPlainObject()),
      total: cards.length,
    };
  }
}

export interface GetCardsByRarityInput {
  rarity: string;
}

export interface GetCardsByRarityOutput {
  cards: ReturnType<Card["toPlainObject"]>[];
  total: number;
}
