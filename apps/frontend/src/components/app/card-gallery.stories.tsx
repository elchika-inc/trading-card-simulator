import type { Card } from "@repo/types";
import type { Meta, StoryObj } from "@storybook/react";
import { CardGallery } from "./card-gallery";

/**
 * CardGallery - カードギャラリーコンポーネント
 *
 * バックエンドAPIからカードデータを取得して表示するギャラリーコンポーネントです。
 * グリッドレイアウトでカードを一覧表示し、クリックでモーダル拡大表示できます。
 *
 * 注意: このストーリーはAPIモックを使用しているため、実際の動作とは異なる場合があります。
 * 実際の動作確認は開発サーバー（bun run dev）で行ってください。
 */
const meta = {
  title: "App/CardGallery",
  component: CardGallery,
  parameters: {
    layout: "fullscreen",
    // APIコールをモック化
    mockData: [
      {
        url: "http://localhost:8787/api/cards",
        method: "GET",
        status: 200,
        response: {
          cards: generateMockCards(12),
          total: 12,
          timestamp: new Date().toISOString(),
        },
      },
    ],
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CardGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * モックカードデータを生成
 */
function generateMockCards(count: number): Card[] {
  const holoTypes = [
    "phoenix",
    "frozen",
    "candy-swirl",
    "shadow-warp",
    "ethereal-light",
    "rainbow",
  ];
  const textStyles = ["fire", "frostbite", "cotton-candy", "void-script", "ethereal-glow", "holo"];
  const rarities = ["hot", "cute", "cool", "dark", "white"] as const;
  const icons = ["Flame", "Snowflake", "Heart", "Moon", "Sparkles", "Rainbow"];

  const templates = [
    {
      name: "炎の猫",
      type: "Style: Phoenix, Anim: Blaze",
      description: "燃え盛る炎を纏った猫。その瞳には不死鳥の力が宿る。",
      image: "1-1-1_Gemini_Generated_Image_mucfs2mucfs2mucf.png",
    },
    {
      name: "氷の猫",
      type: "Style: Frozen, Anim: Glacier",
      description: "永遠の氷に包まれた神秘的な猫。周囲の温度を瞬時に下げる。",
      image: "2-1-1_Gemini_Generated_Image_ubst2lubst2lubst.png",
    },
    {
      name: "お菓子の猫",
      type: "Style: Candy, Anim: Bubbles",
      description: "甘いお菓子の香りが漂う、とってもかわいい猫。みんなを笑顔にする。",
      image: "3-1-1_Gemini_Generated_Image_zcoszszcoszszcos.png",
    },
    {
      name: "影の猫",
      type: "Style: Shadow, Anim: Void",
      description: "闇の奥底から現れた謎の猫。影を操り、姿を消すことができる。",
      image: "4-1-1_Gemini_Generated_Image_m1suo4m1suo4m1su.png",
    },
    {
      name: "光の猫",
      type: "Style: Ethereal, Anim: Shimmer",
      description: "純白の光を放つ神聖な猫。あらゆる闇を浄化する力を持つ。",
      image: "5-1-1_Gemini_Generated_Image_coi7hbcoi7hbcoi7.png",
    },
    {
      name: "虹の猫",
      type: "Style: Rainbow, Anim: Spectrum",
      description: "七色の輝きを放つ幻想的な猫。見る者を魅了する美しさ。",
      image: "1-1-2_Gemini_Generated_Image_n0ze78n0ze78n0ze.png",
    },
  ];

  return Array.from({ length: count }, (_, i) => {
    const template = templates[i % templates.length];
    return {
      id: i + 1,
      count: Math.floor(Math.random() * 5) + 1,
      name: template.name,
      type: template.type,
      holoType: holoTypes[i % holoTypes.length],
      textStyle: textStyles[i % textStyles.length],
      image: template.image,
      description: template.description,
      iconName: icons[i % icons.length],
      rarity: rarities[i % rarities.length],
    } as Card;
  });
}

/**
 * デフォルト - 12枚のカード表示
 */
export const Default: Story = {};

/**
 * 少量のカード（3枚）
 */
export const FewCards: Story = {
  parameters: {
    mockData: [
      {
        url: "http://localhost:8787/api/cards",
        method: "GET",
        status: 200,
        response: {
          cards: generateMockCards(3),
          total: 3,
          timestamp: new Date().toISOString(),
        },
      },
    ],
  },
};

/**
 * 大量のカード（24枚）
 */
export const ManyCards: Story = {
  parameters: {
    mockData: [
      {
        url: "http://localhost:8787/api/cards",
        method: "GET",
        status: 200,
        response: {
          cards: generateMockCards(24),
          total: 24,
          timestamp: new Date().toISOString(),
        },
      },
    ],
  },
};

/**
 * ローディング状態
 *
 * 注意: Storybookでは実際のローディング状態を再現できません。
 * 実際のローディング表示を確認するには、開発サーバーで確認してください。
 */
export const Loading: Story = {
  parameters: {
    mockData: [
      {
        url: "http://localhost:8787/api/cards",
        method: "GET",
        delay: 999999, // 無限ローディング
        status: 200,
        response: { cards: [], total: 0 },
      },
    ],
  },
};

/**
 * エラー状態
 *
 * 注意: Storybookでは実際のエラー状態を再現できません。
 * 実際のエラー表示を確認するには、バックエンドを停止して開発サーバーで確認してください。
 */
export const ErrorState: Story = {
  parameters: {
    mockData: [
      {
        url: "http://localhost:8787/api/cards",
        method: "GET",
        status: 500,
        response: { error: "Internal Server Error" },
      },
    ],
  },
};

/**
 * カードなし（空の状態）
 */
export const EmptyState: Story = {
  parameters: {
    mockData: [
      {
        url: "http://localhost:8787/api/cards",
        method: "GET",
        status: 200,
        response: {
          cards: [],
          total: 0,
          timestamp: new Date().toISOString(),
        },
      },
    ],
  },
};

/**
 * レアリティ別フィルター（Hot）
 */
export const FilteredByHot: Story = {
  parameters: {
    mockData: [
      {
        url: "http://localhost:8787/api/cards?rarity=hot",
        method: "GET",
        status: 200,
        response: {
          cards: generateMockCards(6).map((card) => ({ ...card, rarity: "hot" as const })),
          total: 6,
          timestamp: new Date().toISOString(),
        },
      },
    ],
  },
};

/**
 * インタラクション例 - モーダル表示
 *
 * このストーリーでは、カードをクリックするとモーダルで拡大表示される動作を確認できます。
 * 実際に使用する際は、カードをクリックしてみてください。
 */
export const WithModalInteraction: Story = {
  play: async () => {
    // Storybookのインタラクションテストは、実際の開発サーバーで確認することを推奨します
    // ここでは基本的なレンダリングの確認のみ行います
  },
};
