import { type Card, CardId, type CardRepository } from "../../domain/card";

/**
 * GetCardByIdUseCase
 * IDでカードを取得するユースケース
 */
export class GetCardByIdUseCase {
  constructor(private readonly cardRepository: CardRepository) {}

  async execute(input: GetCardByIdInput): Promise<GetCardByIdOutput> {
    const cardId = CardId.create(input.id);
    const card = await this.cardRepository.findById(cardId);

    if (!card) {
      return { card: null };
    }

    return {
      card: card.toPlainObject(),
    };
  }
}

export interface GetCardByIdInput {
  id: number;
}

export interface GetCardByIdOutput {
  card: ReturnType<Card["toPlainObject"]> | null;
}
