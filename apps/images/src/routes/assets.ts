/**
 * アセット管理ハンドラ
 * カード背面画像、パック画像などのゲームアセットを管理
 *
 * POST /api/assets - アセットアップロード
 * GET /api/assets - アセット一覧
 * GET /api/assets/active/:type - アクティブなアセット取得
 * PUT /api/assets/:id/activate - アセットをアクティブに設定
 * DELETE /api/assets/:id - アセット削除
 */

import type {
  ActiveAssetResponse,
  AssetDeleteResponse,
  AssetListResponse,
  AssetMetadata,
  AssetSetActiveResponse,
  AssetType,
  AssetUploadResponse,
  Env,
} from "@repo/types";
import type { Context } from "hono";
import { transformImage, transformImageLocal } from "../container";
import { deleteFromR2, listFromR2, uploadToR2 } from "../lib/r2";
import { validateImageFile } from "../lib/validation";

const ASSET_PREFIX = "assets";
const ACTIVE_MARKER_KEY = `${ASSET_PREFIX}/.active`;

/**
 * アクティブアセット設定ファイルを読み込み
 */
async function getActiveAssets(bucket: R2Bucket): Promise<Record<AssetType, string | null>> {
  const obj = await bucket.get(ACTIVE_MARKER_KEY);
  if (!obj) {
    return {
      "card-back": null,
      "pack-front": null,
      "pack-back": null,
    };
  }
  try {
    const text = await obj.text();
    return JSON.parse(text);
  } catch {
    return {
      "card-back": null,
      "pack-front": null,
      "pack-back": null,
    };
  }
}

/**
 * アクティブアセット設定を保存
 */
async function saveActiveAssets(
  bucket: R2Bucket,
  activeAssets: Record<AssetType, string | null>,
): Promise<void> {
  await bucket.put(ACTIVE_MARKER_KEY, JSON.stringify(activeAssets), {
    httpMetadata: { contentType: "application/json" },
  });
}

/**
 * Container を使ってWebPに変換
 */
async function convertToWebP(
  c: Context<{ Bindings: Env }>,
  imageBuffer: ArrayBuffer,
): Promise<ArrayBuffer> {
  if (c.env.IMAGE_TRANSFORMER_URL) {
    return await transformImageLocal(c.env.IMAGE_TRANSFORMER_URL, imageBuffer, {
      quality: 85,
    });
  }

  if (c.env.IMAGE_TRANSFORMER) {
    const containerId = c.env.IMAGE_TRANSFORMER.idFromName("image-transformer");
    const container = c.env.IMAGE_TRANSFORMER.get(containerId);
    return await transformImage(container, imageBuffer, {
      quality: 85,
    });
  }

  throw new Error("Image transformer not configured");
}

/**
 * アセットアップロード
 * POST /api/assets
 */
export async function handleAssetUpload(c: Context<{ Bindings: Env }>): Promise<Response> {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File | null;
    const assetType = formData.get("type") as AssetType | null;

    if (!file) {
      return c.json({ success: false, error: "No file provided" }, 400);
    }

    if (!assetType || !["card-back", "pack-front", "pack-back"].includes(assetType)) {
      return c.json({ success: false, error: "Invalid asset type" }, 400);
    }

    const validation = validateImageFile(file);
    if (!validation.valid) {
      return c.json({ success: false, error: validation.error }, 400);
    }

    const bucket = c.env.CARD_IMAGES;
    if (!bucket) {
      return c.json({ success: false, error: "R2 bucket not configured" }, 500);
    }

    // ファイル名を生成
    const uuid = crypto.randomUUID();
    const ext = file.name.split(".").pop() ?? "png";
    const key = `${ASSET_PREFIX}/${assetType}/${uuid}.${ext}`;

    const fileBuffer = await file.arrayBuffer();
    await uploadToR2(bucket, key, fileBuffer, {
      contentType: file.type,
      originalName: file.name,
      size: file.size,
    });

    // WebP変換
    let hasWebP = false;
    try {
      const webpBuffer = await convertToWebP(c, fileBuffer);
      const webpKey = `${ASSET_PREFIX}/${assetType}/${uuid}.webp`;
      await uploadToR2(bucket, webpKey, webpBuffer, {
        contentType: "image/webp",
        originalName: `${uuid}.webp`,
        size: webpBuffer.byteLength,
      });
      hasWebP = true;
    } catch (error) {
      console.error("WebP conversion failed (original asset saved):", error);
    }

    // アクティブアセットを確認（初回アップロード時は自動でアクティブに）
    const activeAssets = await getActiveAssets(bucket);
    const isActive = activeAssets[assetType] === null;
    if (isActive) {
      activeAssets[assetType] = `${uuid}.${ext}`;
      await saveActiveAssets(bucket, activeAssets);
    }

    const baseUrl = new URL(c.req.url).origin;
    const assetMetadata: AssetMetadata = {
      id: `${uuid}.${ext}`,
      type: assetType,
      url: `${baseUrl}/api/assets/${assetType}/${uuid}.${ext}?format=auto`,
      thumbnailUrl: `${baseUrl}/api/assets/${assetType}/${uuid}.${ext}?width=320&format=auto`,
      originalName: file.name,
      contentType: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      isActive,
      hasWebP,
    };

    const response: AssetUploadResponse = {
      success: true,
      data: assetMetadata,
    };

    return c.json(response, 201);
  } catch (error) {
    console.error("Asset upload error:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      },
      500,
    );
  }
}

