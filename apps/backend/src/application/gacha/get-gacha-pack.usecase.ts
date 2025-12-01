import { type GachaPack, GachaPackId, type GachaPackRepository } from "../../domain/gacha";

/**
 * GetGachaPackUseCase
 * 特定のガチャパックを取得するユースケース
 */
export class GetGachaPackUseCase {
  constructor(private readonly gachaPackRepository: GachaPackRepository) {}

  async execute(input: GetGachaPackInput): Promise<GetGachaPackOutput> {
    const packId = GachaPackId.create(input.packId);
    const pack = await this.gachaPackRepository.findById(packId);

    if (!pack) {
      return { pack: null };
    }

    return {
      pack: pack.toPlainObject(),
    };
  }
}

export interface GetGachaPackInput {
  packId: string;
}

export interface GetGachaPackOutput {
  pack: ReturnType<GachaPack["toPlainObject"]> | null;
}
