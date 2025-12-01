import { ValueObject } from "../shared";

interface GachaLogIdProps {
  value: string;
}

/**
 * GachaLogId Value Object
 * ガチャログの識別子（UUID）
 */
export class GachaLogId extends ValueObject<GachaLogIdProps> {
  private constructor(props: GachaLogIdProps) {
    super(props);
  }

  static create(value: string): GachaLogId {
    if (!value || value.trim() === "") {
      throw new Error("GachaLogId cannot be empty");
    }
    return new GachaLogId({ value: value.trim() });
  }

  static generate(): GachaLogId {
    return new GachaLogId({ value: crypto.randomUUID() });
  }

  getValue(): string {
    return this.props.value;
  }
}
