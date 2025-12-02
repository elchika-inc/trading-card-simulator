import type { Card } from "@repo/types";

/**
 * パックタイプの型定義
 */
export interface PackType {
  id: string;
  name: string;
  subTitle?: string;
  description: string;
  contentsInfo: string;
  colorFrom: string;
  colorTo: string;
  accentColor: string;
  icon: string;
  rareRate: string;
  price: number;
  image: string | null;
  featuredCards: Card[];
  backTitle?: string;
  featureTitle?: string;
}

/**
 * パックの種類データ
 */
export const PACK_TYPES: PackType[] = [
  {
    id: "dragon-flame",
    name: "エンシェント・フレイム",
    subTitle: "Legendary Series",
    description: "伝説の炎竜が封印されたパック",
    contentsInfo: "1パック / 5枚入り",
    colorFrom: "from-red-500",
    colorTo: "to-orange-600",
    accentColor: "bg-red-600",
    icon: "🔥",
    rareRate: "SR確率UP",
    price: 150,
    image: null,
    featuredCards: [
      {
        id: 1,
        count: 1,
        name: "炎竜王",
        type: "Style: Phoenix, Anim: Blaze",
        holoType: "phoenix",
        textStyle: "fire",
        image: "1-1-1_Gemini_Generated_Image_mucfs2mucfs2mucf.png",
        description: "全てを焼き尽くす最強の竜。",
        iconName: "Flame",
        rarity: "hot",
      },
      {
        id: 2,
        count: 1,
        name: "フレア",
        type: "Style: Ember, Anim: Blaze",
        holoType: "ember",
        textStyle: "fire",
        image: "1-1-2_Gemini_Generated_Image_n0ze78n0ze78n0ze.png",
        description: "燃え盛る炎の精霊。",
        iconName: "Flame",
        rarity: "hot",
      },
      {
        id: 3,
        count: 1,
        name: "騎士",
        type: "Style: Basic, Anim: None",
        holoType: "basic",
        textStyle: "gold",
        image: "1-1-3_Gemini_Generated_Image_3sdvmb3sdvmb3sdv.png",
        description: "竜を狩る熟練の戦士。",
        iconName: "Sword",
        rarity: "hot",
      },
    ],
  },
  {
    id: "ocean-depths",
    name: "アビス・ブルー",
    description: "深海の守護神が眠るパック",
    contentsInfo: "1パック / 5枚入り",
    colorFrom: "from-blue-500",
    colorTo: "to-cyan-600",
    accentColor: "bg-blue-600",
    icon: "💧",
    rareRate: "水タイプ強化",
    price: 150,
    image: null,
    featuredCards: [
      {
        id: 6,
        count: 1,
        name: "海神",
        type: "Style: Frozen, Anim: None",
        holoType: "frozen",
        textStyle: "ice",
        image: "2-1-1_Gemini_Generated_Image_ubst2lubst2lubst.png",
        description: "深海を統べる絶対的な神。",
        iconName: "Waves",
        rarity: "cool",
      },
      {
        id: 7,
        count: 1,
        name: "人魚",
        type: "Style: Bubbles, Anim: None",
        holoType: "bubbles",
        textStyle: "ice",
        image: "2-1-2_Gemini_Generated_Image_vwrhg5vwrhg5vwrh.png",
        description: "美しい歌声で船を惑わす。",
        iconName: "Music",
        rarity: "cute",
      },
      {
        id: 8,
        count: 1,
        name: "クジラ",
        type: "Style: Waves, Anim: None",
        holoType: "waves",
        textStyle: "ice",
        image: "2-1-3_unnamed.jpg",
        description: "海を回遊する巨大生物。",
        iconName: "Waves",
        rarity: "cool",
      },
    ],
  },
  {
    id: "thunder-spark",
    name: "ボルテージ・スパーク",
    subTitle: "High Voltage",
    description: "雷鳴とともに現れる幻のポケモン",
    contentsInfo: "1パック / 10枚入り",
    colorFrom: "from-yellow-400",
    colorTo: "to-yellow-600",
    accentColor: "bg-yellow-500",
    icon: "⚡",
    rareRate: "グッズ排出UP",
    featureTitle: "ボーナス",
    price: 300,
    image: null,
    featuredCards: [
      {
        id: 11,
        count: 1,
        name: "雷獣",
        type: "Style: Neon, Anim: None",
        holoType: "neon-grid",
        textStyle: "neon",
        image: "3-1-1_Gemini_Generated_Image_zcoszszcoszszcos.png",
        description: "稲妻のような速さで駆ける獣。",
        iconName: "Zap",
        rarity: "hot",
      },
      {
        id: 12,
        count: 1,
        name: "ボルト",
        type: "Style: Neon, Anim: None",
        holoType: "neon-grid",
        textStyle: "neon",
        image: "3-1-2_Gemini_Generated_Image_wi84g1wi84g1wi84.png",
        description: "高圧電流を操る。",
        iconName: "Zap",
        rarity: "hot",
      },
      {
        id: 13,
        count: 1,
        name: "電池",
        type: "Style: Basic, Anim: None",
        holoType: "basic",
        textStyle: "gold",
        image: "3-1-3_Gemini_Generated_Image_clfqnzclfqnzclfq.png",
        description: "エネルギーを蓄える装置。",
        iconName: "Battery",
        rarity: "hot",
      },
    ],
  },
];
