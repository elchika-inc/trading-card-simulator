import { AggregateRoot } from "../shared";
import { GachaPackId } from "./gacha-pack-id";
import type { GachaRate } from "./gacha-rate";

export interface GachaPackProps {
  id: string;
  name: string;
  description: string;
  packImageUrl: string;
  cost: number;
  cardsPerPack: number;
  isActive: boolean;
  rates?: GachaRate[];
}

/**
 * GachaPack Aggregate Root
 * ガチャパックのルートエンティティ
 */
export class GachaPack extends AggregateRoot<GachaPackId> {
  private readonly name: string;
  private readonly description: string;
  private readonly packImageUrl: string;
  private readonly cost: number;
  private readonly cardsPerPack: number;
  private readonly isActive: boolean;
  private readonly rates: GachaRate[];

  private constructor(props: GachaPackProps & { rates: GachaRate[] }) {
    super(GachaPackId.create(props.id));
    this.name = props.name;
    this.description = props.description;
    this.packImageUrl = props.packImageUrl;
    this.cost = props.cost;
    this.cardsPerPack = props.cardsPerPack;
    this.isActive = props.isActive;
    this.rates = props.rates;
  }

  static create(props: GachaPackProps): GachaPack {
    if (props.cost < 0) {
      throw new Error("Cost must be non-negative");
    }
    if (props.cardsPerPack <= 0) {
      throw new Error("Cards per pack must be positive");
    }
    return new GachaPack({
      ...props,
      rates: props.rates || [],
    });
  }

  static reconstruct(props: GachaPackProps & { rates: GachaRate[] }): GachaPack {
    return new GachaPack(props);
  }

  getId(): GachaPackId {
    return this._id;
  }

  getName(): string {
    return this.name;
  }

  getDescription(): string {
    return this.description;
  }

  getPackImageUrl(): string {
    return this.packImageUrl;
  }

  getCost(): number {
    return this.cost;
  }

  getCardsPerPack(): number {
    return this.cardsPerPack;
  }

  getIsActive(): boolean {
    return this.isActive;
  }

  getRates(): GachaRate[] {
    return [...this.rates];
  }

  /**
   * 総重みを計算
   */
  getTotalWeight(): number {
    return this.rates.reduce((sum, rate) => sum + rate.getWeight().getValue(), 0);
  }

  toPlainObject() {
    return {
      id: this._id.getValue(),
      name: this.name,
      description: this.description,
      packImageUrl: this.packImageUrl,
      cost: this.cost,
      cardsPerPack: this.cardsPerPack,
      isActive: this.isActive,
      totalWeight: this.getTotalWeight(),
    };
  }
}
