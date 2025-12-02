import type { Card } from "@repo/types";
import type { Meta, StoryObj } from "@storybook/react";
import { HoloCard } from "./holo-card";

/**
 * HoloCard - ホログラフィックカードコンポーネント
 *
 * マウス/タッチイベントに反応して3D変形とホログラム効果を表示するカードコンポーネントです。
 * 60種類以上のホログラムエフェクトと40種類以上のテキストスタイルに対応しています。
 */
const meta = {
  title: "App/HoloCard",
  component: HoloCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    onClick: { action: "clicked" },
    className: { control: "text" },
    showCount: { control: "boolean" },
  },
} satisfies Meta<typeof HoloCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * サンプルカードデータ
 */
const sampleCards: Record<string, Card> = {
  fireCard: {
    id: 1,
    count: 3,
    name: "炎の猫",
    type: "Style: Phoenix, Anim: Blaze",
    holoType: "phoenix",
    textStyle: "fire",
    image: "1-1-1_Gemini_Generated_Image_mucfs2mucfs2mucf.png",
    description: "燃え盛る炎を纏った猫。その瞳には不死鳥の力が宿る。",
    iconName: "Flame",
    rarity: "hot",
  },
  iceCard: {
    id: 2,
    count: 1,
    name: "氷の猫",
    type: "Style: Frozen, Anim: Glacier",
    holoType: "frozen",
    textStyle: "frostbite",
    image: "2-1-1_Gemini_Generated_Image_ubst2lubst2lubst.png",
    description: "永遠の氷に包まれた神秘的な猫。周囲の温度を瞬時に下げる。",
    iconName: "Snowflake",
    rarity: "cool",
  },
  cuteCard: {
    id: 3,
    count: 5,
    name: "お菓子の猫",
    type: "Style: Candy, Anim: Bubbles",
    holoType: "candy-swirl",
    textStyle: "cotton-candy",
    image: "3-1-1_Gemini_Generated_Image_zcoszszcoszszcos.png",
    description: "甘いお菓子の香りが漂う、とってもかわいい猫。みんなを笑顔にする。",
    iconName: "Heart",
    rarity: "cute",
  },
  darkCard: {
    id: 4,
    count: 2,
    name: "影の猫",
    type: "Style: Shadow, Anim: Void",
    holoType: "shadow-warp",
    textStyle: "void-script",
    image: "4-1-1_Gemini_Generated_Image_m1suo4m1suo4m1su.png",
    description: "闇の奥底から現れた謎の猫。影を操り、姿を消すことができる。",
    iconName: "Moon",
    rarity: "dark",
  },
  whiteCard: {
    id: 5,
    count: 1,
    name: "光の猫",
    type: "Style: Ethereal, Anim: Shimmer",
    holoType: "ethereal-light",
    textStyle: "ethereal-glow",
    image: "5-1-1_Gemini_Generated_Image_coi7hbcoi7hbcoi7.png",
    description: "純白の光を放つ神聖な猫。あらゆる闇を浄化する力を持つ。",
    iconName: "Sparkles",
    rarity: "white",
  },
  rainbowCard: {
    id: 6,
    count: 1,
    name: "虹の猫",
    type: "Style: Rainbow, Anim: Spectrum",
    holoType: "rainbow",
    textStyle: "holo",
    image: "1-1-2_Gemini_Generated_Image_n0ze78n0ze78n0ze.png",
    description: "七色の輝きを放つ幻想的な猫。見る者を魅了する美しさ。",
    iconName: "Rainbow",
    rarity: "hot",
  },
};

/**
 * デフォルト - 炎の猫（Phoenixエフェクト）
 */
export const Default: Story = {
  args: {
    card: sampleCards.fireCard,
    className: "w-[260px] h-[400px]",
    showCount: true,
  },
};

/**
 * 氷の猫 - Frozenエフェクト + Frostbiteテキスト
 */
export const IceCard: Story = {
  args: {
    card: sampleCards.iceCard,
    className: "w-[260px] h-[400px]",
    showCount: true,
  },
};

/**
 * お菓子の猫 - Candy Swirlエフェクト + Cotton Candyテキスト
 */
export const CuteCard: Story = {
  args: {
    card: sampleCards.cuteCard,
    className: "w-[260px] h-[400px]",
    showCount: true,
  },
};

/**
 * 影の猫 - Shadow Warpエフェクト + Void Scriptテキスト
 */
export const DarkCard: Story = {
  args: {
    card: sampleCards.darkCard,
    className: "w-[260px] h-[400px]",
    showCount: true,
  },
};

