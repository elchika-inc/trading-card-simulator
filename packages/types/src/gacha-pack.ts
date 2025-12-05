import type { Card } from "./card";

/**
 * ガチャパックの型定義
 * APIから取得するパックデータの型
 */
export interface GachaPack {
  id: string;
  name: string;
  description: string;
  /** パック画像セットID（表面・裏面をまとめて管理） */
  packSetId: string | null;
  cost: number;
  cardsPerPack: number;
  isActive: boolean;
  totalWeight: number;
  /** 所属するパックグループのID */
  groupId: string | null;
  // UI表示用プロパティ
  subTitle: string;
  contentsInfo: string;
  colorFrom: string;
  colorTo: string;
  accentColor: string;
  icon: string;
  rareRate: string;
  backTitle: string;
  featureTitle: string;
  sortOrder: number;
}

/**
 * パック一覧APIレスポンス
 */
export interface GachaPackListResponse {
  packs: GachaPack[];
  total: number;
  timestamp: string;
}

/**
 * パック詳細APIレスポンス
 */
export interface GachaPackDetailResponse {
  pack: GachaPack;
  timestamp: string;
}

/**
 * フロントエンド表示用のパックデータ
 * APIレスポンスに画像URLを追加したもの
 */
export interface GachaPackWithAssets extends GachaPack {
  /** パック表面画像URL */
  frontImageUrl?: string;
  /** パック裏面画像URL */
  backImageUrl?: string;
  /** 注目カード一覧 */
  featuredCards?: Card[];
}
