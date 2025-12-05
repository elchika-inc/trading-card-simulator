import { Dices, Layers, Newspaper, Palette, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/admin-layout";
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
      className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] bg-white/10 border-white/20 hover:bg-white/20"
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
        <div className="p-3 bg-white/10 rounded-lg">{icon}</div>
        <div>
          <CardTitle className="text-xl text-white">{title}</CardTitle>
          <CardDescription className="text-white/60">{description}</CardDescription>
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
    <AdminLayout
      title="Trading Card Simulator - 管理者ページ"
      description="管理機能を選択してください"
      showBackButton={false}
    >
      <div className="max-w-2xl mx-auto space-y-4">
        <MenuItem
          title="アセット管理"
          description="カード画像・カード背面・パック画像のアップロードと管理"
          icon={<Palette className="w-8 h-8 text-blue-400" />}
          onClick={() => navigate("/assets")}
        />

        <MenuItem
          title="カード管理"
          description="カードの作成と一覧表示"
          icon={<Layers className="w-8 h-8 text-purple-400" />}
          onClick={() => navigate("/cards")}
        />

        <MenuItem
          title="ガチャ管理"
          description="パックグループとパックの管理（注目カード・シリーズなど）"
          icon={<Dices className="w-8 h-8 text-orange-400" />}
          onClick={() => navigate("/gacha")}
        />

        <MenuItem
          title="News管理"
          description="ランディングページのカルーセルに表示されるNewsの管理"
          icon={<Newspaper className="w-8 h-8 text-green-400" />}
          onClick={() => navigate("/news")}
        />

        <MenuItem
          title="設定"
          description="背景やサイト全体の設定を管理"
          icon={<Settings className="w-8 h-8 text-gray-400" />}
          onClick={() => navigate("/settings")}
        />
      </div>

      {/* フッター */}
      <footer className="mt-12 text-center text-sm text-white/40">
        <p>Trading Card Simulator - Admin Panel v1.0.0</p>
      </footer>
    </AdminLayout>
  );
}
