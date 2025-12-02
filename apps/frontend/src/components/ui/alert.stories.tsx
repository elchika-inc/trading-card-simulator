import type { Meta, StoryObj } from "@storybook/react";
import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "./alert";

/**
 * shadcn/ui Alert コンポーネントのストーリー
 *
 * 重要な情報やメッセージを表示するためのコンポーネントです。
 * default と destructive の2つのバリエーションがあります。
 */
const meta = {
  title: "UI/Alert",
  component: Alert,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive"],
    },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト - 基本的なアラート
 */
export const Default: Story = {
  render: () => (
    <Alert className="w-[400px]">
      <Info className="h-4 w-4" />
      <AlertDescription>
        This is a basic alert message to inform users about important information.
      </AlertDescription>
    </Alert>
  ),
};

/**
 * エラーアラート（Destructive）
 */
export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive" className="w-[400px]">
      <XCircle className="h-4 w-4" />
      <AlertDescription>
        An error occurred while processing your request. Please try again.
      </AlertDescription>
    </Alert>
  ),
};

/**
 * 成功アラート
 */
export const Success: Story = {
  render: () => (
    <Alert className="w-[400px] border-green-500 text-green-700">
      <CheckCircle className="h-4 w-4" />
      <AlertDescription>Your changes have been saved successfully!</AlertDescription>
    </Alert>
  ),
};

/**
 * 警告アラート
 */
export const Warning: Story = {
  render: () => (
    <Alert className="w-[400px] border-yellow-500 text-yellow-700">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>Please review your input before submitting the form.</AlertDescription>
    </Alert>
  ),
};

/**
 * 情報アラート
 */
export const Information: Story = {
  render: () => (
    <Alert className="w-[400px] border-blue-500 text-blue-700">
      <Info className="h-4 w-4" />
      <AlertDescription>
        New features are now available! Check out the latest updates.
      </AlertDescription>
    </Alert>
  ),
};

/**
 * アイコンなしアラート
 */
export const WithoutIcon: Story = {
  render: () => (
    <Alert className="w-[400px]">
      <AlertDescription>This alert has no icon.</AlertDescription>
    </Alert>
  ),
};

/**
 * 複数行のアラート
 */
export const MultiLine: Story = {
  render: () => (
    <Alert className="w-[400px]">
      <Info className="h-4 w-4" />
      <AlertDescription>
        <p className="font-semibold mb-1">Important Update</p>
        <p>
          We've updated our privacy policy. Please review the changes to understand how we handle
          your data.
        </p>
      </AlertDescription>
    </Alert>
  ),
};

/**
 * アラートスタック
 */
export const AlertStack: Story = {
  render: () => (
    <div className="space-y-4 w-[400px]">
      <Alert className="border-green-500 text-green-700">
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>Profile updated successfully!</AlertDescription>
      </Alert>
      <Alert className="border-blue-500 text-blue-700">
        <Info className="h-4 w-4" />
        <AlertDescription>You have 3 new notifications.</AlertDescription>
      </Alert>
      <Alert className="border-yellow-500 text-yellow-700">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Your session will expire in 5 minutes.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>Failed to upload file. Please try again.</AlertDescription>
      </Alert>
    </div>
  ),
};

/**
 * カスタムスタイリング
 */
export const CustomStyling: Story = {
  render: () => (
    <Alert className="w-[400px] bg-purple-50 border-purple-500 text-purple-900">
      <Info className="h-4 w-4" />
      <AlertDescription>
        <strong>Pro Tip:</strong> You can customize the appearance of alerts using Tailwind classes.
      </AlertDescription>
    </Alert>
  ),
};

/**
 * アクションボタン付きアラート
 */
export const WithAction: Story = {
  render: () => (
    <Alert className="w-[400px]">
      <Info className="h-4 w-4" />
      <AlertDescription>
        <div className="flex items-center justify-between">
          <span>New version available!</span>
          <button
            type="button"
            className="ml-4 px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Update Now
          </button>
        </div>
      </AlertDescription>
    </Alert>
  ),
};

/**
 * カード収集通知（このプロジェクト用）
 */
export const CardCollectionNotification: Story = {
  render: () => (
    <div className="space-y-4 w-[400px]">
      <Alert className="border-purple-500 bg-purple-50 text-purple-900">
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>新しいカードを入手！</strong> 🔥 炎の猫 を手に入れました
        </AlertDescription>
      </Alert>
      <Alert className="border-pink-500 bg-pink-50 text-pink-900">
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>レアカード発見！</strong> 💕 お菓子の猫 (レア度: Cute)
        </AlertDescription>
      </Alert>
    </div>
  ),
};
