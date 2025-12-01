import type { CardId } from "../card";
import { Entity } from "../shared";
import type { GachaPackId } from "./gacha-pack-id";
import type { Weight } from "./weight";

export interface GachaRateProps {
  id: number;
  packId: GachaPackId;
  cardId: CardId;
  weight: Weight;
  isPickup: boolean;
}

/**
 * GachaRate Entity
 * ガチャの排出率定義
 */
export class GachaRate extends Entity<number> {
  private readonly packId: GachaPackId;
  private readonly cardId: CardId;
  private readonly weight: Weight;
  private readonly isPickup: boolean;

  private constructor(props: GachaRateProps) {
    super(props.id);
    this.packId = props.packId;
    this.cardId = props.cardId;
    this.weight = props.weight;
    this.isPickup = props.isPickup;
  }

  static create(props: GachaRateProps): GachaRate {
    return new GachaRate(props);
  }

  getPackId(): GachaPackId {
    return this.packId;
  }

  getCardId(): CardId {
    return this.cardId;
  }

  getWeight(): Weight {
    return this.weight;
  }

  getIsPickup(): boolean {
    return this.isPickup;
  }

  toPlainObject() {
    return {
      id: this.id,
      packId: this.packId.getValue(),
      cardId: this.cardId.getValue(),
      weight: this.weight.getValue(),
      isPickup: this.isPickup,
    };
  }
}
