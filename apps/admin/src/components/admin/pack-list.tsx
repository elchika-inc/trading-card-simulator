import type { AssetListResponse, AssetMetadata } from "@repo/types";
import { PackVisual } from "@repo/ui/pack-visual";
import { Trash2, ZoomIn } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { PackPreviewModal } from "@/components/admin/pack-preview-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PackListProps {
  refreshTrigger?: number;
}

interface PackPair {
  packSetId: string;
  front: AssetMetadata | null;
  back: AssetMetadata | null;
  uploadedAt: string;
}

/**
 * パック画像一覧コンポーネント
 * packSetIdで表面・裏面をペアリングして表示
 */
export function PackList({ refreshTrigger }: PackListProps) {
  const [packs, setPacks] = useState<PackPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [previewPack, setPreviewPack] = useState<PackPair | null>(null);

  const fetchPacks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const imageApiUrl = import.meta.env.VITE_IMAGE_API_URL || "http://localhost:8788";

      // 表面と裏面を並行して取得
      const [frontResponse, backResponse] = await Promise.all([
        fetch(`${imageApiUrl}/api/assets?type=pack-front`),
        fetch(`${imageApiUrl}/api/assets?type=pack-back`),
      ]);

      if (!frontResponse.ok || !backResponse.ok) {
        throw new Error("Failed to fetch assets");
      }

      const frontData: AssetListResponse = await frontResponse.json();
      const backData: AssetListResponse = await backResponse.json();

      if (frontData.success && backData.success) {
        const frontAssets = frontData.data.assets;
        const backAssets = backData.data.assets;

        // packSetIdでグループ化してペアリング
        const pairMap = new Map<string, PackPair>();

        // 表面をマップに追加
        for (const front of frontAssets) {
          const setId = front.packSetId ?? front.id; // packSetIdがない場合はidをフォールバック
          const existing = pairMap.get(setId);
          if (existing) {
            existing.front = front;
          } else {
            pairMap.set(setId, {
              packSetId: setId,
              front,
              back: null,
              uploadedAt: front.uploadedAt,
            });
          }
        }

        // 裏面をマップに追加
        for (const back of backAssets) {
          const setId = back.packSetId ?? back.id; // packSetIdがない場合はidをフォールバック
          const existing = pairMap.get(setId);
          if (existing) {
            existing.back = back;
          } else {
            pairMap.set(setId, {
              packSetId: setId,
              front: null,
              back,
              uploadedAt: back.uploadedAt,
            });
          }
        }

        // 日付順にソート（新しい順）
        const pairs = Array.from(pairMap.values()).sort(
          (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
        );

        setPacks(pairs);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load packs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPacks();
  }, [fetchPacks]);

  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      fetchPacks();
    }
  }, [refreshTrigger, fetchPacks]);

  const handleDelete = async (pack: PackPair) => {
    if (!confirm("このパック画像を削除しますか？（表面・裏面の両方が削除されます）")) return;

    setDeleting(pack.packSetId);

    try {
      const imageApiUrl = import.meta.env.VITE_IMAGE_API_URL || "http://localhost:8788";

      // 表面と裏面の両方を削除
      const requests = [];
      if (pack.front) {
        requests.push(
          fetch(`${imageApiUrl}/api/assets/pack-front/${pack.front.id}`, {
            method: "DELETE",
          }),
        );
      }
      if (pack.back) {
        requests.push(
          fetch(`${imageApiUrl}/api/assets/pack-back/${pack.back.id}`, {
            method: "DELETE",
          }),
        );
      }

      const responses = await Promise.all(requests);
      for (const response of responses) {
        if (!response.ok) {
          throw new Error("Failed to delete pack");
        }
      }

      // リストから削除
      setPacks((prev) => prev.filter((p) => p.packSetId !== pack.packSetId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete pack");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Card className="bg-transparent border-none shadow-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">パック画像一覧</CardTitle>
            <CardDescription className="text-white/60">
              アップロード済みのパック画像（{packs.length}セット）
            </CardDescription>
          </div>
          <Button onClick={fetchPacks} variant="outline" size="sm">
            再読み込み
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && <div className="text-sm text-white/60">読み込み中...</div>}

        {error && <div className="text-sm text-red-400">エラー: {error}</div>}

        {!loading && !error && packs.length === 0 && (
          <div className="text-sm text-white/60">パック画像がアップロードされていません</div>
        )}

        {!loading && !error && packs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {packs.map((pack) => (
              <div
                key={pack.packSetId}
                className="relative p-3 border rounded-lg transition-all border-white/20 bg-white/10 hover:border-white/40"
              >
                {/* 表面・裏面を横並び表示（クリックで拡大） */}
                <button
                  type="button"
                  onClick={() => setPreviewPack(pack)}
                  className="w-full cursor-pointer group relative"
                >
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="space-y-1">
                      <div className="text-xs text-white/60 text-center">表面</div>
                      <PackVisual
                        frontImageUrl={pack.front?.thumbnailUrl}
                        className="w-full aspect-[3/4]"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-white/60 text-center">裏面</div>
                      <PackVisual
                        frontImageUrl={pack.back?.thumbnailUrl}
                        className="w-full aspect-[3/4]"
                      />
                    </div>
                  </div>
                  <div className="absolute inset-0 mb-3 mt-5 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                    <ZoomIn className="w-8 h-8 text-white" />
                  </div>
                </button>

                <div className="space-y-2">
                  <div className="text-xs text-white/60">
                    {new Date(pack.uploadedAt).toLocaleString("ja-JP")}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(pack)}
                      disabled={deleting === pack.packSetId}
                      className="flex-1"
                    >
                      {deleting === pack.packSetId ? "削除中..." : <Trash2 className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* プレビューモーダル */}
      <PackPreviewModal
        pack={previewPack}
        open={previewPack !== null}
        onOpenChange={(open) => !open && setPreviewPack(null)}
      />
    </Card>
  );
}
