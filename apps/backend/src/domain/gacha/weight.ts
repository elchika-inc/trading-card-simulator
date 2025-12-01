import { ValueObject } from "../shared";

interface WeightProps {
  value: number;
}

/**
 * Weight Value Object
 * ガチャの重み（確率計算用）
 */
export class Weight extends ValueObject<WeightProps> {
  private constructor(props: WeightProps) {
    super(props);
  }

  static create(value: number): Weight {
    if (!Number.isInteger(value) || value <= 0) {
      throw new Error("Weight must be a positive integer");
    }
    return new Weight({ value });
  }

  getValue(): number {
    return this.props.value;
  }
}
