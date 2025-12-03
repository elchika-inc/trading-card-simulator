import { Image, Layers, Palette } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface MenuItemProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

function MenuItem({ title, description, icon, onClick }: MenuItemProps) {
  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={0}
      role="button"
    >
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="p-3 bg-gray-100 rounded-lg">{icon}</div>
        <div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
    </Card>
  );
}

/**
 * 管理者メニュー画面
 */
export function MenuPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Trading Card Simulator - 管理者ページ
          </h1>
          <p className="text-sm text-gray-600 mt-2">管理機能を選択してください</p>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="space-y-4">
          <MenuItem
            title="画像管理"
            description="画像のアップロードと一覧表示"
            icon={<Image className="w-8 h-8 text-blue-600" />}
            onClick={() => navigate("/images")}
          />

          <MenuItem
            title="カード管理"
            description="カードの作成と一覧表示"
            icon={<Layers className="w-8 h-8 text-purple-600" />}
            onClick={() => navigate("/cards")}
          />

          <MenuItem
            title="アセット管理"
            description="カード背面・パック画像のアップロードと管理"
            icon={<Palette className="w-8 h-8 text-green-600" />}
            onClick={() => navigate("/assets")}
          />
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-white border-t mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-600">
          <p>Trading Card Simulator - Admin Panel v1.0.0</p>
        </div>
      </footer>
    </div>
  );
}
