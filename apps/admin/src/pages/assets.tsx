import { ASSET_CATEGORY_LABELS, type AssetCategory } from "@repo/types";
import { useState } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AssetList } from "@/components/admin/asset-list";
import { AssetUpload } from "@/components/admin/asset-upload";
import { PackList } from "@/components/admin/pack-list";
import { PackUpload } from "@/components/admin/pack-upload";
import { Separator } from "@/components/ui/separator";

const ASSET_CATEGORIES: AssetCategory[] = ["card", "pack"];

/**
 * アセット管理ページ
 */
export function AssetsPage() {
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory>("card");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <AdminLayout title="アセット管理" description="カード画像・パック画像のアップロードと管理">
      {/* タブ切り替え */}
      <div className="bg-white/10 rounded-lg mb-6">
        <div className="flex gap-1 p-1">
          {ASSET_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 text-sm font-medium transition-colors rounded ${
                selectedCategory === category
                  ? "bg-white/20 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              {ASSET_CATEGORY_LABELS[category]}
            </button>
          ))}
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="space-y-8">
        {selectedCategory === "card" && (
          <>
            {/* カード画像: 一括アップロード対応 */}
            <section>
              <AssetUpload assetType="card" onUploadSuccess={handleUploadSuccess} multiple />
            </section>

            <Separator className="bg-white/20" />

            <section>
              <AssetList assetType="card" refreshTrigger={refreshTrigger} />
            </section>
          </>
        )}

        {selectedCategory === "pack" && (
          <>
            {/* パック: 表面・裏面を同時アップロード */}
            <section>
              <PackUpload onUploadSuccess={handleUploadSuccess} />
            </section>

            <Separator className="bg-white/20" />

            <section>
              <PackList refreshTrigger={refreshTrigger} />
            </section>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
