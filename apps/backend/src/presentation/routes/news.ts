import type { Env } from "@repo/types/env";
import { Hono } from "hono";
import { NewsId } from "../../domain/news";
import { createContainer } from "../../infrastructure/di";

/**
 * News API Routes
 * ランディングページ用News管理API
 */
export const newsRoutes = new Hono<{ Bindings: Env }>();

// アクティブなNews一覧取得（Frontend用）
newsRoutes.get("/", async (c) => {
  try {
    const container = createContainer(c.env);
    const useCase = container.getGetNewsListUseCase();
    const result = await useCase.execute();

    return c.json({
      newsList: result.newsList,
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

// 全News一覧取得（Admin用、非アクティブ含む）
newsRoutes.get("/admin", async (c) => {
  try {
    const container = createContainer(c.env);
    const useCase = container.getGetNewsListUseCase();
    const result = await useCase.execute({ includeInactive: true });

    return c.json({
      newsList: result.newsList,
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

// News詳細取得（カード、パック含む）
newsRoutes.get("/:newsId", async (c) => {
  try {
    const container = createContainer(c.env);
    const useCase = container.getGetNewsUseCase();
    const newsId = c.req.param("newsId");

    const result = await useCase.execute({
      newsId: NewsId.create(newsId),
    });

    if (!result.news) {
      return c.json(
        {
          error: "News not found",
          timestamp: new Date().toISOString(),
        },
        404,
      );
    }

    return c.json({
      news: result.news,
      cards: result.cards,
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

// News作成（Admin用）
newsRoutes.post("/", async (c) => {
  try {
    const container = createContainer(c.env);
    const useCase = container.getCreateNewsUseCase();
    const body = await c.req.json<{
      title: string;
      subtitle?: string | null;
      badgeText?: string;
      packIds?: string[];
      bannerAssetId?: string | null;
      isActive?: boolean;
      sortOrder?: number;
      cardIds?: number[];
    }>();

    if (!body.title?.trim()) {
      return c.json(
        {
          error: "title is required",
          timestamp: new Date().toISOString(),
        },
        400,
      );
    }

    const result = await useCase.execute({
      title: body.title,
      subtitle: body.subtitle,
      badgeText: body.badgeText,
      packIds: body.packIds,
      bannerAssetId: body.bannerAssetId,
      isActive: body.isActive,
      sortOrder: body.sortOrder,
      cardIds: body.cardIds,
    });

    return c.json({
      news: result.news,
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

// News更新（Admin用）
newsRoutes.put("/:newsId", async (c) => {
  try {
    const container = createContainer(c.env);
    const useCase = container.getUpdateNewsUseCase();
    const newsId = c.req.param("newsId");
    const body = await c.req.json<{
      title?: string;
      subtitle?: string | null;
      badgeText?: string;
      packIds?: string[];
      bannerAssetId?: string | null;
      isActive?: boolean;
      sortOrder?: number;
      cardIds?: number[];
    }>();

    const result = await useCase.execute({
      newsId: NewsId.create(newsId),
      title: body.title,
      subtitle: body.subtitle,
      badgeText: body.badgeText,
      packIds: body.packIds,
      bannerAssetId: body.bannerAssetId,
      isActive: body.isActive,
      sortOrder: body.sortOrder,
      cardIds: body.cardIds,
    });

    if (!result.success) {
      return c.json(
        {
          error: "News not found",
          timestamp: new Date().toISOString(),
        },
        404,
      );
    }

    return c.json({
      news: result.news,
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

// News削除（Admin用）
newsRoutes.delete("/:newsId", async (c) => {
  try {
    const container = createContainer(c.env);
    const useCase = container.getDeleteNewsUseCase();
    const newsId = c.req.param("newsId");

    const result = await useCase.execute({
      newsId: NewsId.create(newsId),
    });

    if (!result.success) {
      return c.json(
        {
          error: "News not found",
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
