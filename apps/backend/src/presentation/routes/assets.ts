import type { AssetType, Env, RegisterAssetInput } from "@repo/types";
import { Hono } from "hono";
import {
  DeleteAssetUseCase,
  GetAssetUseCase,
  RegisterAssetUseCase,
  SetActiveAssetUseCase,
} from "../../application/asset";
import { createContainer } from "../../infrastructure/di";

/**
 * Assets API Routes
 * アセットメタデータ管理用のAPI（イメージAPIから呼び出される）
 */
export const assetsRoutes = new Hono<{ Bindings: Env }>();

// アセット登録
assetsRoutes.post("/", async (c) => {
  try {
    const container = createContainer(c.env);
    const useCase = new RegisterAssetUseCase(container.getAssetRepository());
    const body = await c.req.json<RegisterAssetInput>();

    const result = await useCase.execute(body);

    return c.json({
      success: result.success,
      assetId: result.assetId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      500,
    );
  }
});

// タイプ別アセット一覧取得（/:id より先に定義）
assetsRoutes.get("/type/:type", async (c) => {
  try {
    const container = createContainer(c.env);
    const useCase = new GetAssetUseCase(container.getAssetRepository());
    const type = c.req.param("type") as AssetType;

    const assets = await useCase.getByType(type);

    return c.json({
      success: true,
      assets,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      500,
    );
  }
});

// アクティブアセット取得
assetsRoutes.get("/active/:type", async (c) => {
  try {
    const container = createContainer(c.env);
    const useCase = new GetAssetUseCase(container.getAssetRepository());
    const type = c.req.param("type") as AssetType;

    const asset = await useCase.getActiveByType(type);

    return c.json({
      success: true,
      asset,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      500,
    );
  }
});

// アセットをアクティブに設定
assetsRoutes.put("/:id/activate", async (c) => {
  try {
    const container = createContainer(c.env);
    const useCase = new SetActiveAssetUseCase(container.getAssetRepository());
    const id = c.req.param("id");
    const body = await c.req.json<{ type: AssetType }>();

    await useCase.execute(id, body.type);

    return c.json({
      success: true,
      message: `Asset ${id} set as active`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      500,
    );
  }
});

// アセット削除
assetsRoutes.delete("/:id", async (c) => {
  try {
    const container = createContainer(c.env);
    const useCase = new DeleteAssetUseCase(container.getAssetRepository());
    const id = c.req.param("id");

    const r2Key = await useCase.execute(id);

    return c.json({
      success: true,
      r2Key,
      message: `Asset ${id} deleted`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      500,
    );
  }
});

// アセット取得（最後に定義：他のルートにマッチしなかった場合のみ）
assetsRoutes.get("/:id", async (c) => {
  try {
    const container = createContainer(c.env);
    const useCase = new GetAssetUseCase(container.getAssetRepository());
    const id = c.req.param("id");

    const asset = await useCase.getById(id);

    if (!asset) {
      return c.json(
        {
          success: false,
          error: "Asset not found",
          timestamp: new Date().toISOString(),
        },
        404,
      );
    }

    return c.json({
      success: true,
      asset,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      500,
    );
  }
});
