import type { Card, CardId, CardRepository } from "../../domain/card";
import { type GachaPack, GachaPackId, type GachaPackRepository } from "../../domain/gacha";
import type { News, NewsId, NewsRepository } from "../../domain/news";

/**
 * GetNewsUseCase
 * News詳細（カード、パック含む）を取得するユースケース
 */
export class GetNewsUseCase {
  constructor(
    private readonly newsRepository: NewsRepository,
    private readonly cardRepository: CardRepository,
    private readonly gachaPackRepository: GachaPackRepository,
  ) {}

  async execute(input: GetNewsInput): Promise<GetNewsOutput> {
    const news = await this.newsRepository.findById(input.newsId);

    if (!news) {
      return { news: null, cards: [], packs: [] };
    }

    // カード詳細を取得（sort_order順を維持）
    const cardIds = news.getCardIds();
    const cards = await this.cardRepository.findByIds(
      cardIds.map((id) => ({ getValue: () => id }) as CardId),
    );
    // cardIds順にソート
    const sortedCards = cardIds
      .map((id) => cards.find((c) => c.toPlainObject().id === id))
      .filter((c): c is Card => c !== undefined);

    // パック詳細を取得（複数パック対応）
    const packIds = news.getPackIds();
    const packs: GachaPack[] = [];
    for (const packId of packIds) {
      const pack = await this.gachaPackRepository.findById(GachaPackId.create(packId));
      if (pack) {
        packs.push(pack);
      }
    }
    // packIds順にソート
    const sortedPacks = packIds
      .map((id) => packs.find((p) => p.toPlainObject().id === id))
      .filter((p): p is GachaPack => p !== undefined);

    return {
      news: news.toPlainObject(),
      cards: sortedCards.map((card) => card.toPlainObject()),
      packs: sortedPacks.map((pack) => pack.toPlainObject()),
    };
  }
}

export interface GetNewsInput {
  newsId: NewsId;
}

export interface GetNewsOutput {
  news: ReturnType<News["toPlainObject"]> | null;
  cards: ReturnType<Card["toPlainObject"]>[];
  packs: ReturnType<GachaPack["toPlainObject"]>[];
}
