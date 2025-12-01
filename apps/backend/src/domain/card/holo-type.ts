import { ValueObject } from "../shared/value-object";

/**
 * ホログラムエフェクトタイプ
 * 60種類以上のホログラムエフェクト
 */
export type HoloTypeValue =
  // Basic / Classic
  | "none"
  | "basic"
  | "vertical"
  | "diagonal"
  | "sparkle"
  // Abstract / Texture
  | "ghost"
  | "rainbow"
  | "checker"
  | "cracked"
  | "hexagon"
  | "wireframe"
  | "oil"
  // Metal / Material
  | "gold"
  | "silver"
  | "brushed"
  | "carbon"
  // Fire / Heat
  | "magma"
  | "blaze"
  | "ember"
  | "phoenix"
  | "inferno"
  | "plasmatic"
  // Cute / Sweet
  | "hearts"
  | "bubbles"
  | "sparkle-dust"
  | "candy-swirl"
  // Cool / Tech
  | "frozen"
  | "neon-grid"
  | "stealth"
  | "circuit"
  | "matrix"
  // Dark / Shadow
  | "abyssal"
  | "shadow-warp"
  | "eclipsed"
  | "corrupted"
  | "dark-matter"
  | "hellfire"
  // Cosmic / Light
  | "cosmic"
  | "crystal"
  | "aurora"
  | "nebula"
  // Special
  | "scales"
  | "glitter"
  | "waves"
  | "vortex"
  | "laser"
  | "sequins"
  | "marble"
  | "kaleidoscope"
  | "damascus"
  | "quantum"
  | "bio"
  | "hyperspeed"
  | "stained-glass"
  | "caustics"
  | "runes"
  | "blueprint"
  | "enchanted"
  | "moire"
  | "liquid-metal"
  | "cyber-glitch"
  | "nebula-storm"
  | "prismatic-shards"
  | "phantom-grid"
  // Animated
  | "animated-galaxy"
  | "animated-shimmer"
  | "animated-rain"
  | "animated-scan"
  | "animated-warp"
  | "animated-pulse";

interface HoloTypeProps {
  value: HoloTypeValue;
}

/**
 * HoloType Value Object
 * カードのホログラムエフェクト
 */
export class HoloType extends ValueObject<HoloTypeProps> {
  private constructor(props: HoloTypeProps) {
    super(props);
  }

  static create(value: string): HoloType {
    // 空文字列やundefinedの場合はnoneとして扱う
    if (!value || value === "") {
      return new HoloType({ value: "none" });
    }
    return new HoloType({ value: value as HoloTypeValue });
  }

  getValue(): HoloTypeValue {
    return this.props.value;
  }

  /**
   * アニメーションエフェクトかどうか
   */
  isAnimated(): boolean {
    return this.props.value.startsWith("animated-");
  }

  /**
   * エフェクトなしかどうか
   */
  isNone(): boolean {
    return this.props.value === "none";
  }
}
