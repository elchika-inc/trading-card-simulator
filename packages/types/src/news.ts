import type { Card } from "./card";
import type { GachaPack, GachaPackWithAssets } from "./gacha-pack";

/**
 * Newsの型定義
 * ランディングページのカルーセル用
 */
export interface News {
  id: string;
  title: string;
  subtitle: string | null;
  badgeText: string;
  packIds: string[];
  bannerAssetId: string | null;
  isActive: boolean;
  sortOrder: number;
  cardIds: number[];
  createdAt: string;
  updatedAt: string;
}

/**
 * カード・パック詳細付きNews
 * packsにはアセットURL（frontImageUrl, backImageUrl）が解決済み
 */
export interface NewsWithDetails extends News {
  cards: Card[];
  packs: GachaPackWithAssets[];
  bannerUrl: string | null;
}

/**
 * News一覧APIレスポンス
 */
export interface NewsListResponse {
  newsList: News[];
  timestamp: string;
}

/**
 * News詳細APIレスポンス
 */
export interface NewsDetailResponse {
  news: News;
  cards: Card[];
  packs: GachaPack[];
  timestamp: string;
}

/**
 * News作成リクエスト
 */
export interface NewsCreateRequest {
  title: string;
  subtitle?: string | null;
  badgeText?: string;
  packIds?: string[];
  bannerAssetId?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  cardIds?: number[];
}

/**
 * News更新リクエスト
 */
export interface NewsUpdateRequest {
  title?: string;
  subtitle?: string | null;
  badgeText?: string;
  packIds?: string[];
  bannerAssetId?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  cardIds?: number[];
}

/**
 * News作成/更新レスポンス
 */
export interface NewsMutationResponse {
  news: News;
  timestamp: string;
}
