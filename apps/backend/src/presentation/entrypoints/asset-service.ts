import { WorkerEntrypoint } from "cloudflare:workers";
import type {
  AssetRecord,
  AssetType,
  Env,
  RegisterAssetInput,
  RegisterAssetResult,
} from "@repo/types";
import {
  DeleteAssetUseCase,
  GetAssetUseCase,
  RegisterAssetUseCase,
  SetActiveAssetUseCase,
} from "../../application/asset";
import { createContainer } from "../../infrastructure/di/container";

/**
 * AssetService
 * Service Bindings RPC経由でアセット管理機能を提供するWorkerEntrypoint
 *
 * images Worker から呼び出される
 */
export class AssetService extends WorkerEntrypoint<Env> {
  /**
   * アセットを登録する
   */
  async registerAsset(input: RegisterAssetInput): Promise<RegisterAssetResult> {
    const container = createContainer(this.env);
    const useCase = new RegisterAssetUseCase(container.getAssetRepository());
    return useCase.execute(input);
  }

  /**
   * アセットをアクティブに設定する
   */
  async setActiveAsset(type: AssetType, assetId: string): Promise<void> {
    const container = createContainer(this.env);
    const useCase = new SetActiveAssetUseCase(container.getAssetRepository());
    return useCase.execute(assetId, type);
  }

  /**
   * アセットを削除する
   * @returns 削除されたアセットのR2キー（R2からも削除するために使用）
   */
  async deleteAsset(assetId: string): Promise<string | null> {
    const container = createContainer(this.env);
    const useCase = new DeleteAssetUseCase(container.getAssetRepository());
    return useCase.execute(assetId);
  }

  /**
   * IDでアセットを取得する
   */
  async getAsset(assetId: string): Promise<AssetRecord | null> {
    const container = createContainer(this.env);
    const useCase = new GetAssetUseCase(container.getAssetRepository());
    return useCase.getById(assetId);
  }

  /**
   * 種類でアクティブなアセットを取得する
   */
  async getActiveAsset(type: AssetType): Promise<AssetRecord | null> {
    const container = createContainer(this.env);
    const useCase = new GetAssetUseCase(container.getAssetRepository());
    return useCase.getActiveByType(type);
  }

  /**
   * 種類でアセット一覧を取得する
   */
  async getAssetsByType(type: AssetType): Promise<AssetRecord[]> {
    const container = createContainer(this.env);
    const useCase = new GetAssetUseCase(container.getAssetRepository());
    return useCase.getByType(type);
  }
}
