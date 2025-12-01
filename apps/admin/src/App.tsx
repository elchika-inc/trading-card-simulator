import { useState } from "react";
import { ImageList } from "./components/admin/image-list";
import { ImageUpload } from "./components/admin/image-upload";
import { Separator } from "./components/ui/separator";

/**
 * Admin アプリケーション
 * 画像のアップロードと管理を行う
 */
export function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    // アップロード成功時に画像一覧を再読み込み
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Trading Card Simulator - 管理者ページ
            </h1>
            <p className="text-sm text-gray-600 mt-2">画像のアップロードと管理</p>
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

      {/* フッター */}
      <footer className="bg-white border-t mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-600">
          <p>Trading Card Simulator - Admin Panel v1.0.0</p>
          <p className="text-xs mt-2 text-gray-500">Powered by React, Vite, Tailwind CSS</p>
        </div>
      </footer>
    </div>
  );
}
