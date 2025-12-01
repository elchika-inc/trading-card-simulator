import { ValueObject } from "../shared";

interface GachaPackIdProps {
  value: string;
}

/**
 * GachaPackId Value Object
 * ガチャパックの識別子
 */
export class GachaPackId extends ValueObject<GachaPackIdProps> {
  private constructor(props: GachaPackIdProps) {
    super(props);
  }

  static create(value: string): GachaPackId {
    if (!value || value.trim() === "") {
      throw new Error("GachaPackId cannot be empty");
    }
    return new GachaPackId({ value: value.trim() });
  }

  getValue(): string {
    return this.props.value;
  }
}
