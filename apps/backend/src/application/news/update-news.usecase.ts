import { News, type NewsId, type NewsRepository } from "../../domain/news";

/**
 * UpdateNewsUseCase
 * Newsを更新するユースケース
 */
export class UpdateNewsUseCase {
  constructor(private readonly newsRepository: NewsRepository) {}

  async execute(input: UpdateNewsInput): Promise<UpdateNewsOutput> {
    const existingNews = await this.newsRepository.findById(input.newsId);

    if (!existingNews) {
      return { news: null, success: false };
    }

    const existing = existingNews.toPlainObject();

    const updatedNews = News.reconstruct({
      id: existing.id,
      title: input.title ?? existing.title,
      subtitle: input.subtitle !== undefined ? input.subtitle : existing.subtitle,
      badgeText: input.badgeText ?? existing.badgeText,
      packIds: input.packIds !== undefined ? input.packIds : existing.packIds,
      bannerAssetId:
        input.bannerAssetId !== undefined ? input.bannerAssetId : existing.bannerAssetId,
      isActive: input.isActive !== undefined ? input.isActive : existing.isActive,
      sortOrder: input.sortOrder !== undefined ? input.sortOrder : existing.sortOrder,
      cardIds: input.cardIds !== undefined ? input.cardIds : existing.cardIds,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.newsRepository.update(updatedNews);

    return {
      news: updatedNews.toPlainObject(),
      success: true,
    };
  }
}

export interface UpdateNewsInput {
  newsId: NewsId;
  title?: string;
  subtitle?: string | null;
  badgeText?: string;
  packIds?: string[];
  bannerAssetId?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  cardIds?: number[];
}

export interface UpdateNewsOutput {
  news: ReturnType<News["toPlainObject"]> | null;
  success: boolean;
}
