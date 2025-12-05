import { News } from "../../../domain/news";

/**
 * D1データベースのNewsレコード型
 * pack_idは削除され、news_packs中間テーブルで管理
 */
export interface NewsRow {
  id: string;
  title: string;
  subtitle: string | null;
  badge_text: string;
  banner_asset_id: string | null;
  is_active: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * News-Cards中間テーブルのレコード型
 */
export interface NewsCardRow {
  id: number;
  news_id: string;
  card_id: number;
  sort_order: number;
}

/**
 * News-Packs中間テーブルのレコード型
 */
export interface NewsPackRow {
  id: number;
  news_id: string;
  pack_id: string;
  sort_order: number;
}

/**
 * NewsMapper
 * DB Row ↔ Domain Entity の変換を行う
 */
export class NewsMapper {
  /**
   * NewsRow からDomain Entityに変換
   * @param row - DBから取得したNewsレコード
   * @param cardIds - 紐づくカードIDの配列（sort_order順）
   * @param packIds - 紐づくパックIDの配列（sort_order順）
   */
  static toDomain(row: NewsRow, cardIds: number[] = [], packIds: string[] = []): News {
    return News.reconstruct({
      id: row.id,
      title: row.title,
      subtitle: row.subtitle,
      badgeText: row.badge_text,
      packIds,
      bannerAssetId: row.banner_asset_id,
      isActive: row.is_active === 1,
      sortOrder: row.sort_order,
      cardIds,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  /**
   * News をDBレコードに変換
   * packIdsはnews_packsテーブルで別途管理
   */
  static toPersistence(news: News): NewsRow {
    const plain = news.toPlainObject();
    return {
      id: plain.id,
      title: plain.title,
      subtitle: plain.subtitle,
      badge_text: plain.badgeText,
      banner_asset_id: plain.bannerAssetId,
      is_active: plain.isActive ? 1 : 0,
      sort_order: plain.sortOrder,
      created_at: plain.createdAt,
      updated_at: plain.updatedAt,
    };
  }
}
