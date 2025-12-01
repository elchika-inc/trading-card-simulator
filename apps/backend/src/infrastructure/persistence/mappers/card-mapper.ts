import { Card } from "../../../domain/card";

/**
 * D1データベースのカードレコード型
 */
export interface CardRow {
  id: number;
  name: string;
  type: string;
  holo_type: string;
  text_style: string;
  image_url: string;
  description: string | null;
  icon_name: string | null;
  rarity: string;
  created_at: string;
}

/**
 * CardMapper
 * DB Row ↔ Domain Entity の変換を行う
 */
export class CardMapper {
  /**
   * DBレコードからDomain Entityに変換
   */
  static toDomain(row: CardRow): Card {
    return Card.reconstruct({
      id: row.id,
      name: row.name,
      type: row.type,
      holoType: row.holo_type,
      textStyle: row.text_style,
      imageUrl: row.image_url,
      description: row.description ?? "",
      iconName: row.icon_name ?? "",
      rarity: row.rarity,
    });
  }

  /**
   * Domain EntityからDBレコードに変換
   */
  static toPersistence(card: Card): Omit<CardRow, "created_at"> {
    return {
      id: card.getId().getValue(),
      name: card.getName(),
      type: card.getType(),
      holo_type: card.getHoloType().getValue(),
      text_style: card.getTextStyle().getValue(),
      image_url: card.getImageUrl(),
      description: card.getDescription() || null,
      icon_name: card.getIconName() || null,
      rarity: card.getRarity().getValue(),
    };
  }
}
