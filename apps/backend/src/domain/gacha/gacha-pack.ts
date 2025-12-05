import { AggregateRoot } from "../shared";
import { GachaPackId } from "./gacha-pack-id";
import type { GachaRate } from "./gacha-rate";

export interface GachaPackProps {
  id: string;
  name: string;
  description: string;
  /** パック画像セットID（表面・裏面をまとめて管理） */
  packSetId: string | null;
  cost: number;
  cardsPerPack: number;
  isActive: boolean;
  rates?: GachaRate[];
  groupId?: string | null;
  // UI表示用プロパティ
  subTitle?: string;
  contentsInfo?: string;
  colorFrom?: string;
  colorTo?: string;
  accentColor?: string;
  icon?: string;
  rareRate?: string;
  backTitle?: string;
  featureTitle?: string;
  sortOrder?: number;
}

/**
 * GachaPack Aggregate Root
 * ガチャパックのルートエンティティ
 */
export class GachaPack extends AggregateRoot<GachaPackId> {
  private readonly name: string;
  private readonly description: string;
  /** パック画像セットID（表面・裏面をまとめて管理） */
  private readonly packSetId: string | null;
  private readonly cost: number;
  private readonly cardsPerPack: number;
  private readonly isActive: boolean;
  private readonly rates: GachaRate[];
  private readonly groupId: string | null;
  // UI表示用プロパティ
  private readonly subTitle: string;
  private readonly contentsInfo: string;
  private readonly colorFrom: string;
  private readonly colorTo: string;
  private readonly accentColor: string;
  private readonly icon: string;
  private readonly rareRate: string;
  private readonly backTitle: string;
  private readonly featureTitle: string;
  private readonly sortOrder: number;

  private constructor(props: GachaPackProps & { rates: GachaRate[] }) {
    super(GachaPackId.create(props.id));
    this.name = props.name;
    this.description = props.description;
    this.packSetId = props.packSetId;
    this.cost = props.cost;
    this.cardsPerPack = props.cardsPerPack;
    this.isActive = props.isActive;
    this.rates = props.rates;
    this.groupId = props.groupId ?? null;
    // UI表示用プロパティ（デフォルト値付き）
    this.subTitle = props.subTitle ?? "";
    this.contentsInfo = props.contentsInfo ?? "1パック / 5枚入り";
    this.colorFrom = props.colorFrom ?? "from-purple-500";
    this.colorTo = props.colorTo ?? "to-purple-700";
    this.accentColor = props.accentColor ?? "bg-purple-600";
    this.icon = props.icon ?? "📦";
    this.rareRate = props.rareRate ?? "";
    this.backTitle = props.backTitle ?? "PACK INFO";
    this.featureTitle = props.featureTitle ?? "Pickup Feature";
    this.sortOrder = props.sortOrder ?? 0;
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

  /**
   * パック画像セットIDを取得
   * このIDを使って画像APIから表面・裏面の画像を取得できる
   */
  getPackSetId(): string | null {
    return this.packSetId;
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

  // UI表示用プロパティのゲッター
  getSubTitle(): string {
    return this.subTitle;
  }

  getContentsInfo(): string {
    return this.contentsInfo;
  }

  getColorFrom(): string {
    return this.colorFrom;
  }

  getColorTo(): string {
    return this.colorTo;
  }

  getAccentColor(): string {
    return this.accentColor;
  }

  getIcon(): string {
    return this.icon;
  }

  getRareRate(): string {
    return this.rareRate;
  }

  getBackTitle(): string {
    return this.backTitle;
  }

  getFeatureTitle(): string {
    return this.featureTitle;
  }

  getSortOrder(): number {
    return this.sortOrder;
  }

  getGroupId(): string | null {
    return this.groupId;
  }

  /**
   * 総重みを計算
   */
  getTotalWeight(): number {
    return this.rates.reduce((sum, rate) => sum + rate.getWeight().getValue(), 0);
  }

  /**
   * ピックアップカードのIDリストを取得
   */
  getPickupCardIds(): number[] {
    return this.rates
      .filter((rate) => rate.getIsPickup())
      .map((rate) => rate.getCardId().getValue());
  }

  toPlainObject() {
    return {
      id: this._id.getValue(),
      name: this.name,
      description: this.description,
      packSetId: this.packSetId,
      cost: this.cost,
      cardsPerPack: this.cardsPerPack,
      isActive: this.isActive,
      totalWeight: this.getTotalWeight(),
      groupId: this.groupId,
      // UI表示用プロパティ
      subTitle: this.subTitle,
      contentsInfo: this.contentsInfo,
      colorFrom: this.colorFrom,
      colorTo: this.colorTo,
      accentColor: this.accentColor,
      icon: this.icon,
      rareRate: this.rareRate,
      backTitle: this.backTitle,
      featureTitle: this.featureTitle,
      sortOrder: this.sortOrder,
    };
  }
}
