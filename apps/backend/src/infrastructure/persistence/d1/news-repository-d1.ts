import type { News, NewsId, NewsRepository } from "../../../domain/news";
import { NewsMapper, type NewsRow } from "../mappers/news-mapper";

/**
 * D1NewsRepository
 * Cloudflare D1を使用したNewsRepositoryの実装
 */
export class D1NewsRepository implements NewsRepository {
  constructor(private readonly db: D1Database) {}

  async findById(id: NewsId): Promise<News | null> {
    const row = await this.db
      .prepare("SELECT * FROM news WHERE id = ?")
      .bind(id.getValue())
      .first<NewsRow>();

    if (!row) {
      return null;
    }

    const cardIds = await this.getCardIds(id.getValue());
    const packIds = await this.getPackIds(id.getValue());
    return NewsMapper.toDomain(row, cardIds, packIds);
  }

  async findAll(): Promise<News[]> {
    const result = await this.db
      .prepare("SELECT * FROM news ORDER BY sort_order, created_at DESC")
      .all<NewsRow>();

    const newsWithRelations = await Promise.all(
      result.results.map(async (row) => {
        const cardIds = await this.getCardIds(row.id);
        const packIds = await this.getPackIds(row.id);
        return NewsMapper.toDomain(row, cardIds, packIds);
      }),
    );

    return newsWithRelations;
  }

  async findActive(): Promise<News[]> {
    const result = await this.db
      .prepare("SELECT * FROM news WHERE is_active = 1 ORDER BY sort_order, created_at DESC")
      .all<NewsRow>();

    const newsWithRelations = await Promise.all(
      result.results.map(async (row) => {
        const cardIds = await this.getCardIds(row.id);
        const packIds = await this.getPackIds(row.id);
        return NewsMapper.toDomain(row, cardIds, packIds);
      }),
    );

    return newsWithRelations;
  }

  async save(news: News): Promise<void> {
    const row = NewsMapper.toPersistence(news);

    await this.db
      .prepare(
        `INSERT INTO news
         (id, title, subtitle, badge_text, banner_asset_id, is_active, sort_order, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        row.id,
        row.title,
        row.subtitle,
        row.badge_text,
        row.banner_asset_id,
        row.is_active,
        row.sort_order,
        row.created_at,
        row.updated_at,
      )
      .run();

    // News-Cards紐づけを保存
    await this.saveCardIds(news.getId().getValue(), news.getCardIds());
    // News-Packs紐づけを保存
    await this.savePackIds(news.getId().getValue(), news.getPackIds());
  }

  async update(news: News): Promise<void> {
    const row = NewsMapper.toPersistence(news);
    const now = new Date().toISOString();

    await this.db
      .prepare(
        `UPDATE news
         SET title = ?, subtitle = ?, badge_text = ?, banner_asset_id = ?, is_active = ?, sort_order = ?, updated_at = ?
         WHERE id = ?`,
      )
      .bind(
        row.title,
        row.subtitle,
        row.badge_text,
        row.banner_asset_id,
        row.is_active,
        row.sort_order,
        now,
        row.id,
      )
      .run();

    // News-Cards紐づけを更新（削除→再挿入）
    await this.deleteCardIds(row.id);
    await this.saveCardIds(row.id, news.getCardIds());

    // News-Packs紐づけを更新（削除→再挿入）
    await this.deletePackIds(row.id);
    await this.savePackIds(row.id, news.getPackIds());
  }

  async delete(id: NewsId): Promise<void> {
    // news_cards, news_packsはCASCADEで自動削除される
    await this.db.prepare("DELETE FROM news WHERE id = ?").bind(id.getValue()).run();
  }

  /**
   * Newsに紐づくカードIDを取得（sort_order順）
   */
  private async getCardIds(newsId: string): Promise<number[]> {
    const result = await this.db
      .prepare("SELECT card_id FROM news_cards WHERE news_id = ? ORDER BY sort_order")
      .bind(newsId)
      .all<{ card_id: number }>();

    return result.results.map((row) => row.card_id);
  }

  /**
   * News-Cards紐づけを保存
   */
  private async saveCardIds(newsId: string, cardIds: number[]): Promise<void> {
    for (let i = 0; i < cardIds.length; i++) {
      await this.db
        .prepare("INSERT INTO news_cards (news_id, card_id, sort_order) VALUES (?, ?, ?)")
        .bind(newsId, cardIds[i], i)
        .run();
    }
  }

  /**
   * News-Cards紐づけを削除
   */
  private async deleteCardIds(newsId: string): Promise<void> {
    await this.db.prepare("DELETE FROM news_cards WHERE news_id = ?").bind(newsId).run();
  }

  /**
   * Newsに紐づくパックIDを取得（sort_order順）
   */
  private async getPackIds(newsId: string): Promise<string[]> {
    const result = await this.db
      .prepare("SELECT pack_id FROM news_packs WHERE news_id = ? ORDER BY sort_order")
      .bind(newsId)
      .all<{ pack_id: string }>();

    return result.results.map((row) => row.pack_id);
  }

  /**
   * News-Packs紐づけを保存
   */
  private async savePackIds(newsId: string, packIds: string[]): Promise<void> {
    for (let i = 0; i < packIds.length; i++) {
      await this.db
        .prepare("INSERT INTO news_packs (news_id, pack_id, sort_order) VALUES (?, ?, ?)")
        .bind(newsId, packIds[i], i)
        .run();
    }
  }

  /**
   * News-Packs紐づけを削除
   */
  private async deletePackIds(newsId: string): Promise<void> {
    await this.db.prepare("DELETE FROM news_packs WHERE news_id = ?").bind(newsId).run();
  }
}
