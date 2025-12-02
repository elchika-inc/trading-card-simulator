/**
 * R2操作ヘルパー関数
 */

import type { ImageMetadata } from "@repo/types";

/**
 * R2にファイルをアップロード
 */
export async function uploadToR2(
  bucket: R2Bucket,
  key: string,
  file: ArrayBuffer,
  metadata: {
    contentType: string;
    originalName: string;
    size: number;
  },
): Promise<void> {
  await bucket.put(key, file, {
    httpMetadata: {
      contentType: metadata.contentType,
    },
    customMetadata: {
      originalName: metadata.originalName,
      size: metadata.size.toString(),
      uploadedAt: new Date().toISOString(),
    },
  });
}

/**
 * R2からファイルを取得
 */
export async function getFromR2(bucket: R2Bucket, key: string): Promise<R2ObjectBody | null> {
  return await bucket.get(key);
}

/**
 * R2からファイルリストを取得
 */
export async function listFromR2(
  bucket: R2Bucket,
  options?: {
    limit?: number;
    cursor?: string;
    prefix?: string;
  },
): Promise<R2Objects> {
  return await bucket.list({
    limit: options?.limit ?? 100,
    cursor: options?.cursor,
    prefix: options?.prefix,
  });
}

/**
 * R2からファイルを削除
 */
export async function deleteFromR2(bucket: R2Bucket, key: string): Promise<void> {
  await bucket.delete(key);
}

/**
 * R2オブジェクトからImageMetadataを生成
 */
export function r2ObjectToImageMetadata(object: R2Object | R2ObjectBody, baseUrl: string): ImageMetadata {
  const id = object.key.replace(/^images\//, "").replace(/\.\w+$/, "");
  const ext = object.key.split(".").pop() ?? "png";

  return {
    id,
    url: `${baseUrl}/api/images/${id}.${ext}?format=auto`,
    thumbnailUrl: `${baseUrl}/api/images/${id}.${ext}?width=320&format=auto`,
    originalName: object.customMetadata?.originalName ?? object.key,
    contentType: object.httpMetadata?.contentType ?? "image/png",
    size: object.size,
    uploadedAt: object.customMetadata?.uploadedAt ?? object.uploaded.toISOString(),
  };
}
