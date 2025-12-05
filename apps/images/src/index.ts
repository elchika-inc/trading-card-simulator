/**
 * 画像配信Worker
 * R2 + Cloudflare Container (sharp) による WebP 変換
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Env } from "./container";
import {
  handleActivateAsset,
  handleAssetList,
  handleAssetUpload,
  handleDeleteAsset,
  handleServeAsset,
} from "./routes/assets";
import { handleList } from "./routes/list";
import { handleServe } from "./routes/serve";
import { handleBulkUpload, handleUpload } from "./routes/upload";

// Re-export Container class for Durable Objects
export { ImageTransformerContainer } from "./container";

const app = new Hono<{ Bindings: Env }>();

// CORS設定
app.use("/*", async (c, next) => {
  const allowedOrigins = (c.env.ALLOWED_ORIGINS ?? "").split(",");
  const origin = c.req.header("Origin") ?? "";

  const corsMiddleware = cors({
    origin: allowedOrigins.includes(origin) ? origin : (allowedOrigins[0] ?? "*"),
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type"],
    maxAge: 86400,
  });

  return corsMiddleware(c, next);
});

// ルート
app.get("/", (c) => {
  return c.json({
    service: "Trading Card Images API",
    version: "2.2.0",
    features: {
      webpConversion: true,
      containerBased: true,
      assetManagement: true,
    },
    endpoints: {
      // 画像API
      upload: "POST /api/images",
      bulkUpload: "POST /api/images/bulk",
      serve: "GET /api/images/:id",
      serveWithTransform: "GET /api/images/:id?format=webp&width=320&quality=80",
      list: "GET /api/images",
      // アセットAPI
      assetUpload: "POST /api/assets",
      assetList: "GET /api/assets?type=card-back",
      assetServe: "GET /api/assets/:type/:id",
      assetActivate: "PUT /api/assets/:type/:id/activate",
      assetDelete: "DELETE /api/assets/:type/:id",
    },
  });
});

// 画像一括アップロード
app.post("/api/images/bulk", handleBulkUpload);

// 画像アップロード
app.post("/api/images", handleUpload);

// 画像配信（WebP変換対応）
app.get("/api/images/:id", handleServe);

// 画像一覧
app.get("/api/images", handleList);

// アセットアップロード
app.post("/api/assets", handleAssetUpload);

// アセット一覧
app.get("/api/assets", handleAssetList);

// アセットアクティベート
app.put("/api/assets/:type/:id/activate", handleActivateAsset);

// アセット削除
app.delete("/api/assets/:type/:id", handleDeleteAsset);

// アセット配信
app.get("/api/assets/:type/:id", handleServeAsset);

// AppType を export（Hono RPC用）
export type AppType = typeof app;

export default app;
