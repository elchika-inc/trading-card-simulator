import type { FrameColor } from "@repo/types";
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
  asset_id: string | null;
  description: string | null;
  icon_name: string | null;
  rarity: string;
  frame_color: string | null;
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
    // frame_colorをJSONからパース
    let frameColor: FrameColor | undefined;
    if (row.frame_color) {
      try {
        frameColor = JSON.parse(row.frame_color) as FrameColor;
      } catch {
        // パース失敗時はundefinedのまま
      }
    }

    return Card.reconstruct({
      id: row.id,
      name: row.name,
      type: row.type,
      holoType: row.holo_type,
      textStyle: row.text_style,
      assetId: row.asset_id,
      description: row.description ?? "",
      iconName: row.icon_name ?? "",
      rarity: row.rarity,
      frameColor,
    });
  }

  /**
   * Domain EntityからDBレコードに変換
   */
  static toPersistence(card: Card): Omit<CardRow, "created_at"> {
    const frameColor = card.getFrameColor();
    return {
      id: card.getId().getValue(),
      name: card.getName(),
      type: card.getType(),
      holo_type: card.getHoloType().getValue(),
      text_style: card.getTextStyle().getValue(),
      asset_id: card.getAssetId(),
      description: card.getDescription() || null,
      icon_name: card.getIconName() || null,
      rarity: card.getRarity().getValue(),
      frame_color: frameColor ? JSON.stringify(frameColor) : null,
    };
  }
}
