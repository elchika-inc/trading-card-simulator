import type { Env } from "@repo/types/env";
import { Hono } from "hono";
import {
  DrawGachaUseCase,
  GetGachaPacksUseCase,
  GetGachaPackUseCase,
} from "../../application/gacha";
import { createContainer } from "../../infrastructure/di";

/**
 * Gacha API Routes
 * DDD構造を使用したガチャAPI
 */
export const gachaRoutes = new Hono<{ Bindings: Env }>();

// ガチャパック一覧取得
gachaRoutes.get("/packs", async (c) => {
  try {
    const container = createContainer(c.env);
    const useCase = new GetGachaPacksUseCase(container.getGachaPackRepository());
    const result = await useCase.execute();

    return c.json({
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return c.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      500,
    );
  }
});

// ガチャパック詳細取得
gachaRoutes.get("/packs/:packId", async (c) => {
  try {
    const container = createContainer(c.env);
    const useCase = new GetGachaPackUseCase(container.getGachaPackRepository());
    const packId = c.req.param("packId");

    const result = await useCase.execute({ packId });

    if (!result.pack) {
      return c.json(
        {
          error: "Gacha pack not found",
          timestamp: new Date().toISOString(),
        },
        404,
      );
    }

    return c.json({
      pack: result.pack,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return c.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      400,
    );
  }
});

// ガチャを引く
gachaRoutes.post("/draw/:packId", async (c) => {
  try {
    const container = createContainer(c.env);
    const useCase = new DrawGachaUseCase(
      container.getGachaPackRepository(),
      container.getGachaLogRepository(),
      container.getCardRepository(),
      container.getGachaService(),
      container.getEventPublisher(),
    );
    const packId = c.req.param("packId");

    const result = await useCase.execute({ packId });

    return c.json({
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status =
      message === "Gacha pack not found" || message === "This gacha pack is not active" ? 400 : 500;

    return c.json(
      {
        error: message,
        timestamp: new Date().toISOString(),
      },
      status,
    );
  }
});
