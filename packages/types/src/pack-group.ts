import type { GachaPackWithAssets } from "./gacha-pack";

/**
 * パックグループの型定義
 * パックをシリーズ/期間別にグループ化
 */
export interface PackGroup {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  colorFrom: string;
  colorTo: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

/**
 * パック一覧付きパックグループ
 */
export interface PackGroupWithPacks extends PackGroup {
  packs: GachaPackWithAssets[];
}

/**
 * パックグループ一覧APIレスポンス
 */
export interface PackGroupListResponse {
  groups: PackGroup[];
  total: number;
  timestamp: string;
}

/**
 * パックグループ詳細APIレスポンス（パック含む）
 */
export interface PackGroupDetailResponse {
  group: PackGroupWithPacks;
  timestamp: string;
}

/**
 * パックグループ作成リクエスト
 */
export interface PackGroupCreateRequest {
  name: string;
  description?: string | null;
  icon?: string;
  colorFrom?: string;
  colorTo?: string;
  isActive?: boolean;
  sortOrder?: number;
}

/**
 * パックグループ更新リクエスト
 */
export interface PackGroupUpdateRequest {
  name?: string;
  description?: string | null;
  icon?: string;
  colorFrom?: string;
  colorTo?: string;
  isActive?: boolean;
  sortOrder?: number;
}

/**
 * パックグループ作成/更新レスポンス
 */
export interface PackGroupMutationResponse {
  group: PackGroup;
  timestamp: string;
}

/**
 * パックのグループ割り当てリクエスト
 */
export interface AssignPackToGroupRequest {
  groupId: string | null;
}