/**
 * アセット一覧取得
 * GET /api/assets?type=card-back
 */
export async function handleAssetList(c: Context<{ Bindings: Env }>): Promise<Response> {
  try {
    const bucket = c.env.CARD_IMAGES;
    if (!bucket) {
      return c.json({ success: false, error: "R2 bucket not configured" }, 500);
    }

    const assetType = c.req.query("type") as AssetType | undefined;
    const cursor = c.req.query("cursor");

    const prefix = assetType ? `${ASSET_PREFIX}/${assetType}/` : `${ASSET_PREFIX}/`;
    const result = await listFromR2(bucket, { prefix, cursor, limit: 100 });

    const activeAssets = await getActiveAssets(bucket);
    const baseUrl = new URL(c.req.url).origin;

    const assets: AssetMetadata[] = [];
    for (const obj of result.objects) {
      // 設定ファイルとWebPファイルを除外
      if (obj.key.endsWith(".json") || obj.key.endsWith(".webp")) {
        continue;
      }

      // キーからtype とid を抽出
      const parts = obj.key.replace(`${ASSET_PREFIX}/`, "").split("/");
      if (parts.length !== 2) continue;

      const type = parts[0] as AssetType;
      const id = parts[1];

      // WebPバージョンが存在するか確認
      const webpKey = obj.key.replace(/\.\w+$/, ".webp");
      const webpExists = result.objects.some((o) => o.key === webpKey);

      assets.push({
        id,
        type,
        url: `${baseUrl}/api/assets/${type}/${id}?format=auto`,
        thumbnailUrl: `${baseUrl}/api/assets/${type}/${id}?width=320&format=auto`,
        originalName: obj.customMetadata?.originalName ?? id,
        contentType: obj.httpMetadata?.contentType ?? "image/png",
        size: obj.size,
        uploadedAt: obj.customMetadata?.uploadedAt ?? obj.uploaded.toISOString(),
        isActive: activeAssets[type] === id,
        hasWebP: webpExists,
      });
    }

    const response: AssetListResponse = {
      success: true,
      data: {
        assets,
        cursor: result.truncated ? result.cursor : undefined,
        hasMore: result.truncated,
      },
    };

    return c.json(response);
  } catch (error) {
    console.error("Asset list error:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "List failed",
      },
      500,
    );
  }
}

/**
 * アクティブアセット取得
 * GET /api/assets/active/:type
 */
export async function handleGetActiveAsset(c: Context<{ Bindings: Env }>): Promise<Response> {
  try {
    const bucket = c.env.CARD_IMAGES;
    if (!bucket) {
      return c.json({ success: false, error: "R2 bucket not configured" }, 500);
    }

    const assetType = c.req.param("type") as AssetType;
    if (!["card-back", "pack-front", "pack-back"].includes(assetType)) {
      return c.json({ success: false, error: "Invalid asset type" }, 400);
    }

    const activeAssets = await getActiveAssets(bucket);
    const activeId = activeAssets[assetType];

    if (!activeId) {
      const response: ActiveAssetResponse = {
        success: true,
        data: { asset: null },
      };
      return c.json(response);
    }

    const key = `${ASSET_PREFIX}/${assetType}/${activeId}`;
    const obj = await bucket.head(key);

    if (!obj) {
      // アクティブなアセットが削除されていた場合
      activeAssets[assetType] = null;
      await saveActiveAssets(bucket, activeAssets);
      const response: ActiveAssetResponse = {
        success: true,
        data: { asset: null },
      };
      return c.json(response);
    }

    const baseUrl = new URL(c.req.url).origin;
    const response: ActiveAssetResponse = {
      success: true,
      data: {
        asset: {
          id: activeId,
          type: assetType,
          url: `${baseUrl}/api/assets/${assetType}/${activeId}?format=auto`,
          thumbnailUrl: `${baseUrl}/api/assets/${assetType}/${activeId}?width=320&format=auto`,
          originalName: obj.customMetadata?.originalName ?? activeId,
          contentType: obj.httpMetadata?.contentType ?? "image/png",
          size: obj.size,
          uploadedAt: obj.customMetadata?.uploadedAt ?? obj.uploaded.toISOString(),
          isActive: true,
        },
      },
    };

    return c.json(response);
  } catch (error) {
    console.error("Get active asset error:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Get failed",
      },
      500,
    );
  }
}

/**
 * アセット配信
 * GET /api/assets/:type/:id
 */
