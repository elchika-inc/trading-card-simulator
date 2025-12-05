import type { News } from "./news";
import type { NewsId } from "./news-id";

/**
 * NewsRepository Interface
 * Newsのリポジトリインターフェース
 */
export interface NewsRepository {
  findById(id: NewsId): Promise<News | null>;
  findAll(): Promise<News[]>;
  findActive(): Promise<News[]>;
  save(news: News): Promise<void>;
  update(news: News): Promise<void>;
  delete(id: NewsId): Promise<void>;
}
