import type { News, NewsRepository } from "../../domain/news";

/**
 * GetNewsListUseCase
 * News一覧を取得するユースケース
 */
export class GetNewsListUseCase {
  constructor(private readonly newsRepository: NewsRepository) {}

  async execute(input?: GetNewsListInput): Promise<GetNewsListOutput> {
    const newsList = input?.includeInactive
      ? await this.newsRepository.findAll()
      : await this.newsRepository.findActive();

    return {
      newsList: newsList.map((news) => news.toPlainObject()),
    };
  }
}

export interface GetNewsListInput {
  includeInactive?: boolean;
}

export interface GetNewsListOutput {
  newsList: ReturnType<News["toPlainObject"]>[];
}
