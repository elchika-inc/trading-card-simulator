/**
 * ランディングページ用のフィーチャードカードデータ
 * 既存のカードデータから特徴的なカードを抽出
 */

import type { Card } from "@repo/types";

/**
 * カルーセル用のカードデータ配列
 * 異なるレアリティとエフェクトを持つカードを選択
 */
export const featuredCards: Card[] = [
  {
    id: 4,
    count: 1,
    name: "Phoenix Rising",
    type: "Style: Phoenix",
    holoType: "phoenix",
    textStyle: "fire",
    image: "/assets/1-1-1_Gemini_Generated_Image_mucfs2mucfs2mucf.png",
    description: "Reborn from ashes in a burst of light.",
    iconName: "Feather",
    rarity: "hot",
  },
  {
    id: 13,
    count: 2,
    name: "Neon Drift",
    type: "Style: Neon Grid",
    holoType: "neon-grid",
    textStyle: "cyberpunk",
    image: "/assets/1-1-2_Gemini_Generated_Image_n0ze78n0ze78n0ze.png",
    description: "Racing through the digital cityscape.",
    iconName: "Monitor",
    rarity: "cool",
  },
  {
    id: 29,
    count: 1,
    name: "Galactic Spin",
    type: "Anim: Galaxy",
    holoType: "animated-galaxy",
    textStyle: "neon-pink",
    image: "/assets/1-1-3_Gemini_Generated_Image_3sdvmb3sdvmb3sdv.png",
    description: "A spinning vortex of stars.",
    iconName: "Infinity",
    rarity: "white",
  },
];
