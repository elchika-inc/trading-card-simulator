import type { GachaPack, GachaPackRepository } from "../../domain/gacha";

/**
 * GetGachaPacksUseCase
 * アクティブなガチャパック一覧を取得するユースケース
 */
export class GetGachaPacksUseCase {
  constructor(private readonly gachaPackRepository: GachaPackRepository) {}

  async execute(): Promise<GetGachaPacksOutput> {
    const packs = await this.gachaPackRepository.findActive();

    return {
      packs: packs.map((pack) => pack.toPlainObject()),
    };
  }
}

export interface GetGachaPacksOutput {
  packs: ReturnType<GachaPack["toPlainObject"]>[];
}