/**
 * 光の猫 - Ethereal Lightエフェクト + Ethereal Glowテキスト
 */
export const WhiteCard: Story = {
  args: {
    card: sampleCards.whiteCard,
    className: "w-[260px] h-[400px]",
    showCount: true,
  },
};

/**
 * 虹の猫 - Rainbowエフェクト + Holoテキスト
 */
export const RainbowCard: Story = {
  args: {
    card: sampleCards.rainbowCard,
    className: "w-[260px] h-[400px]",
    showCount: true,
  },
};

/**
 * 大きいサイズ（モーダル表示サイズ）
 */
export const LargeSize: Story = {
  args: {
    card: sampleCards.fireCard,
    className: "w-[400px] h-[600px]",
    showCount: true,
  },
};

/**
 * 小さいサイズ
 */
export const SmallSize: Story = {
  args: {
    card: sampleCards.iceCard,
    className: "w-[200px] h-[300px]",
    showCount: true,
  },
};

/**
 * 所持枚数バッジ非表示
 */
export const WithoutCountBadge: Story = {
  args: {
    card: sampleCards.cuteCard,
    className: "w-[260px] h-[400px]",
    showCount: false,
  },
};

/**
 * クリックイベント付き
 */
export const WithClickEvent: Story = {
  args: {
    card: sampleCards.darkCard,
    className: "w-[260px] h-[400px]",
    showCount: true,
    onClick: () => alert(`${sampleCards.darkCard.name}がクリックされました！`),
  },
};

/**
 * 全レアリティ一覧
 */
export const AllRarities: Story = {
  render: () => (
    <div className="flex flex-wrap gap-6 max-w-6xl">
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-400">🔥 Hot (熱い)</p>
        <HoloCard card={sampleCards.fireCard} className="w-[220px] h-[330px]" />
      </div>
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-400">💕 Cute (かわいい)</p>
        <HoloCard card={sampleCards.cuteCard} className="w-[220px] h-[330px]" />
      </div>
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-400">❄️ Cool (クール)</p>
        <HoloCard card={sampleCards.iceCard} className="w-[220px] h-[330px]" />
      </div>
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-400">🖤 Dark (ダーク)</p>
        <HoloCard card={sampleCards.darkCard} className="w-[220px] h-[330px]" />
      </div>
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-400">🤍 White (ホワイト)</p>
        <HoloCard card={sampleCards.whiteCard} className="w-[220px] h-[330px]" />
      </div>
    </div>
  ),
};

/**
 * ホログラムエフェクト比較
 */
export const HoloEffectComparison: Story = {
  render: () => (
    <div className="flex flex-wrap gap-6 max-w-6xl">
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-400">Phoenix</p>
        <HoloCard
          card={{ ...sampleCards.fireCard, holoType: "phoenix" }}
          className="w-[200px] h-[300px]"
        />
      </div>
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-400">Rainbow</p>
        <HoloCard
          card={{ ...sampleCards.fireCard, holoType: "rainbow" }}
          className="w-[200px] h-[300px]"
        />
      </div>
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-400">Galaxy</p>
        <HoloCard
          card={{ ...sampleCards.fireCard, holoType: "animated-galaxy" }}
          className="w-[200px] h-[300px]"
        />
      </div>
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-400">Crystal</p>
        <HoloCard
          card={{ ...sampleCards.fireCard, holoType: "crystal" }}
          className="w-[200px] h-[300px]"
        />
      </div>
    </div>
  ),
};

/**
 * テキストスタイル比較
 */
export const TextStyleComparison: Story = {
  render: () => (
    <div className="flex flex-wrap gap-6 max-w-6xl">
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-400">Fire</p>
        <HoloCard
          card={{ ...sampleCards.fireCard, textStyle: "fire" }}
          className="w-[200px] h-[300px]"
        />
      </div>
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-400">Gold</p>
        <HoloCard
          card={{ ...sampleCards.fireCard, textStyle: "gold" }}
          className="w-[200px] h-[300px]"
        />
      </div>
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-400">Neon</p>
        <HoloCard
          card={{ ...sampleCards.fireCard, textStyle: "neon" }}
          className="w-[200px] h-[300px]"
        />
      </div>
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-400">Glitch</p>
        <HoloCard
          card={{ ...sampleCards.fireCard, textStyle: "animated-glitch" }}
          className="w-[200px] h-[300px]"
        />
      </div>
    </div>
  ),
};
