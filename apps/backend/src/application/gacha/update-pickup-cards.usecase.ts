import { GachaPackId, type GachaPackRepository } from "../../domain/gacha";

/**
 * UpdatePickupCardsUseCase
 * パックのピックアップカードを更新するユースケース
 */
export class UpdatePickupCardsUseCase {
  constructor(private readonly gachaPackRepository: GachaPackRepository) {}

  async execute(input: UpdatePickupCardsInput): Promise<UpdatePickupCardsOutput> {
    const packId = GachaPackId.create(input.packId);

    // パックの存在確認
    const pack = await this.gachaPackRepository.findById(packId);
    if (!pack) {
      throw new Error("Gacha pack not found");
    }

    // ピックアップカードを更新
    await this.gachaPackRepository.updatePickupCards(packId, input.cardIds);

    return {
      packId: input.packId,
      cardIds: input.cardIds,
    };
  }
}

export interface UpdatePickupCardsInput {
  packId: string;
  cardIds: number[];
}

export interface UpdatePickupCardsOutput {
  packId: string;
  cardIds: number[];
}
