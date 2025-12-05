import { ValueObject } from "../shared/value-object";

interface AssetIdProps {
  value: string;
}

/**
 * AssetId Value Object
 * アセットを一意に識別するID（UUID形式の文字列）
 */
export class AssetId extends ValueObject<AssetIdProps> {
  private constructor(props: AssetIdProps) {
    super(props);
  }

  static create(value: string): AssetId {
    if (!value || value.trim().length === 0) {
      throw new Error("AssetId cannot be empty");
    }
    return new AssetId({ value: value.trim() });
  }

  getValue(): string {
    return this.props.value;
  }

  toString(): string {
    return this.props.value;
  }
}
