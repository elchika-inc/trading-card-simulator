import type { Asset } from "./asset";
import type { AssetId } from "./asset-id";
import type { AssetType } from "./asset-type";

/**
 * AssetRepository Interface
 * アセットの永続化を抽象化するリポジトリインターフェース
 */
export interface AssetRepository {
  /**
   * IDでアセットを取得
   */
  findById(id: AssetId): Promise<Asset | null>;

  /**
   * 種類でアセット一覧を取得
   */
  findByType(type: AssetType): Promise<Asset[]>;

  /**
   * 種類でアクティブなアセットを取得
   */
  findActiveByType(type: AssetType): Promise<Asset | null>;

  /**
   * R2キーでアセットを取得
   */
  findByR2Key(r2Key: string): Promise<Asset | null>;

  /**
   * すべてのアセットを取得
   */
  findAll(): Promise<Asset[]>;

  /**
   * アセットを保存（新規作成または更新）
   */
  save(asset: Asset): Promise<void>;

  /**
   * アセットを削除
   */
  delete(id: AssetId): Promise<void>;

  /**
   * 指定した種類のアセットをすべて非アクティブにする
   */
  deactivateAllByType(type: AssetType): Promise<void>;

  /**
   * アセットの総数を取得
   */
  count(): Promise<number>;

  /**
   * 種類別のアセット数を取得
   */
  countByType(): Promise<Record<string, number>>;
}
