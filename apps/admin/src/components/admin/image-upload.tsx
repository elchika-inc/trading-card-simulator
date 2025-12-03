import type { ImageBulkUploadResponse } from "@repo/types";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ImageUploadProps {
  onUploadSuccess?: () => void;
}

/**
 * 画像アップロードコンポーネント（一括アップロード対応）
 */
export function ImageUpload({ onUploadSuccess }: ImageUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<ImageBulkUploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(files);
      setError(null);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      for (const file of selectedFiles) {
        formData.append("files", file);
      }

      const imageApiUrl = import.meta.env.VITE_IMAGE_API_URL || "http://localhost:8788";
      const response = await fetch(`${imageApiUrl}/api/images/bulk`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

      const result: ImageBulkUploadResponse = await response.json();
      setUploadResult(result);

      setSelectedFiles([]);

      onUploadSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>画像一括アップロード</CardTitle>
        <CardDescription>
          複数のカード画像をR2に一括アップロードします（PNG, JPEG, WebP対応、最大10MB/ファイル）
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="images">画像ファイル（複数選択可）</Label>
          <Input
            id="images"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            disabled={uploading}
            multiple
          />
        </div>

        {selectedFiles.length > 0 && (
          <div>
            <Label>選択中のファイル（{selectedFiles.length}個）</Label>
            <div className="mt-2 space-y-1">
              {selectedFiles.map((file, index) => (
                <div
                  key={`${file.name}-${file.size}-${file.lastModified}`}
                  className="flex items-center gap-2 text-sm"
                >
                  <Badge variant="secondary">{index + 1}</Badge>
                  <span className="truncate">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button onClick={handleUpload} disabled={selectedFiles.length === 0 || uploading}>
          {uploading ? "アップロード中..." : `${selectedFiles.length}個の画像をアップロード`}
        </Button>

        {error && <div className="text-sm text-red-600">エラー: {error}</div>}

        {uploadResult?.success && uploadResult.data && (
          <div className="space-y-2 rounded bg-green-50 p-4">
            <div className="text-sm font-semibold text-green-800">一括アップロード完了</div>
            <div className="text-xs space-y-1">
              <div>成功: {uploadResult.data.successCount}個</div>
              <div>失敗: {uploadResult.data.failedCount}個</div>
              <div>合計: {uploadResult.data.total}個</div>
            </div>
            {uploadResult.data.failed.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="text-xs font-semibold text-red-600">失敗したファイル:</div>
                {uploadResult.data.failed.map((failed) => (
                  <div key={failed.filename} className="text-xs text-red-600">
                    - {failed.filename}: {failed.error}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
