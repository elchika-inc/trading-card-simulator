import { ValueObject } from "../shared/value-object";

/**
 * アセットの種類
 */
export type AssetTypeValue = "card" | "card-back" | "pack-front" | "pack-back";

const VALID_ASSET_TYPES: AssetTypeValue[] = ["card", "card-back", "pack-front", "pack-back"];

interface AssetTypeProps {
  value: AssetTypeValue;
}

/**
 * AssetType Value Object
 * アセットの種類を表す値オブジェクト
 */
export class AssetType extends ValueObject<AssetTypeProps> {
  private constructor(props: AssetTypeProps) {
    super(props);
  }

  static create(value: string): AssetType {
    if (!VALID_ASSET_TYPES.includes(value as AssetTypeValue)) {
      throw new Error(
        `Invalid asset type: ${value}. Valid types are: ${VALID_ASSET_TYPES.join(", ")}`,
      );
    }
    return new AssetType({ value: value as AssetTypeValue });
  }

  getValue(): AssetTypeValue {
    return this.props.value;
  }

  /**
   * カード関連のアセットかどうか
   */
  isCardAsset(): boolean {
    return this.props.value === "card" || this.props.value === "card-back";
  }

  /**
   * パック関連のアセットかどうか
   */
  isPackAsset(): boolean {
    return this.props.value === "pack-front" || this.props.value === "pack-back";
  }

  toString(): string {
    return this.props.value;
  }
}
