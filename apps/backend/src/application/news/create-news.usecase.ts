import { v4 as uuidv4 } from "uuid";
import { News, type NewsRepository } from "../../domain/news";

/**
 * CreateNewsUseCase
 * Newsを作成するユースケース
 */
export class CreateNewsUseCase {
  constructor(private readonly newsRepository: NewsRepository) {}

  async execute(input: CreateNewsInput): Promise<CreateNewsOutput> {
    const news = News.create({
      id: uuidv4(),
      title: input.title,
      subtitle: input.subtitle ?? null,
      badgeText: input.badgeText ?? "NEW",
      packIds: input.packIds ?? [],
      bannerAssetId: input.bannerAssetId ?? null,
      isActive: input.isActive ?? true,
      sortOrder: input.sortOrder ?? 0,
      cardIds: input.cardIds ?? [],
    });

    await this.newsRepository.save(news);

    return {
      news: news.toPlainObject(),
    };
  }
}

export interface CreateNewsInput {
  title: string;
  subtitle?: string | null;
  badgeText?: string;
  packIds?: string[];
  bannerAssetId?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  cardIds?: number[];
}

export interface CreateNewsOutput {
  news: ReturnType<News["toPlainObject"]>;
}
