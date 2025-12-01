import { ValueObject } from "../shared/value-object";

/**
 * テキストスタイルタイプ
 * 40種類以上のテキストスタイル
 */
export type TextStyleValue =
  // None
  | "none"
  // Metal
  | "gold"
  | "silver"
  | "steel"
  // Light / Energy
  | "neon"
  | "neon-pink"
  | "plasma"
  // Nature / Elements
  | "fire"
  | "ice"
  | "emerald"
  // Special
  | "holo"
  | "glitch"
  | "retro"
  | "comic"
  | "3d-pop"
  | "matrix-text"
  // Cute
  | "cotton-candy"
  | "bubblegum"
  // Cool
  | "frostbite"
  | "cyberpunk"
  // Dark
  | "shadow-whispers"
  | "void-script"
  | "deep-space"
  // Fire
  | "magma-text"
  // Tech
  | "blueprint-text"
  | "liquid-chrome"
  // Advanced
  | "ice-shard"
  | "ghost-fade"
  | "runic"
  | "toxic"
  | "glitch-pro"
  | "prism-shard";

interface TextStyleProps {
  value: TextStyleValue;
}

/**
 * TextStyle Value Object
 * カードのテキストスタイル
 */
export class TextStyle extends ValueObject<TextStyleProps> {
  private constructor(props: TextStyleProps) {
    super(props);
  }

  static create(value: string): TextStyle {
    // 空文字列やundefinedの場合はnoneとして扱う
    if (!value || value === "") {
      return new TextStyle({ value: "none" });
    }
    return new TextStyle({ value: value as TextStyleValue });
  }

  getValue(): TextStyleValue {
    return this.props.value;
  }

  /**
   * スタイルなしかどうか
   */
  isNone(): boolean {
    return this.props.value === "none";
  }
}
