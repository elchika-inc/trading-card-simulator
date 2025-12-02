/**
 * 画像配信Worker
 * R2 + Cloudflare Container (sharp) による WebP 変換
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Env } from "./container";
import { handleList } from "./routes/list";
import { handleServe } from "./routes/serve";
import { handleUpload } from "./routes/upload";

// Re-export Container class for Durable Objects
export { ImageTransformerContainer } from "./container";

const app = new Hono<{ Bindings: Env }>();

// CORS設定
app.use("/*", async (c, next) => {
  const allowedOrigins = (c.env.ALLOWED_ORIGINS ?? "").split(",");
  const origin = c.req.header("Origin") ?? "";

  const corsMiddleware = cors({
    origin: allowedOrigins.includes(origin) ? origin : (allowedOrigins[0] ?? "*"),
    allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type"],
    maxAge: 86400,
  });

  return corsMiddleware(c, next);
});

// ルート
app.get("/", (c) => {
  return c.json({
    service: "Trading Card Images API",
    version: "2.0.0",
    features: {
      webpConversion: true,
      containerBased: true,
    },
    endpoints: {
      upload: "POST /api/images",
      serve: "GET /api/images/:id",
      serveWithTransform: "GET /api/images/:id?format=webp&width=320&quality=80",
      list: "GET /api/images",
    },
  });
});

// 画像アップロード
app.post("/api/images", handleUpload);

// 画像配信（WebP変換対応）
app.get("/api/images/:id", handleServe);

// 画像一覧
app.get("/api/images", handleList);

// AppType を export（Hono RPC用）
export type AppType = typeof app;

export default app;
