import type { Env } from "@repo/types/env";
import { Hono } from "hono";
import {
  GetAllCardsUseCase,
  GetCardByIdUseCase,
  GetCardStatsUseCase,
  GetCardsByRarityUseCase,
} from "../../application/card";
import { createContainer } from "../../infrastructure/di";

/**
 * Cards API Routes
 * DDD構造を使用したカードAPI
 */
export const cardsRoutes = new Hono<{ Bindings: Env }>();

// カード統計取得（/cards/stats/rarityより先にマッチさせる）
cardsRoutes.get("/stats/rarity", async (c) => {
  try {
    const container = createContainer(c.env);
    const useCase = new GetCardStatsUseCase(container.getCardRepository());
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

// カード一覧取得（レアリティフィルタリング対応）
cardsRoutes.get("/", async (c) => {
  try {
    const container = createContainer(c.env);
    const rarity = c.req.query("rarity");

    let result: { cards: unknown[]; total: number };
    if (rarity) {
      const useCase = new GetCardsByRarityUseCase(container.getCardRepository());
      result = await useCase.execute({ rarity });
    } else {
      const useCase = new GetAllCardsUseCase(container.getCardRepository());
      result = await useCase.execute();
    }

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
      400,
    );
  }
});

// カード詳細取得
cardsRoutes.get("/:id", async (c) => {
  try {
    const container = createContainer(c.env);
    const useCase = new GetCardByIdUseCase(container.getCardRepository());
    const id = Number.parseInt(c.req.param("id"), 10);

    if (Number.isNaN(id)) {
      return c.json(
        {
          error: "Invalid card ID",
          timestamp: new Date().toISOString(),
        },
        400,
      );
    }

    const result = await useCase.execute({ id });

    if (!result.card) {
      return c.json(
        {
          error: "Card not found",
          timestamp: new Date().toISOString(),
        },
        404,
      );
    }

    return c.json({
      card: result.card,
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
