/**
 * 画像バリデーション
 */

/**
 * 許可する画像形式
 */
const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;

/**
 * 最大ファイルサイズ (10MB)
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * 画像ファイルのバリデーション
 */
export function validateImageFile(file: File): { valid: true } | { valid: false; error: string } {
  // MIME typeチェック
  type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];
  if (!ALLOWED_MIME_TYPES.includes(file.type as AllowedMimeType)) {
    return {
      valid: false,
      error: `Invalid file type: ${file.type}. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`,
    };
  }

  // ファイルサイズチェック
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
    };
  }

  return { valid: true };
}

/**
 * ファイル拡張子を取得
 */
export function getFileExtension(mimeType: string): string {
  switch (mimeType) {
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpg";
    case "image/webp":
      return "webp";
    default:
      return "bin";
  }
}
