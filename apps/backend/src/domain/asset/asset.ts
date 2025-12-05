import { Entity } from "../shared/entity";
import { AssetId } from "./asset-id";
import { AssetType, type AssetTypeValue } from "./asset-type";

/**
 * Asset作成時のプロパティ
 */
export interface AssetProps {
  id: string;
  type: string;
  originalName: string;
  contentType: string;
  size: number;
  r2Key: string;
  hasWebP: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Asset新規作成時のプロパティ
 */
export interface CreateAssetProps {
  id: string;
  type: string;
  originalName: string;
  contentType: string;
  size: number;
  r2Key: string;
  hasWebP: boolean;
}

/**
 * Asset Entity
 * R2に保存される画像ファイルのメタデータを管理するエンティティ
 */
export class Asset extends Entity<AssetId> {
  private readonly _type: AssetType;
  private readonly _originalName: string;
  private readonly _contentType: string;
  private readonly _size: number;
  private readonly _r2Key: string;
  private readonly _hasWebP: boolean;
  private _isActive: boolean;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(
    id: AssetId,
    type: AssetType,
    originalName: string,
    contentType: string,
    size: number,
    r2Key: string,
    hasWebP: boolean,
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id);
    this._type = type;
    this._originalName = originalName;
    this._contentType = contentType;
    this._size = size;
    this._r2Key = r2Key;
    this._hasWebP = hasWebP;
    this._isActive = isActive;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  /**
   * 新しいアセットを作成（ファクトリメソッド）
   */
  static create(props: CreateAssetProps): Asset {
    const now = new Date();
    return new Asset(
      AssetId.create(props.id),
      AssetType.create(props.type),
      props.originalName,
      props.contentType,
      props.size,
      props.r2Key,
      props.hasWebP,
      false, // 新規作成時はisActive = false
      now,
      now,
    );
  }

  /**
   * 既存のアセットを再構築（Repository用）
   */
  static reconstruct(props: AssetProps): Asset {
    return new Asset(
      AssetId.create(props.id),
      AssetType.create(props.type),
      props.originalName,
      props.contentType,
      props.size,
      props.r2Key,
      props.hasWebP,
      props.isActive,
      props.createdAt,
      props.updatedAt,
    );
  }

  // Getters
  getId(): AssetId {
    return this._id;
  }

  getType(): AssetType {
    return this._type;
  }

  getOriginalName(): string {
    return this._originalName;
  }

  getContentType(): string {
    return this._contentType;
  }

  getSize(): number {
    return this._size;
  }

  getR2Key(): string {
    return this._r2Key;
  }

  hasWebP(): boolean {
    return this._hasWebP;
  }

  isActive(): boolean {
    return this._isActive;
  }

  getCreatedAt(): Date {
    return this._createdAt;
  }

  getUpdatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * アセットをアクティブに設定
   */
  activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
  }

  /**
   * アセットを非アクティブに設定
   */
  deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
  }

  /**
   * プレーンオブジェクトに変換
   */
  toPlainObject(): {
    id: string;
    type: AssetTypeValue;
    originalName: string;
    contentType: string;
    size: number;
    r2Key: string;
    hasWebP: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  } {
    return {
      id: this._id.getValue(),
      type: this._type.getValue(),
      originalName: this._originalName,
      contentType: this._contentType,
      size: this._size,
      r2Key: this._r2Key,
      hasWebP: this._hasWebP,
      isActive: this._isActive,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }
}
