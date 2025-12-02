import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";

/**
 * shadcn/ui Input コンポーネントのストーリー
 *
 * テキスト入力フィールドのコンポーネントです。
 * 様々な type 属性に対応しています。
 */
const meta = {
  title: "UI/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "tel", "url", "search", "date", "time"],
    },
    disabled: {
      control: "boolean",
    },
    placeholder: {
      control: "text",
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト - テキスト入力
 */
export const Default: Story = {
  args: {
    type: "text",
    placeholder: "Enter text...",
  },
};

/**
 * メールアドレス入力
 */
export const Email: Story = {
  args: {
    type: "email",
    placeholder: "email@example.com",
  },
};

/**
 * パスワード入力
 */
export const Password: Story = {
  args: {
    type: "password",
    placeholder: "Enter password...",
  },
};

/**
 * 数値入力
 */
export const NumberInput: Story = {
  args: {
    type: "number",
    placeholder: "Enter number...",
  },
};

/**
 * 検索入力
 */
export const Search: Story = {
  args: {
    type: "search",
    placeholder: "Search...",
  },
};

/**
 * 日付入力
 */
export const DateInput: Story = {
  args: {
    type: "date",
  },
};

/**
 * 無効状態
 */
export const Disabled: Story = {
  args: {
    type: "text",
    placeholder: "Disabled input",
    disabled: true,
  },
};

/**
 * デフォルト値あり
 */
export const WithDefaultValue: Story = {
  args: {
    type: "text",
    defaultValue: "Default value",
  },
};

/**
 * ラベル付き入力
 */
export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2 w-[350px]">
      <Label htmlFor="username">Username</Label>
      <Input id="username" type="text" placeholder="Enter your username" />
    </div>
  ),
};

/**
 * フォーム例
 */
export const FormExample: Story = {
  render: () => (
    <div className="space-y-4 w-[350px]">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" type="text" placeholder="John Doe" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="john@example.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" placeholder="••••••••" />
      </div>
      <Button className="w-full">Submit</Button>
    </div>
  ),
};

/**
 * エラー状態
 */
export const WithError: Story = {
  render: () => (
    <div className="space-y-2 w-[350px]">
      <Label htmlFor="email-error">Email</Label>
      <Input
        id="email-error"
        type="email"
        placeholder="email@example.com"
        className="border-red-500 focus-visible:ring-red-500"
      />
      <p className="text-sm text-red-500">Please enter a valid email address.</p>
    </div>
  ),
};

/**
 * 成功状態
 */
export const WithSuccess: Story = {
  render: () => (
    <div className="space-y-2 w-[350px]">
      <Label htmlFor="email-success">Email</Label>
      <Input
        id="email-success"
        type="email"
        defaultValue="john@example.com"
        className="border-green-500 focus-visible:ring-green-500"
      />
      <p className="text-sm text-green-500">Email is valid!</p>
    </div>
  ),
};

/**
 * ファイル入力
 */
export const File: Story = {
  render: () => (
    <div className="space-y-2 w-[350px]">
      <Label htmlFor="file">Upload File</Label>
      <Input id="file" type="file" />
    </div>
  ),
};

/**
 * 複数行入力（textarea風）
 */
export const LargeText: Story = {
  render: () => (
    <div className="space-y-2 w-[350px]">
      <Label htmlFor="description">Description</Label>
      <textarea
        id="description"
        placeholder="Enter description..."
        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
      />
    </div>
  ),
};
