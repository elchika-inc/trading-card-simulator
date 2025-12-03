import type { ImageListResponse } from "@repo/types";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ImageListProps {
  refreshTrigger?: number;
}

/**
 * アップロード済み画像一覧コンポーネント
 */
export function ImageList({ refreshTrigger }: ImageListProps) {
  const [images, setImages] = useState<ImageListResponse["data"]["images"]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const imageApiUrl = import.meta.env.VITE_IMAGE_API_URL || "http://localhost:8788";
      const response = await fetch(`${imageApiUrl}/api/images`);

      if (!response.ok) {
        throw new Error("Failed to fetch images");
      }

      const data: ImageListResponse = await response.json();
      if (data.success && data.data) {
        setImages(data.data.images);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load images");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages, refreshTrigger]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>アップロード済み画像一覧</CardTitle>
            <CardDescription>R2に保存されている画像（{images.length}件）</CardDescription>
          </div>
          <Button onClick={fetchImages} variant="outline" size="sm">
            再読み込み
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && <div className="text-sm text-gray-500">読み込み中...</div>}

        {error && <div className="text-sm text-red-600">エラー: {error}</div>}

        {!loading && !error && images.length === 0 && (
          <div className="text-sm text-gray-500">画像がアップロードされていません</div>
        )}

        {!loading && !error && images.length > 0 && (
          <div className="space-y-4">
            {images.map((image) => (
              <div key={image.id} className="flex gap-4 p-4 border rounded-lg hover:bg-gray-50">
                <img
                  src={image.thumbnailUrl}
                  alt={image.originalName}
                  className="w-32 h-32 object-cover rounded"
                  loading="lazy"
                />

                <div className="flex-1 space-y-2">
                  <div className="font-medium text-sm">{image.originalName}</div>

                  <div className="text-xs text-gray-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">ID:</span>
                      <code className="bg-gray-100 px-2 py-0.5 rounded">{image.id}</code>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(image.id)}
                        className="text-blue-600 hover:underline"
                      >
                        コピー
                      </button>
                    </div>

                    <div>
                      <span className="font-semibold">サイズ:</span>{" "}
                      {(image.size / 1024 / 1024).toFixed(2)} MB
                    </div>

                    <div>
                      <span className="font-semibold">アップロード日時:</span>{" "}
                      {new Date(image.uploadedAt).toLocaleString("ja-JP")}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-semibold">URL:</span>
                      <a
                        href={image.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-[10px] truncate max-w-md"
                      >
                        {image.url}
                      </a>
                    </div>
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
