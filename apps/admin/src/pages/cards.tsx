import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CardCreate } from "@/components/admin/card-create";
import { CardList } from "@/components/admin/card-list";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

/**
 * カード管理ページ
 */
export function CardsPage() {
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCardCreateSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              戻る
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">カード管理</h1>
              <p className="text-sm text-gray-600">カードの作成と一覧表示</p>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-8">
          {/* カード作成セクション */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-900">カード作成</h2>
            <CardCreate onCreateSuccess={handleCardCreateSuccess} />
          </section>

          <Separator />

          {/* カード一覧セクション */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-900">作成済みカード</h2>
            <CardList refreshTrigger={refreshTrigger} />
          </section>
        </div>
      </main>
    </div>
  );
}