export async function handleServeAsset(c: Context<{ Bindings: Env }>): Promise<Response> {
  try {
    const bucket = c.env.CARD_IMAGES;
    if (!bucket) {
      return c.json({ success: false, error: "R2 bucket not configured" }, 500);
    }

    const assetType = c.req.param("type") as AssetType;
    const id = c.req.param("id");

    if (!["card-back", "pack-front", "pack-back"].includes(assetType)) {
      return c.json({ success: false, error: "Invalid asset type" }, 400);
    }

    const format = c.req.query("format");
    const width = c.req.query("width");
    const height = c.req.query("height");
    const quality = c.req.query("quality");

    // WebP形式を優先する場合
    if (format === "auto" || format === "webp") {
      const webpId = id.replace(/\.\w+$/, ".webp");
      const webpKey = `${ASSET_PREFIX}/${assetType}/${webpId}`;
      const webpObj = await bucket.get(webpKey);
      if (webpObj) {
        // リサイズが必要な場合はContainer変換
        if (width || height) {
          try {
            const buffer = await webpObj.arrayBuffer();
            const transformedBuffer = c.env.IMAGE_TRANSFORMER_URL
              ? await transformImageLocal(c.env.IMAGE_TRANSFORMER_URL, buffer, {
                  width: width ? Number.parseInt(width, 10) : undefined,
                  height: height ? Number.parseInt(height, 10) : undefined,
                  quality: quality ? Number.parseInt(quality, 10) : 80,
                })
              : buffer;

            return new Response(transformedBuffer, {
              headers: {
                "Content-Type": "image/webp",
                "Cache-Control": "public, max-age=31536000, immutable",
              },
            });
          } catch {
            // リサイズ失敗時はオリジナルを返す
          }
        }

        return new Response(webpObj.body, {
          headers: {
            "Content-Type": "image/webp",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }
    }

    // オリジナル画像を取得
    const key = `${ASSET_PREFIX}/${assetType}/${id}`;
    const obj = await bucket.get(key);

    if (!obj) {
      return c.json({ success: false, error: "Asset not found" }, 404);
    }

    return new Response(obj.body, {
      headers: {
        "Content-Type": obj.httpMetadata?.contentType ?? "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Serve asset error:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Serve failed",
      },
      500,
    );
  }
}

/**
 * アセットをアクティブに設定
 * PUT /api/assets/:type/:id/activate
 */
export async function handleSetActiveAsset(c: Context<{ Bindings: Env }>): Promise<Response> {
  try {
    const bucket = c.env.CARD_IMAGES;
    if (!bucket) {
      return c.json({ success: false, error: "R2 bucket not configured" }, 500);
    }

    const assetType = c.req.param("type") as AssetType;
    const id = c.req.param("id");

    if (!["card-back", "pack-front", "pack-back"].includes(assetType)) {
      return c.json({ success: false, error: "Invalid asset type" }, 400);
    }

    // アセットが存在するか確認
    const key = `${ASSET_PREFIX}/${assetType}/${id}`;
    const obj = await bucket.head(key);
    if (!obj) {
      return c.json({ success: false, error: "Asset not found" }, 404);
    }

    const activeAssets = await getActiveAssets(bucket);
    activeAssets[assetType] = id;
    await saveActiveAssets(bucket, activeAssets);

    const response: AssetSetActiveResponse = {
      success: true,
      message: `Asset ${id} set as active for ${assetType}`,
    };

    return c.json(response);
  } catch (error) {
    console.error("Set active asset error:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Set active failed",
      },
      500,
    );
  }
}

/**
 * アセット削除
 * DELETE /api/assets/:type/:id
 */
export async function handleDeleteAsset(c: Context<{ Bindings: Env }>): Promise<Response> {
  try {
    const bucket = c.env.CARD_IMAGES;
    if (!bucket) {
      return c.json({ success: false, error: "R2 bucket not configured" }, 500);
    }

    const assetType = c.req.param("type") as AssetType;
    const id = c.req.param("id");

    if (!["card-back", "pack-front", "pack-back"].includes(assetType)) {
      return c.json({ success: false, error: "Invalid asset type" }, 400);
    }

    const key = `${ASSET_PREFIX}/${assetType}/${id}`;

    // オリジナルを削除
    await deleteFromR2(bucket, key);

    // WebP版も削除
    const webpId = id.replace(/\.\w+$/, ".webp");
    const webpKey = `${ASSET_PREFIX}/${assetType}/${webpId}`;
    try {
      await deleteFromR2(bucket, webpKey);
    } catch {
      // WebPが存在しなくてもエラーにしない
    }

    // アクティブ設定を確認
    const activeAssets = await getActiveAssets(bucket);
    if (activeAssets[assetType] === id) {
      activeAssets[assetType] = null;
      await saveActiveAssets(bucket, activeAssets);
    }

    const response: AssetDeleteResponse = {
      success: true,
      message: `Asset ${id} deleted`,
    };

    return c.json(response);
  } catch (error) {
    console.error("Delete asset error:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Delete failed",
      },
      500,
    );
  }
}
