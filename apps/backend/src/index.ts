import type { Env } from "@repo/types/env";
import { Hono } from "hono";
import { cors } from "hono/cors";
import type { QueueMessage } from "./infrastructure/events";
import { QueueConsumer } from "./infrastructure/events";
import { cardsRoutes, gachaRoutes } from "./presentation/routes";

const app = new Hono<{ Bindings: Env }>();

// CORS設定（開発環境でフロントエンドからのリクエストを許可）
app.use("/*", cors());

// ==========================================
// 共通エンドポイント
// ==========================================

// ヘルスチェック用エンドポイント
app.get("/api/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// 環境変数を取得してSPAに渡すAPIエンドポイント
app.get("/api/config", (c) => {
  const appName = c.env.APP_NAME || "Hono + React App";
  const appVersion = c.env.APP_VERSION || "1.0.0";
  const apiEndpoint = c.env.API_ENDPOINT || "http://localhost:8787";

  return c.json({
    appName,
    appVersion,
    apiEndpoint,
    timestamp: new Date().toISOString(),
  });
});

// シンプルなGETエンドポイント例
app.get("/api/hello", (c) => {
  const name = c.req.query("name") || "World";
  return c.json({
    message: `Hello, ${name}!`,
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// DDD Cards API（Application Layer経由）
// ==========================================
app.route("/api/cards", cardsRoutes);

// ==========================================
// DDD Gacha API（Application Layer経由）
// ==========================================
app.route("/api/gacha", gachaRoutes);

// AppType を export（Hono RPC用）
export type AppType = typeof app;

// ==========================================
// Cloudflare Workers Queue Handler
// ==========================================
const queueConsumer = new QueueConsumer();

// Cloudflare Workers用エクスポート（fetch + queue）
export default {
  fetch: app.fetch,
  async queue(batch: MessageBatch<QueueMessage>, _env: Env, _ctx: ExecutionContext): Promise<void> {
    await queueConsumer.processBatch(batch);
  },
};
