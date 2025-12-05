import type { CardAssignment } from "@repo/types";
import type { Env } from "@repo/types/env";
import { Hono } from "hono";
import {
  DrawGachaUseCase,
  GetGachaPacksUseCase,
  GetGachaPackUseCase,
  UpdatePackSetIdUseCase,
  UpdatePickupCardsUseCase,
} from "../../application/gacha";
import { GachaPackId, PackGroupId } from "../../domain/gacha";
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

// ガチャパック詳細取得（注目カード含む）
gachaRoutes.get("/packs/:packId", async (c) => {
  try {
    const container = createContainer(c.env);
    const useCase = new GetGachaPackUseCase(
      container.getGachaPackRepository(),
      container.getCardRepository(),
    );
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
      featuredCards: result.featuredCards,
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

// ピックアップカード更新（Admin用）
gachaRoutes.put("/packs/:packId/pickup", async (c) => {
  try {
    const container = createContainer(c.env);
    const useCase = new UpdatePickupCardsUseCase(container.getGachaPackRepository());
    const packId = c.req.param("packId");
    const body = await c.req.json<{ cardIds: number[] }>();

    if (!Array.isArray(body.cardIds)) {
      return c.json(
        {
          error: "cardIds must be an array of numbers",
          timestamp: new Date().toISOString(),
        },
        400,
      );
    }

    const result = await useCase.execute({ packId, cardIds: body.cardIds });

    return c.json({
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Gacha pack not found" ? 404 : 500;

    return c.json(
      {
        error: message,
        timestamp: new Date().toISOString(),
      },
      status,
    );
  }
});

// 封入枚数更新（Admin用）
gachaRoutes.put("/packs/:packId/cards-per-pack", async (c) => {
  try {
    const container = createContainer(c.env);
    const gachaPackRepository = container.getGachaPackRepository();
    const packId = c.req.param("packId");
    const body = await c.req.json<{ cardsPerPack: number }>();

    // バリデーション
    if (typeof body.cardsPerPack !== "number" || body.cardsPerPack < 1 || body.cardsPerPack > 100) {
      return c.json(
        {
          error: "cardsPerPack must be a number between 1 and 100",
          timestamp: new Date().toISOString(),
        },
        400,
      );
    }

    // パックの存在確認
    const pack = await gachaPackRepository.findById(GachaPackId.create(packId));
    if (!pack) {
      return c.json(
        {
          error: "Gacha pack not found",
          timestamp: new Date().toISOString(),
        },
        404,
      );
    }

    await gachaPackRepository.updateCardsPerPack(GachaPackId.create(packId), body.cardsPerPack);

    return c.json({
      success: true,
      cardsPerPack: body.cardsPerPack,
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

// パック画像セットID更新（Admin用）
gachaRoutes.put("/packs/:packId/pack-set", async (c) => {
  try {
    const container = createContainer(c.env);
    const useCase = new UpdatePackSetIdUseCase(container.getGachaPackRepository());
    const packId = c.req.param("packId");
    const body = await c.req.json<{
      packSetId: string | null;
    }>();

    const result = await useCase.execute({
      packId,
      packSetId: body.packSetId ?? null,
    });

    return c.json({
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Gacha pack not found" ? 404 : 500;

    return c.json(
      {
        error: message,
        timestamp: new Date().toISOString(),
      },
      status,
    );
  }
});

// パックのグループ割り当て更新（Admin用）
gachaRoutes.put("/packs/:packId/group", async (c) => {
  try {
    const container = createContainer(c.env);
    const useCase = container.getAssignPackToGroupUseCase();
    const packId = c.req.param("packId");
    const body = await c.req.json<{ groupId: string | null }>();

    const result = await useCase.execute({
      packId: GachaPackId.create(packId),
      groupId: body.groupId ? PackGroupId.create(body.groupId) : null,
    });

    if (!result.success) {
      return c.json(
        {
          error: result.error ?? "Failed to assign pack to group",
          timestamp: new Date().toISOString(),
        },
        400,
      );
    }

    return c.json({
      success: true,
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

// ========== Pack Groups Endpoints ==========

// アクティブなグループ一覧取得（公開用）
gachaRoutes.get("/groups", async (c) => {
  try {
    const container = createContainer(c.env);
    const useCase = container.getGetPackGroupsUseCase();
    const result = await useCase.execute();

    return c.json({
      groups: result.groups,
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

// 全グループ一覧取得（Admin用、非アクティブ含む）
gachaRoutes.get("/groups/all", async (c) => {
  try {
    const container = createContainer(c.env);
    const useCase = container.getGetPackGroupsUseCase();
    const result = await useCase.execute({ includeInactive: true });

    return c.json({
      groups: result.groups,
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

// グループ詳細取得（パック含む）
gachaRoutes.get("/groups/:groupId", async (c) => {
  try {
    const container = createContainer(c.env);
    const useCase = container.getGetPackGroupUseCase();
    const groupId = c.req.param("groupId");

    const result = await useCase.execute({
      groupId: PackGroupId.create(groupId),
    });

    if (!result.group) {
      return c.json(
        {
          error: "Pack group not found",
          timestamp: new Date().toISOString(),
        },
        404,
      );
    }

    return c.json({
      group: result.group,
      packs: result.packs,
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

// グループ作成（Admin用）
gachaRoutes.post("/groups", async (c) => {
  try {
    const container = createContainer(c.env);
    const useCase = container.getCreatePackGroupUseCase();
    const body = await c.req.json<{
      name: string;
      description?: string | null;
      icon?: string;
      colorFrom?: string;
      colorTo?: string;
      isActive?: boolean;
      sortOrder?: number;
    }>();

    if (!body.name?.trim()) {
      return c.json(
        {
          error: "name is required",
          timestamp: new Date().toISOString(),
        },
        400,
      );
    }

    const result = await useCase.execute({
      name: body.name,
      description: body.description,
      icon: body.icon,
      colorFrom: body.colorFrom,
      colorTo: body.colorTo,
      isActive: body.isActive,
      sortOrder: body.sortOrder,
    });

    return c.json({
      group: result.group,
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

// グループ更新（Admin用）
gachaRoutes.put("/groups/:groupId", async (c) => {
  try {
    const container = createContainer(c.env);
    const useCase = container.getUpdatePackGroupUseCase();
    const groupId = c.req.param("groupId");
    const body = await c.req.json<{
      name?: string;
      description?: string | null;
      icon?: string;
      colorFrom?: string;
      colorTo?: string;
      isActive?: boolean;
      sortOrder?: number;
    }>();

    const result = await useCase.execute({
      groupId: PackGroupId.create(groupId),
      name: body.name,
      description: body.description,
      icon: body.icon,
      colorFrom: body.colorFrom,
      colorTo: body.colorTo,
      isActive: body.isActive,
      sortOrder: body.sortOrder,
    });

    if (!result.success) {
      return c.json(
        {
          error: "Pack group not found",
          timestamp: new Date().toISOString(),
        },
        404,
      );
    }

    return c.json({
      group: result.group,
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

// グループ削除（Admin用）
gachaRoutes.delete("/groups/:groupId", async (c) => {
  try {
    const container = createContainer(c.env);
    const useCase = container.getDeletePackGroupUseCase();
    const groupId = c.req.param("groupId");

    const result = await useCase.execute({
      groupId: PackGroupId.create(groupId),
    });

    if (!result.success) {
      return c.json(
        {
          error: "Pack group not found",
          timestamp: new Date().toISOString(),
        },
        404,
      );
    }

    return c.json({
      success: true,
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

// ========== 封入カード管理 Endpoints ==========

// パックの封入カード一覧取得（Admin用）
gachaRoutes.get("/packs/:packId/rates", async (c) => {
  try {
    const container = createContainer(c.env);
    const gachaPackRepository = container.getGachaPackRepository();
    const cardRepository = container.getCardRepository();
    const packId = c.req.param("packId");

    // パックの存在確認
    const pack = await gachaPackRepository.findById(GachaPackId.create(packId));
    if (!pack) {
      return c.json(
        {
          error: "Gacha pack not found",
          timestamp: new Date().toISOString(),
        },
        404,
      );
    }

    // パックの封入カード一覧を取得
    const rates = await gachaPackRepository.findRatesByPackId(GachaPackId.create(packId));
    const allCards = await cardRepository.findAll();

    const cardAssignments: CardAssignment[] = rates.map((rate) => {
      const card = allCards.find((c) => c.getId().getValue() === rate.getCardId().getValue());
      const cardPlain = card?.toPlainObject();
      return {
        cardId: rate.getCardId().getValue(),
        cardName: cardPlain?.name ?? "",
        cardRarity: cardPlain?.rarity as CardAssignment["cardRarity"],
        weight: rate.getWeight().getValue(),
        isPickup: rate.getIsPickup(),
      };
    });

    return c.json({
      success: true,
      data: {
        packId,
        packName: pack.getName(),
        cardAssignments,
      },
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

// パックの封入カード更新（Admin用）
gachaRoutes.put("/packs/:packId/rates", async (c) => {
  try {
    const container = createContainer(c.env);
    const gachaPackRepository = container.getGachaPackRepository();
    const packId = c.req.param("packId");

    // パックの存在確認
    const pack = await gachaPackRepository.findById(GachaPackId.create(packId));
    if (!pack) {
      return c.json(
        {
          error: "Gacha pack not found",
          timestamp: new Date().toISOString(),
        },
        404,
      );
    }

    const body = await c.req.json<{
      cardAssignments: Array<{
        cardId: number;
        weight: number;
        isPickup?: boolean;
      }>;
    }>();

    if (!Array.isArray(body.cardAssignments)) {
      return c.json(
        {
          error: "cardAssignments must be an array",
          timestamp: new Date().toISOString(),
        },
        400,
      );
    }

    // パックの封入カードを更新
    const rates = body.cardAssignments.map((assignment) => ({
      cardId: assignment.cardId,
      weight: assignment.weight,
      isPickup: assignment.isPickup ?? false,
    }));

    await gachaPackRepository.updatePackRates(GachaPackId.create(packId), rates);

    return c.json({
      success: true,
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
