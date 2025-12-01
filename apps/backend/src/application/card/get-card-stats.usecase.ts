import type { CardRepository } from "../../domain/card";

/**
 * GetCardStatsUseCase
 * カードの統計情報を取得するユースケース
 */
export class GetCardStatsUseCase {
  constructor(private readonly cardRepository: CardRepository) {}

  async execute(): Promise<GetCardStatsOutput> {
    const [countByRarity, total] = await Promise.all([
      this.cardRepository.countByRarity(),
      this.cardRepository.count(),
    ]);

    return {
      stats: countByRarity,
      total,
    };
  }
}

export interface GetCardStatsOutput {
  stats: Record<string, number>;
  total: number;
}
