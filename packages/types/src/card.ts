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
 * フレーム色のプリセット
 */
export type FrameColorPreset =
  | "default" // デフォルト（グレー）
  | "gold" // ゴールド
  | "silver" // シルバー
  | "bronze" // ブロンズ
  | "platinum" // プラチナ
  | "red" // 赤
  | "blue" // 青
  | "green" // 緑
  | "purple" // 紫
  | "pink" // ピンク
  | "orange" // オレンジ
  | "black" // 黒
  | "white" // 白
  | "rainbow" // レインボー（グラデーション）
  | "custom"; // カスタム（HEXカラー指定）

/**
 * フレーム色の設定
 * presetが "custom" の場合、customColorにHEXカラーを指定
 */
export interface FrameColor {
  /** プリセット色 */
  preset: FrameColorPreset;
  /** カスタムカラー（preset="custom"の場合に使用、例: "#FF0000"） */
  customColor?: string;
}

/**
 * レアリティ別のデフォルトフレーム色
 */
export const DEFAULT_FRAME_COLORS: Record<CardRarity, FrameColorPreset> = {
  hot: "red",
  cute: "pink",
  cool: "blue",
  dark: "black",
  white: "silver",
};

/**
 * フレーム色プリセットの表示名
 */
export const FRAME_COLOR_LABELS: Record<FrameColorPreset, string> = {
  default: "デフォルト",
  gold: "ゴールド",
  silver: "シルバー",
  bronze: "ブロンズ",
  platinum: "プラチナ",
  red: "レッド",
  blue: "ブルー",
  green: "グリーン",
  purple: "パープル",
  pink: "ピンク",
  orange: "オレンジ",
  black: "ブラック",
  white: "ホワイト",
  rainbow: "レインボー",
  custom: "カスタム",
};

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
  /** フレーム色（省略時はレアリティのデフォルト色を使用） */
  frameColor?: FrameColor;
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
  /** フレーム色（省略時はレアリティのデフォルト色を使用） */
  frameColor?: FrameColor;
  /** パック割当情報（オプション） */
  packAssignments?: Array<{
    packId: string;
    weight: number;
    isPickup?: boolean;
  }>;
}

/**
 * カード作成レスポンス
 */
export interface CardCreateResponse {
  success: true;
  data: Card;
}

/**
 * カード更新リクエスト
 */
export interface CardUpdateRequest {
  /** カード名 */
  name?: string;
  /** ホログラムエフェクトタイプ */
  holoType?: HoloType;
  /** テキストスタイル */
  textStyle?: TextStyleType;
  /** 画像ID（R2にアップロードした画像のUUID） */
  imageId?: string;
  /** 説明文 */
  description?: string;
  /** アイコン名（lucide-reactのアイコン名） */
  iconName?: string;
  /** レアリティ（カテゴリ） */
  rarity?: CardRarity;
  /** フレーム色 */
  frameColor?: FrameColor;
  /** パック割当情報（オプション、指定時は全置換） */
  packAssignments?: Array<{
    packId: string;
    weight: number;
    isPickup?: boolean;
  }>;
}

/**
 * カード更新レスポンス
 */
export interface CardUpdateResponse {
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

// ============================================================================
// パック割当関連の型定義
// ============================================================================

/**
 * Weight プリセット定義
 * 排出確率の設定に使用
 */
export const WEIGHT_PRESETS = [
  { label: "通常", weight: 100 },
  { label: "やや出にくい", weight: 50 },
  { label: "レア", weight: 25 },
  { label: "超レア", weight: 10 },
  { label: "激レア", weight: 5 },
] as const;

export type WeightPreset = (typeof WEIGHT_PRESETS)[number];

/**
 * カード視点のパック割当情報
 * カード編集画面で使用
 */
export interface PackAssignment {
  /** パックID */
  packId: string;
  /** パック名（UI表示用） */
  packName?: string;
  /** パックアイコン（UI表示用） */
  packIcon?: string;
  /** 排出weight */
  weight: number;
  /** ピックアップフラグ */
  isPickup?: boolean;
}

/**
 * パック視点のカード割当情報
 * パック編集画面で使用
 */
export interface CardAssignment {
  /** カードID */
  cardId: number;
  /** カード名（UI表示用） */
  cardName?: string;
  /** カードレアリティ（UI表示用） */
  cardRarity?: CardRarity;
  /** 排出weight */
  weight: number;
  /** ピックアップフラグ */
  isPickup?: boolean;
}

/**
 * カード詳細レスポンス（パック割当情報付き）
 */
export interface CardDetailResponse {
  success: true;
  data: {
    card: Card;
    packAssignments: PackAssignment[];
  };
}
