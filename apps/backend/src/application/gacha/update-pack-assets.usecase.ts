import { GachaPackId, type GachaPackRepository } from "../../domain/gacha";

/**
 * UpdatePackSetIdUseCase
 * パックの画像セットIDを更新するユースケース
 */
export class UpdatePackSetIdUseCase {
  constructor(private readonly gachaPackRepository: GachaPackRepository) {}

  async execute(input: UpdatePackSetIdInput): Promise<UpdatePackSetIdOutput> {
    const packId = GachaPackId.create(input.packId);

    // パックの存在確認
    const pack = await this.gachaPackRepository.findById(packId);
    if (!pack) {
      throw new Error("Gacha pack not found");
    }

    // 画像セットIDを更新
    await this.gachaPackRepository.updatePackSetId(packId, input.packSetId);

    return {
      packId: input.packId,
      packSetId: input.packSetId,
    };
  }
}

export interface UpdatePackSetIdInput {
  packId: string;
  packSetId: string | null;
}

export interface UpdatePackSetIdOutput {
  packId: string;
  packSetId: string | null;
}
