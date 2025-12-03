import {
  ASSET_TYPE_LABELS,
  type AssetListResponse,
  type AssetMetadata,
  type AssetType,
} from "@repo/types";
import { Check, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AssetListProps {
  assetType: AssetType;
  refreshTrigger?: number;
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

  const label = ASSET_TYPE_LABELS[assetType];

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const imageApiUrl = import.meta.env.VITE_IMAGE_API_URL || "http://localhost:8788";
      const response = await fetch(`${imageApiUrl}/api/assets?type=${assetType}`);

      if (!response.ok) {
        throw new Error("Failed to fetch assets");
      }

      const data: AssetListResponse = await response.json();
      if (data.success && data.data) {
        setAssets(data.data.assets);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load assets");
    } finally {
      setLoading(false);
    }
  }, [assetType]);

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
      const imageApiUrl = import.meta.env.VITE_IMAGE_API_URL || "http://localhost:8788";
      const response = await fetch(`${imageApiUrl}/api/assets/${assetType}/${asset.id}/activate`, {
        method: "PUT",
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{label}画像一覧</CardTitle>
            <CardDescription>
              アップロード済みの{label}画像（{assets.length}件）
            </CardDescription>
          </div>
          <Button onClick={fetchAssets} variant="outline" size="sm">
            再読み込み
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && <div className="text-sm text-gray-500">読み込み中...</div>}

        {error && <div className="text-sm text-red-600">エラー: {error}</div>}

        {!loading && !error && assets.length === 0 && (
          <div className="text-sm text-gray-500">{label}画像がアップロードされていません</div>
        )}

        {!loading && !error && assets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className={`relative p-3 border rounded-lg transition-all ${
                  asset.isActive
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {asset.isActive && (
                  <Badge className="absolute top-2 right-2 bg-green-600">
                    <Check className="w-3 h-3 mr-1" />
                    アクティブ
                  </Badge>
                )}

                <img
                  src={asset.thumbnailUrl}
                  alt={asset.originalName}
                  className="w-full aspect-[3/4] object-cover rounded mb-3"
                  loading="lazy"
                />

                <div className="space-y-2">
                  <div className="text-sm font-medium truncate" title={asset.originalName}>
                    {asset.originalName}
                  </div>

                  <div className="text-xs text-gray-500">{(asset.size / 1024).toFixed(1)} KB</div>

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
    </Card>
  );
}
