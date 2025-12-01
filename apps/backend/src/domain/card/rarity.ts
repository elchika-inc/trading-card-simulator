import { ValueObject } from "../shared/value-object";

/**
 * カードのレアリティタイプ
 */
export type RarityType = "hot" | "cute" | "cool" | "dark" | "white";

const VALID_RARITIES: RarityType[] = ["hot", "cute", "cool", "dark", "white"];

interface RarityProps {
  value: RarityType;
}

/**
 * Rarity Value Object
 * カードのレアリティ（希少度カテゴリ）
 */
export class Rarity extends ValueObject<RarityProps> {
  private constructor(props: RarityProps) {
    super(props);
  }

  static create(value: string): Rarity {
    if (!VALID_RARITIES.includes(value as RarityType)) {
      throw new Error(`Invalid rarity: ${value}. Must be one of: ${VALID_RARITIES.join(", ")}`);
    }
    return new Rarity({ value: value as RarityType });
  }

  getValue(): RarityType {
    return this.props.value;
  }

  /**
   * レアリティの表示名を取得
   */
  getDisplayName(): string {
    const displayNames: Record<RarityType, string> = {
      hot: "🔥 Hot",
      cute: "💕 Cute",
      cool: "❄️ Cool",
      dark: "🖤 Dark",
      white: "🤍 White",
    };
    return displayNames[this.props.value];
  }

  /**
   * 有効なレアリティの一覧を取得
   */
  static getValidRarities(): ReadonlyArray<RarityType> {
    return VALID_RARITIES;
  }
}
