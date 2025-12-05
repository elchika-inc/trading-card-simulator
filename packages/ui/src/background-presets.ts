import type { BackgroundPreset, BackgroundPresetId } from "@repo/types";

/**
 * 背景プリセット定義
 *
 * adminから選択可能な背景パターンを定義
 */
export const BACKGROUND_PRESETS: Record<BackgroundPresetId, BackgroundPreset> = {
  "purple-cosmos": {
    id: "purple-cosmos",
    name: "パープルコスモス",
    colors: {
      from: "#0f0c29",
      via: "#302b63",
      to: "#24243e",
    },
    showParticles: true,
    animate: true,
  },
  "blue-ocean": {
    id: "blue-ocean",
    name: "ブルーオーシャン",
    colors: {
      from: "#0f2027",
      via: "#203a43",
      to: "#2c5364",
    },
    showParticles: true,
    animate: true,
  },
  "dark-abyss": {
    id: "dark-abyss",
    name: "ダークアビス",
    colors: {
      from: "#0a0a0a",
      via: "#1a1a2e",
      to: "#16213e",
    },
    showParticles: true,
    animate: true,
  },
  "sunset-glow": {
    id: "sunset-glow",
    name: "サンセットグロウ",
    colors: {
      from: "#1a1a2e",
      via: "#6b2d5c",
      to: "#f39c12",
    },
    showParticles: true,
    animate: true,
  },
  "emerald-forest": {
    id: "emerald-forest",
    name: "エメラルドフォレスト",
    colors: {
      from: "#0d3b2e",
      via: "#145a32",
      to: "#1e8449",
    },
    showParticles: true,
    animate: true,
  },
};

/**
 * 全プリセットIDの配列
 */
export const BACKGROUND_PRESET_IDS: BackgroundPresetId[] = Object.keys(
  BACKGROUND_PRESETS,
) as BackgroundPresetId[];

/**
 * デフォルトのプリセットID
 */
export const DEFAULT_BACKGROUND_PRESET_ID: BackgroundPresetId = "purple-cosmos";
