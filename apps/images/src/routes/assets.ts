/**
 * アセット管理ハンドラ
 * カード背面画像、パック画像などのゲームアセットを管理
 *
 * POST /api/assets - アセットアップロード
 * GET /api/assets - アセット一覧
 * DELETE /api/assets/:type/:id - アセット削除
 */

import type {
  AssetDeleteResponse,
  AssetListResponse,
  AssetMetadata,
  AssetType,
  AssetUploadResponse,
  Env,
  RegisterAssetInput,
} from "@repo/types";
import type { Context } from "hono";
import { transformImage, transformImageLocal } from "../container";
import { deleteFromR2, listFromR2, uploadToR2 } from "../lib/r2";
import { validateImageFile } from "../lib/validation";

const ASSET_PREFIX = "assets";

/**
 * バックエンドAPIのURL取得
 */
function getBackendApiUrl(c: Context<{ Bindings: Env }>): string {
  return c.env.BACKEND_API_URL || "http://localhost:8787";
}

/**
 * DBにアセットを登録（Service Bindings RPC経由、またはHTTP経由）
 */
async function registerAssetToDb(
  c: Context<{ Bindings: Env }>,
  input: RegisterAssetInput,
): Promise<boolean> {
  // Service Bindings が使える場合はそれを使用（本番環境）
  if (c.env.BACKEND_API) {
    try {
      const result = await c.env.BACKEND_API.registerAsset(input);
      return result.success;
    } catch (error) {
      console.error("Failed to register asset via Service Bindings:", error);
    }
  }

  // HTTP経由でバックエンドAPIを呼び出し（ローカル開発用フォールバック）
  try {
    const backendUrl = getBackendApiUrl(c);
    const response = await fetch(`${backendUrl}/api/assets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Failed to register asset via HTTP:", errorData);
      return false;
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error("Failed to register asset via HTTP:", error);
    return false;
  }
}

/**
 * DBからアセットを削除（Service Bindings RPC経由、またはHTTP経由）
 */
async function deleteAssetFromDb(c: Context<{ Bindings: Env }>, assetId: string): Promise<boolean> {
  // Service Bindings が使える場合はそれを使用（本番環境）
  if (c.env.BACKEND_API) {
    try {
      await c.env.BACKEND_API.deleteAsset(assetId);
      return true;
    } catch (error) {
      console.error("Failed to delete asset via Service Bindings:", error);
    }
  }

  // HTTP経由でバックエンドAPIを呼び出し（ローカル開発用フォールバック）
  try {
    const backendUrl = getBackendApiUrl(c);
    const response = await fetch(`${backendUrl}/api/assets/${assetId}`, {
      method: "DELETE",
    });

    return response.ok;
  } catch (error) {
    console.error("Failed to delete asset via HTTP:", error);
    return false;
  }
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
    // パック画像のセットID（表面と裏面を紐付けるために使用）
    const packSetId = formData.get("packSetId") as string | null;

    if (!file) {
      return c.json({ success: false, error: "No file provided" }, 400);
    }

    if (!assetType || !["card", "card-back", "pack-front", "pack-back"].includes(assetType)) {
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

    // packSetIdをメタデータに含める
    const fileBuffer = await file.arrayBuffer();
    await uploadToR2(bucket, key, fileBuffer, {
      contentType: file.type,
      originalName: file.name,
      size: file.size,
      packSetId: packSetId ?? undefined,
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
        packSetId: packSetId ?? undefined,
      });
      hasWebP = true;
    } catch (error) {
      console.error("WebP conversion failed (original asset saved):", error);
    }

    // DBにアセット情報を登録（Service Bindings RPC経由）
    const assetId = `${uuid}.${ext}`;
    await registerAssetToDb(c, {
      id: assetId,
      type: assetType,
      originalName: file.name,
      contentType: file.type,
      size: file.size,
      r2Key: key,
      hasWebP,
      packSetId: packSetId ?? undefined,
    });

    const baseUrl = new URL(c.req.url).origin;
    const assetMetadata: AssetMetadata = {
      id: assetId,
      type: assetType,
      url: `${baseUrl}/api/assets/${assetType}/${uuid}.${ext}?format=auto`,
      thumbnailUrl: `${baseUrl}/api/assets/${assetType}/${uuid}.${ext}?width=320&format=auto`,
      originalName: file.name,
      contentType: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      hasWebP,
      packSetId: packSetId ?? undefined,
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

    const baseUrl = new URL(c.req.url).origin;

    const assets: AssetMetadata[] = [];
    for (const obj of result.objects) {
      // 設定ファイルとWebPファイルを除外
      if (obj.key.endsWith(".json") || obj.key.endsWith(".webp")) {
        continue;
      }

      // キーからtype とid を抽出
      const parts = obj.key.replace(`${ASSET_PREFIX}/`, "").split("/");
      if (parts.length !== 2 || !parts[0] || !parts[1]) continue;

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
        hasWebP: webpExists,
        packSetId: obj.customMetadata?.packSetId,
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

    if (!["card", "card-back", "pack-front", "pack-back"].includes(assetType)) {
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
export async function handleActivateAsset(c: Context<{ Bindings: Env }>): Promise<Response> {
  try {
    const assetType = c.req.param("type") as AssetType;
    const id = c.req.param("id");

    if (!["card", "card-back", "pack-front", "pack-back"].includes(assetType)) {
      return c.json({ success: false, error: "Invalid asset type" }, 400);
    }

    // Backend API にリクエストを転送
    if (c.env.BACKEND_API) {
      try {
        await c.env.BACKEND_API.activateAsset(id, assetType);
        return c.json({
          success: true,
          message: `Asset ${id} set as active for ${assetType}`,
        });
      } catch (error) {
        console.error("Failed to activate asset via Service Bindings:", error);
      }
    }

    // HTTP経由でバックエンドAPIを呼び出し（ローカル開発用フォールバック）
    try {
      const backendUrl = getBackendApiUrl(c);
      const response = await fetch(`${backendUrl}/api/assets/${id}/activate`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: assetType }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to activate asset via HTTP:", errorData);
        return c.json(
          {
            success: false,
            error: "Failed to activate asset",
          },
          500,
        );
      }

      return c.json({
        success: true,
        message: `Asset ${id} set as active for ${assetType}`,
      });
    } catch (error) {
      console.error("Failed to activate asset via HTTP:", error);
      return c.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Activation failed",
        },
        500,
      );
    }
  } catch (error) {
    console.error("Activate asset error:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Activation failed",
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

    if (!["card", "card-back", "pack-front", "pack-back"].includes(assetType)) {
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

    // DBからも削除（Service Bindings RPC経由）
    await deleteAssetFromDb(c, id);

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
