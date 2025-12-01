import type { Card, CardRepository } from "../../domain/card";

/**
 * GetAllCardsUseCase
 * 全カードを取得するユースケース
 */
export class GetAllCardsUseCase {
  constructor(private readonly cardRepository: CardRepository) {}

  async execute(): Promise<GetAllCardsOutput> {
    const cards = await this.cardRepository.findAll();

    return {
      cards: cards.map((card) => card.toPlainObject()),
      total: cards.length,
    };
  }
}

export interface GetAllCardsOutput {
  cards: ReturnType<Card["toPlainObject"]>[];
  total: number;
}
