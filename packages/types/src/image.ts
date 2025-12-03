/**
 * 画像関連の型定義
 */

/**
 * 画像メタデータ
 */
export interface ImageMetadata {
  id: string;
  url: string;
  thumbnailUrl: string;
  originalName: string;
  contentType: string;
  size: number;
  uploadedAt: string;
  hasWebP?: boolean;
  metadata?: {
    width?: number;
    height?: number;
    alt?: string;
    tags?: string[];
  };
}

/**
 * 画像アップロードリクエスト
 */
export interface ImageUploadRequest {
  file: File;
  metadata?: {
    originalName?: string;
    alt?: string;
    tags?: string[];
  };
}

/**
 * 画像アップロードレスポンス
 */
export interface ImageUploadResponse {
  success: true;
  data: ImageMetadata;
}

/**
 * 一括画像アップロードレスポンス
 */
export interface ImageBulkUploadResponse {
  success: true;
  data: {
    uploaded: ImageMetadata[];
    failed: Array<{
      filename: string;
      error: string;
    }>;
    total: number;
    successCount: number;
    failedCount: number;
  };
}

/**
 * 画像一覧レスポンス
 */
export interface ImageListResponse {
  success: true;
  data: {
    images: ImageMetadata[];
    cursor?: string;
    hasMore: boolean;
  };
}

/**
 * 画像削除レスポンス
 */
export interface ImageDeleteResponse {
  success: true;
  message: string;
}

/**
 * Image Resizing パラメータ
 */
export interface ImageResizeParams {
  width?: number;
  height?: number;
  fit?: "scale-down" | "contain" | "cover" | "crop" | "pad";
  format?: "auto" | "webp" | "jpeg" | "png";
  quality?: number;
}
