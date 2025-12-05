import type { NewsId, NewsRepository } from "../../domain/news";

/**
 * DeleteNewsUseCase
 * Newsを削除するユースケース
 * 削除時、news_cardsも自動的に削除される（CASCADE）
 */
export class DeleteNewsUseCase {
  constructor(private readonly newsRepository: NewsRepository) {}

  async execute(input: DeleteNewsInput): Promise<DeleteNewsOutput> {
    const existingNews = await this.newsRepository.findById(input.newsId);

    if (!existingNews) {
      return { success: false };
    }

    await this.newsRepository.delete(input.newsId);

    return { success: true };
  }
}

export interface DeleteNewsInput {
  newsId: NewsId;
}

export interface DeleteNewsOutput {
  success: boolean;
}
