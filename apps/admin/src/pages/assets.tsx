import { ASSET_TYPE_LABELS, type AssetType } from "@repo/types";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AssetList } from "@/components/admin/asset-list";
import { AssetUpload } from "@/components/admin/asset-upload";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const ASSET_TYPES: AssetType[] = ["card-back", "pack-front", "pack-back"];

/**
 * アセット管理ページ
 */
export function AssetsPage() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<AssetType>("card-back");
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
              <h1 className="text-2xl font-bold text-gray-900">アセット管理</h1>
              <p className="text-sm text-gray-600">
                カード背面画像・パック画像のアップロードと管理
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* タブ切り替え */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            {ASSET_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  selectedType === type
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {ASSET_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-8">
          {/* アップロードセクション */}
          <section>
            <AssetUpload assetType={selectedType} onUploadSuccess={handleUploadSuccess} />
          </section>

          <Separator />

          {/* 一覧セクション */}
          <section>
            <AssetList assetType={selectedType} refreshTrigger={refreshTrigger} />
          </section>
        </div>
      </main>
    </div>
  );
}
