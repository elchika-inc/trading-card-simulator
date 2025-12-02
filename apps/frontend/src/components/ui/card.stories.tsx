import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";

/**
 * shadcn/ui Card コンポーネントのストーリー
 *
 * カード型のコンテナコンポーネントです。
 * Header, Title, Description, Content, Footer のサブコンポーネントで構成されます。
 *
 * 注意: このCardは shadcn/ui の汎用Cardコンポーネントです。
 * トレーディングカードを表示する HoloCard とは別のコンポーネントです。
 */
const meta = {
  title: "UI/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * デフォルト - 基本的なカード
 */
export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is the card content area.</p>
      </CardContent>
    </Card>
  ),
};

/**
 * フッター付きカード
 */
export const WithFooter: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Notification</CardTitle>
        <CardDescription>You have 3 unread messages.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">Check your inbox for new updates.</p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="default">Mark as Read</Button>
        <Button variant="outline">Dismiss</Button>
      </CardFooter>
    </Card>
  ),
};

/**
 * フォーム入力カード
 */
export const FormCard: Story = {
  render: () => (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>Enter your details to create a new account.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="John Doe"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="john@example.com"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Create Account</Button>
      </CardFooter>
    </Card>
  ),
};

/**
 * 統計情報カード
 */
export const StatsCard: Story = {
  render: () => (
    <Card className="w-[300px]">
      <CardHeader>
        <CardDescription>Total Revenue</CardDescription>
        <CardTitle className="text-3xl font-bold">$45,231.89</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
      </CardContent>
    </Card>
  ),
};

/**
 * 複数カードのグリッドレイアウト
 */
export const GridLayout: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 max-w-[800px]">
      <Card>
        <CardHeader>
          <CardTitle>Total Users</CardTitle>
          <CardDescription>Active users this month</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">2,543</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>New Signups</CardTitle>
          <CardDescription>Users joined this week</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">127</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>Current online users</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">834</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Revenue</CardTitle>
          <CardDescription>Total earnings this month</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">$12,345</p>
        </CardContent>
      </Card>
    </div>
  ),
};

/**
 * プロフィールカード
 */
export const ProfileCard: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400" />
          <div>
            <CardTitle>John Doe</CardTitle>
            <CardDescription>@johndoe</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">
          Full-stack developer passionate about creating beautiful and functional web applications.
        </p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="default" className="flex-1">
          Follow
        </Button>
        <Button variant="outline" className="flex-1">
          Message
        </Button>
      </CardFooter>
    </Card>
  ),
};

/**
 * カスタムスタイリング - グラデーション背景
 */
export const CustomStyling: Story = {
  render: () => (
    <Card className="w-[350px] bg-gradient-to-br from-purple-500 to-pink-500 text-white border-none">
      <CardHeader>
        <CardTitle>Premium Feature</CardTitle>
        <CardDescription className="text-purple-100">Unlock exclusive benefits</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          <li>✓ Unlimited access</li>
          <li>✓ Priority support</li>
          <li>✓ Advanced analytics</li>
        </ul>
      </CardContent>
      <CardFooter>
        <Button variant="secondary" className="w-full">
          Upgrade Now
        </Button>
      </CardFooter>
    </Card>
  ),
};
