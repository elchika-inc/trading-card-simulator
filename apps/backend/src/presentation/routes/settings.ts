import type {
  SiteSettingsResponse,
  SiteSettingsUpdateRequest,
  SiteSettingsUpdateResponse,
} from "@repo/types";
import type { Env } from "@repo/types/env";
import { Hono } from "hono";
import { GetSiteSettingsUseCase, UpdateSiteSettingsUseCase } from "../../application/settings";
import { createContainer } from "../../infrastructure/di";

/**
 * Settings API Routes
 * サイト設定API
 */
export const settingsRoutes = new Hono<{ Bindings: Env }>();

// サイト設定取得
settingsRoutes.get("/", async (c) => {
  try {
    const container = createContainer(c.env);
    const useCase = new GetSiteSettingsUseCase(container.getSiteSettingsRepository());
    const result = await useCase.execute();

    return c.json<SiteSettingsResponse>({
      settings: result.settings,
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

// サイト設定更新
settingsRoutes.put("/", async (c) => {
  try {
    const body = await c.req.json<SiteSettingsUpdateRequest>();
    const container = createContainer(c.env);
    const useCase = new UpdateSiteSettingsUseCase(container.getSiteSettingsRepository());
    const result = await useCase.execute({
      backgroundPresetId: body.backgroundPresetId,
    });

    return c.json<SiteSettingsUpdateResponse>({
      settings: result.settings,
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
