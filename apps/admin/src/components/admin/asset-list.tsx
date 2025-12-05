import { ASSET_TYPE_LABELS, type AssetMetadata, type AssetType } from "@repo/types";
import { CardBackPreview } from "@repo/ui/card-back-preview";
import { HoloCard } from "@repo/ui/holo-card";
import { PackVisual } from "@repo/ui/pack-visual";
import { Check, Trash2, ZoomIn } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AssetPreviewModal } from "@/components/admin/asset-preview-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AssetListProps {
  assetType: AssetType;
  refreshTrigger?: number;
}

/**
 * Backend API レスポンスのアセット型
 */
interface BackendAsset {
  id: string;
  type: string;
  originalName: string;
  contentType: string;
  size: number;
  r2Key: string;
  hasWebP: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * アセット一覧コンポーネント
 */
export function AssetList({ assetType, refreshTrigger }: AssetListProps) {
  const [assets, setAssets] = useState<AssetMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activating, setActivating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [previewAsset, setPreviewAsset] = useState<AssetMetadata | null>(null);

  const label = ASSET_TYPE_LABELS[assetType];
  const imageApiUrl = import.meta.env.VITE_IMAGE_API_URL || "http://localhost:8788";
  const backendApiUrl = import.meta.env.VITE_API_URL || "http://localhost:8787";

  /**
   * アセットIDからURLを構築
   */
  const buildAssetUrl = useCallback(
    (id: string, thumbnail = false) => {
      const params = thumbnail ? "?width=320&format=auto" : "?format=auto";
      return `${imageApiUrl}/api/assets/${assetType}/${id}${params}`;
    },
    [assetType],
  );

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Backend API からアセット一覧を取得（isActive情報を含む）
      const response = await fetch(`${backendApiUrl}/api/assets/type/${assetType}`);

      if (!response.ok) {
        throw new Error("Failed to fetch assets");
      }

      const data = await response.json();
      if (data.success && data.assets) {
        // Backend API のレスポンスを AssetMetadata 形式に変換
        const convertedAssets: AssetMetadata[] = data.assets.map((asset: BackendAsset) => ({
          id: asset.id,
          type: asset.type as AssetType,
          url: buildAssetUrl(asset.id),
          thumbnailUrl: buildAssetUrl(asset.id, true),
          originalName: asset.originalName,
          contentType: asset.contentType,
          size: asset.size,
          uploadedAt: asset.createdAt,
          hasWebP: asset.hasWebP,
          isActive: asset.isActive,
        }));
        setAssets(convertedAssets);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load assets");
    } finally {
      setLoading(false);
    }
  }, [assetType, buildAssetUrl]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // refreshTriggerが変更されたらリストを再取得
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      fetchAssets();
    }
  }, [refreshTrigger, fetchAssets]);

  const handleActivate = async (asset: AssetMetadata) => {
    if (asset.isActive) return;

    setActivating(asset.id);

    try {
      // Backend API でアクティブに設定
      const response = await fetch(`${backendApiUrl}/api/assets/${asset.id}/activate`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: assetType }),
      });

      if (!response.ok) {
        throw new Error("Failed to activate asset");
      }

      // リストを更新
      setAssets((prev) =>
        prev.map((a) => ({
          ...a,
          isActive: a.id === asset.id,
        })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to activate asset");
    } finally {
      setActivating(null);
    }
  };

  const handleDelete = async (asset: AssetMetadata) => {
    if (!confirm(`「${asset.originalName}」を削除しますか？`)) return;

    setDeleting(asset.id);

    try {
      const imageApiUrl = import.meta.env.VITE_IMAGE_API_URL || "http://localhost:8788";
      const response = await fetch(`${imageApiUrl}/api/assets/${assetType}/${asset.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete asset");
      }

      // リストから削除
      setAssets((prev) => prev.filter((a) => a.id !== asset.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete asset");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Card className="bg-transparent border-none shadow-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">{label}画像一覧</CardTitle>
            <CardDescription className="text-white/60">
              アップロード済みの{label}画像（{assets.length}件）
            </CardDescription>
          </div>
          <Button onClick={fetchAssets} variant="outline" size="sm">
            再読み込み
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && <div className="text-sm text-white/60">読み込み中...</div>}

        {error && <div className="text-sm text-red-400">エラー: {error}</div>}

        {!loading && !error && assets.length === 0 && (
          <div className="text-sm text-white/60">{label}画像がアップロードされていません</div>
        )}

        {!loading && !error && assets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className={`relative p-3 border rounded-lg transition-all ${
                  asset.isActive
                    ? "border-green-500 bg-green-500/20"
                    : "border-white/20 bg-white/10 hover:border-white/40"
                }`}
              >
                {asset.isActive && (
                  <Badge className="absolute top-2 right-2 bg-green-600">
                    <Check className="w-3 h-3 mr-1" />
                    アクティブ
                  </Badge>
                )}

                {/* アセットタイプに応じたプレビュー（クリックで拡大） */}
                <button
                  type="button"
                  onClick={() => setPreviewAsset(asset)}
                  className="w-full cursor-pointer group relative"
                >
                  {assetType === "card" ? (
                    <div className="w-full aspect-[3/4] mb-3">
                      <HoloCard
                        card={{
                          id: 0,
                          count: 1,
                          name: asset.originalName.replace(/\.[^/.]+$/, ""),
                          type: "",
                          holoType: "basic",
                          textStyle: "default",
                          image: "",
                          description: "",
                          iconName: "Sparkles",
                          rarity: "cool",
                        }}
                        showCount={false}
                        imageUrl={asset.thumbnailUrl}
                        className="w-full h-full"
                      />
                    </div>
                  ) : assetType === "card-back" ? (
                    <CardBackPreview
                      imageUrl={asset.thumbnailUrl}
                      className="w-full aspect-[3/4] mb-3"
                    />
                  ) : assetType === "pack-front" || assetType === "pack-back" ? (
                    <PackVisual
                      frontImageUrl={asset.thumbnailUrl}
                      className="w-full aspect-[3/4] mb-3"
                    />
                  ) : (
                    <img
                      src={asset.thumbnailUrl}
                      alt={asset.originalName}
                      className="w-full aspect-[3/4] object-cover rounded mb-3"
                      loading="lazy"
                    />
                  )}
                  <div className="absolute inset-0 mb-3 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                    <ZoomIn className="w-8 h-8 text-white" />
                  </div>
                </button>

                <div className="space-y-2">
                  <div
                    className="text-sm font-medium truncate text-white"
                    title={asset.originalName}
                  >
                    {asset.originalName}
                  </div>

                  <div className="text-xs text-white/60">{(asset.size / 1024).toFixed(1)} KB</div>

                  <div className="flex gap-2">
                    {!asset.isActive && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleActivate(asset)}
                        disabled={activating === asset.id}
                        className="flex-1"
                      >
                        {activating === asset.id ? "設定中..." : "使用する"}
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(asset)}
                      disabled={deleting === asset.id}
                    >
                      {deleting === asset.id ? "..." : <Trash2 className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* プレビューモーダル */}
      <AssetPreviewModal
        asset={previewAsset}
        assetType={assetType}
        open={previewAsset !== null}
        onOpenChange={(open) => !open && setPreviewAsset(null)}
      />
    </Card>
  );
}
