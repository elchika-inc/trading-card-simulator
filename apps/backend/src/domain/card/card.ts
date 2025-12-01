import { CardCreatedEvent } from "../events/card-created";
import { AggregateRoot } from "../shared/aggregate-root";
import { CardId } from "./card-id";
import { HoloType, type HoloTypeValue } from "./holo-type";
import { Rarity, type RarityType } from "./rarity";
import { TextStyle, type TextStyleValue } from "./text-style";

/**
 * Card作成時のプロパティ
 */
export interface CardProps {
  id: number;
  name: string;
  type: string;
  holoType: string;
  textStyle: string;
  imageUrl: string;
  description: string;
  iconName: string;
  rarity: string;
}

/**
 * Card Entity（Aggregate Root）
 * トレーディングカードを表すドメインエンティティ
 */
export class Card extends AggregateRoot<CardId> {
  private readonly _name: string;
  private readonly _type: string;
  private readonly _holoType: HoloType;
  private readonly _textStyle: TextStyle;
  private readonly _imageUrl: string;
  private readonly _description: string;
  private readonly _iconName: string;
  private readonly _rarity: Rarity;

  private constructor(
    id: CardId,
    name: string,
    type: string,
    holoType: HoloType,
    textStyle: TextStyle,
    imageUrl: string,
    description: string,
    iconName: string,
    rarity: Rarity,
  ) {
    super(id);
    this._name = name;
    this._type = type;
    this._holoType = holoType;
    this._textStyle = textStyle;
    this._imageUrl = imageUrl;
    this._description = description;
    this._iconName = iconName;
    this._rarity = rarity;
  }

  /**
   * 新しいカードを作成（ファクトリメソッド）
   */
  static create(props: CardProps): Card {
    const card = new Card(
      CardId.create(props.id),
      props.name,
      props.type,
      HoloType.create(props.holoType),
      TextStyle.create(props.textStyle),
      props.imageUrl,
      props.description,
      props.iconName,
      Rarity.create(props.rarity),
    );

    // ドメインイベントを発行
    card.addDomainEvent(new CardCreatedEvent(props.id));

    return card;
  }

  /**
   * 既存のカードを再構築（Repository用）
   * ドメインイベントは発行しない
   */
  static reconstruct(props: CardProps): Card {
    return new Card(
      CardId.create(props.id),
      props.name,
      props.type,
      HoloType.create(props.holoType),
      TextStyle.create(props.textStyle),
      props.imageUrl,
      props.description,
      props.iconName,
      Rarity.create(props.rarity),
    );
  }

  // Getters
  getId(): CardId {
    return this._id;
  }

  getName(): string {
    return this._name;
  }

  getType(): string {
    return this._type;
  }

  getHoloType(): HoloType {
    return this._holoType;
  }

  getTextStyle(): TextStyle {
    return this._textStyle;
  }

  getImageUrl(): string {
    return this._imageUrl;
  }

  getDescription(): string {
    return this._description;
  }

  getIconName(): string {
    return this._iconName;
  }

  getRarity(): Rarity {
    return this._rarity;
  }

  /**
   * カードがアニメーションエフェクトを持つかどうか
   */
  hasAnimatedEffect(): boolean {
    return this._holoType.isAnimated();
  }

  /**
   * カード情報をプレーンオブジェクトに変換
   * フロントエンドの型定義（packages/types）に合わせる
   */
  toPlainObject(): {
    id: number;
    name: string;
    type: string;
    holoType: HoloTypeValue;
    textStyle: TextStyleValue;
    image: string;
    description: string;
    iconName: string;
    rarity: RarityType;
    count: number;
  } {
    return {
      id: this._id.getValue(),
      name: this._name,
      type: this._type,
      holoType: this._holoType.getValue(),
      textStyle: this._textStyle.getValue(),
      image: this._imageUrl,
      description: this._description,
      iconName: this._iconName,
      rarity: this._rarity.getValue(),
      count: 1, // デフォルト値（所持枚数は別途管理）
    };
  }
}
