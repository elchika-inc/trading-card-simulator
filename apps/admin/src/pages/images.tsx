import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImageList } from "@/components/admin/image-list";
import { ImageUpload } from "@/components/admin/image-upload";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

/**
 * 画像管理ページ
 */
export function ImagesPage() {
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
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
              <h1 className="text-2xl font-bold text-gray-900">画像管理</h1>
              <p className="text-sm text-gray-600">画像のアップロードと一覧表示</p>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-8">
          {/* 画像アップロードセクション */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-900">画像アップロード</h2>
            <ImageUpload onUploadSuccess={handleUploadSuccess} />
          </section>

          <Separator />

          {/* 画像一覧セクション */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-gray-900">アップロード済み画像</h2>
            <ImageList refreshTrigger={refreshTrigger} />
          </section>
        </div>
      </main>
    </div>
  );
}
