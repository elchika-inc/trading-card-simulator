import type {
  CardCreateRequest,
  CardCreateResponse,
  CardDetailResponse,
  CardUpdateRequest,
  CardUpdateResponse,
  PackAssignment,
} from "@repo/types";
import type { Env } from "@repo/types/env";
import { Hono } from "hono";
import type { CreateCardInput, UpdateCardInput } from "../../application/card";
import {
  GetAllCardsUseCase,
  GetCardByIdUseCase,
  GetCardStatsUseCase,
  GetCardsByRarityUseCase,
} from "../../application/card";
import { CardId } from "../../domain/card";
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

// カード作成
cardsRoutes.post("/", async (c) => {
  try {
    const container = createContainer(c.env);
    const useCase = container.getCreateCardUseCase();

    const body = await c.req.json<CardCreateRequest>();

    const input: CreateCardInput = {
      name: body.name,
      holoType: body.holoType,
      textStyle: body.textStyle,
      imageId: body.imageId,
      description: body.description,
      iconName: body.iconName,
      rarity: body.rarity,
      frameColor: body.frameColor,
      packAssignments: body.packAssignments?.map((assignment) => ({
        packId: assignment.packId,
        weight: assignment.weight,
        isPickup: assignment.isPickup ?? false,
      })),
    };

    const result = await useCase.execute(input);

    const response: CardCreateResponse = {
      success: true,
      data: result.card,
    };

    return c.json(response, 201);
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

// カード詳細取得（パック割当情報付き）
cardsRoutes.get("/:id", async (c) => {
  try {
    const container = createContainer(c.env);
    const cardRepository = container.getCardRepository();
    const gachaPackRepository = container.getGachaPackRepository();
    const useCase = new GetCardByIdUseCase(cardRepository);
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

    // パック割当情報を取得
    const rates = await gachaPackRepository.findRatesByCardId(CardId.create(id));
    const allPacks = await gachaPackRepository.findAll();

    const packAssignments: PackAssignment[] = rates.map((rate) => {
      const pack = allPacks.find((p) => p.getId().getValue() === rate.getPackId().getValue());
      return {
        packId: rate.getPackId().getValue(),
        packName: pack?.getName() ?? "",
        packIcon: pack?.getIcon() ?? undefined,
        weight: rate.getWeight().getValue(),
        isPickup: rate.getIsPickup(),
      };
    });

    const response: CardDetailResponse = {
      success: true,
      data: {
        card: result.card,
        packAssignments,
      },
    };

    return c.json(response);
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

// カード更新
cardsRoutes.put("/:id", async (c) => {
  try {
    const container = createContainer(c.env);
    const useCase = container.getUpdateCardUseCase();
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

    const body = await c.req.json<CardUpdateRequest>();

    const input: UpdateCardInput = {
      id,
      name: body.name,
      holoType: body.holoType,
      textStyle: body.textStyle,
      assetId: body.imageId,
      description: body.description,
      iconName: body.iconName,
      rarity: body.rarity,
      frameColor: body.frameColor,
      packAssignments: body.packAssignments?.map((assignment) => ({
        packId: assignment.packId,
        weight: assignment.weight,
        isPickup: assignment.isPickup ?? false,
      })),
    };

    const result = await useCase.execute(input);

    const response: CardUpdateResponse = {
      success: true,
      data: result.card,
    };

    return c.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("not found") ? 404 : 400;

    return c.json(
      {
        error: message,
        timestamp: new Date().toISOString(),
      },
      status,
    );
  }
});
