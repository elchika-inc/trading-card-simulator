/**
 * カード関連の型定義
 */

/**
 * ホログラムエフェクトのタイプ
 */
export type HoloType =
  // None
  | "none"
  // Basic / Classic
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
  // Special / Elements
  | "magma"
  | "cosmic"
  | "circuit"
  | "scales"
  | "glitter"
  | "waves"
  | "crystal"
  | "nebula"
  | "matrix"
  | "vortex"
  | "laser"
  | "sequins"
  | "marble"
  | "plasmatic"
  // Complex / New Patterns
  | "kaleidoscope"
  | "aurora"
  | "damascus"
  | "quantum"
  | "bio"
  | "hyperspeed"
  // Advanced / Artistic
  | "stained-glass"
  | "caustics"
  | "runes"
  | "blueprint"
  | "inferno"
  | "enchanted"
  // Complex / Ethereal
  | "moire"
  | "liquid-metal"
  | "cyber-glitch"
  | "nebula-storm"
  | "prismatic-shards"
  | "phantom-grid"
  // Animated / Dynamic
  | "animated-galaxy"
  | "animated-rain"
  | "animated-scan"
  | "animated-warp"
  | "animated-pulse"
  | "animated-shimmer"
  // Fire / Heat
  | "blaze"
  | "ember"
  | "hellfire"
  | "phoenix"
  // Cute / Kawaii
  | "hearts"
  | "bubbles"
  | "sparkle-dust"
  | "candy-swirl"
  // Cool / Cyber
  | "frozen"
  | "neon-grid"
  | "stealth"
  | "dark-matter"
  // Dark / Evil
  | "abyssal"
  | "shadow-warp"
  | "eclipsed"
  | "corrupted";

/**
 * テキストスタイルのタイプ
 */
export type TextStyleType =
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
  | "outline"
  | "3d-pop"
  | "matrix-text"
  | "magma-text"
  | "glass"
  // Phase 5 & 6
  | "toxic"
  | "deep-space"
  | "runic"
  | "ice-shard"
  | "blueprint-text"
  | "vapor"
  // Phase 7: Ethereal
  | "glitch-pro"
  | "liquid-chrome"
  | "ghost-fade"
  | "prism-shard"
  // Animated
  | "animated-glitch"
  | "breathing-glow"
  // Phase 10: Cute
  | "cotton-candy"
  | "bubblegum"
  // Phase 11: Cool
  | "frostbite"
  | "cyberpunk"
  // Phase 12: Dark
  | "shadow-whispers"
  | "void-script";

/**
 * カードのレアリティ（カテゴリ）
 */
export type CardRarity =
  | "hot" // 🔥 熱い
  | "cute" // 💕 かわいい
  | "cool" // ❄️ クール
  | "dark" // 🖤 ダーク
  | "white"; // 🤍 ホワイト

/**
 * カードデータの型定義
 */
export interface Card {
  /** カードID */
  id: number;
  /** 所持枚数 */
  count: number;
  /** カード名 */
  name: string;
  /** カードタイプ（Style: XXX, Anim: XXX） */
  type: string;
  /** ホログラムエフェクトタイプ */
  holoType: HoloType;
  /** テキストスタイル */
  textStyle: TextStyleType;
  /** 画像URL */
  image: string;
  /** 説明文 */
  description: string;
  /** アイコン名（lucide-reactのアイコン名） */
  iconName: string;
  /** レアリティ（カテゴリ） */
  rarity: CardRarity;
}

/**
 * カード作成リクエスト
 */
export interface CardCreateRequest {
  /** カード名 */
  name: string;
  /** ホログラムエフェクトタイプ */
  holoType: HoloType;
  /** テキストスタイル */
  textStyle: TextStyleType;
  /** 画像ID（R2にアップロードした画像のUUID） */
  imageId: string;
  /** 説明文 */
  description?: string;
  /** アイコン名（lucide-reactのアイコン名） */
  iconName?: string;
  /** レアリティ（カテゴリ） */
  rarity: CardRarity;
}

/**
 * カード作成レスポンス
 */
export interface CardCreateResponse {
  success: true;
  data: Card;
}

/**
 * カード一覧レスポンス
 */
export interface CardListResponse {
  success: true;
  data: {
    cards: Card[];
    total: number;
  };
}
