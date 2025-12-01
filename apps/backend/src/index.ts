import type { Env } from "@repo/types/env";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { CARDS_DATA } from "./data/cards";

const app = new Hono<{ Bindings: Env }>();

// CORS設定（開発環境でフロントエンドからのリクエストを許可）
app.use("/*", cors());

// ヘルスチェック用エンドポイント
app.get("/api/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// 環境変数を取得してSPAに渡すAPIエンドポイント
app.get("/api/config", (c) => {
  // c.envから環境変数を取得
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
// カードAPI
// ==========================================

// カード一覧取得
app.get("/api/cards", (c) => {
  const rarity = c.req.query("rarity"); // クエリパラメータでレアリティフィルタリング

  let cards = CARDS_DATA;

  // レアリティでフィルタリング
  if (rarity) {
    cards = cards.filter((card) => card.rarity === rarity);
  }

  return c.json({
    cards,
    total: cards.length,
    timestamp: new Date().toISOString(),
  });
});

// カード詳細取得
app.get("/api/cards/:id", (c) => {
  const id = Number.parseInt(c.req.param("id"), 10);

  const card = CARDS_DATA.find((card) => card.id === id);

  if (!card) {
    return c.json(
      {
        error: "Card not found",
        timestamp: new Date().toISOString(),
      },
      404,
    );
  }

  return c.json({
    card,
    timestamp: new Date().toISOString(),
  });
});

// レアリティ別カード数を取得
app.get("/api/cards/stats/rarity", (c) => {
  const stats = CARDS_DATA.reduce(
    (acc, card) => {
      acc[card.rarity] = (acc[card.rarity] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return c.json({
    stats,
    timestamp: new Date().toISOString(),
  });
});

// AppType を export（Hono RPC用）
export type AppType = typeof app;

// Cloudflare Workers用エクスポート
export default app;
