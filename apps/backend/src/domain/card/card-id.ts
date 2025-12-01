import { ValueObject } from "../shared/value-object";

interface CardIdProps {
  value: number;
}

/**
 * CardId Value Object
 * カードを一意に識別するID
 */
export class CardId extends ValueObject<CardIdProps> {
  private constructor(props: CardIdProps) {
    super(props);
  }

  static create(value: number): CardId {
    if (!Number.isInteger(value) || value <= 0) {
      throw new Error("CardId must be a positive integer");
    }
    return new CardId({ value });
  }

  getValue(): number {
    return this.props.value;
  }

  toString(): string {
    return String(this.props.value);
  }
}
