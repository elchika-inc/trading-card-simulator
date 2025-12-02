import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./badge";

/**
 * shadcn/ui Badge コンポーネントのストーリー
 *
 * ステータスやタグを表示するための小さなラベルコンポーネントです。
 * default, secondary, destructive, outline の4つのバリエーションがあります。
 */
const meta = {
  title: "UI/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline"],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルトバッジ
 */
export const Default: Story = {
  args: {
    children: "Badge",
    variant: "default",
  },
};

/**
 * セカンダリーバッジ
 */
export const Secondary: Story = {
  args: {
    children: "Secondary",
    variant: "secondary",
  },
};

/**
 * 破壊的アクション用バッジ（削除、エラーなど）
 */
export const Destructive: Story = {
  args: {
    children: "Error",
    variant: "destructive",
  },
};

/**
 * アウトラインバッジ
 */
export const Outline: Story = {
  args: {
    children: "Outline",
    variant: "outline",
  },
};

/**
 * ステータスバッジの例
 */
export const StatusBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Active</Badge>
      <Badge variant="secondary">Pending</Badge>
      <Badge variant="destructive">Rejected</Badge>
      <Badge variant="outline">Draft</Badge>
    </div>
  ),
};

/**
 * カードレアリティバッジ（このプロジェクト用）
 */
export const CardRarities: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge className="bg-red-500 hover:bg-red-600">🔥 Hot</Badge>
      <Badge className="bg-pink-500 hover:bg-pink-600">💕 Cute</Badge>
      <Badge className="bg-blue-500 hover:bg-blue-600">❄️ Cool</Badge>
      <Badge className="bg-purple-900 hover:bg-purple-950">🖤 Dark</Badge>
      <Badge className="bg-gray-200 text-gray-900 hover:bg-gray-300">🤍 White</Badge>
    </div>
  ),
};

/**
 * 数字バッジ（通知カウント）
 */
export const NumberBadges: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span>Messages</span>
        <Badge variant="default">3</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span>Notifications</span>
        <Badge variant="destructive">12</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span>Updates</span>
        <Badge variant="secondary">New</Badge>
      </div>
    </div>
  ),
};

/**
 * サイズバリエーション
 */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Badge className="text-xs px-2 py-0.5">Small</Badge>
      <Badge>Default</Badge>
      <Badge className="text-sm px-3 py-1">Large</Badge>
    </div>
  ),
};

/**
 * カスタムカラー
 */
export const CustomColors: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge className="bg-green-500 hover:bg-green-600">Success</Badge>
      <Badge className="bg-yellow-500 text-black hover:bg-yellow-600">Warning</Badge>
      <Badge className="bg-blue-500 hover:bg-blue-600">Info</Badge>
      <Badge className="bg-orange-500 hover:bg-orange-600">Alert</Badge>
    </div>
  ),
};

/**
 * クリック可能なバッジ
 */
export const Clickable: Story = {
  render: () => (
    <div className="flex gap-2">
      <button type="button" className="inline-block" onClick={() => alert("Badge clicked!")}>
        <Badge variant="default">Clickable Badge</Badge>
      </button>
      <button type="button" className="inline-block" onClick={() => alert("Badge clicked!")}>
        <Badge variant="outline">Click Me</Badge>
      </button>
    </div>
  ),
};
