import { ASSET_TYPE_LABELS, type AssetType, type AssetUploadResponse } from "@repo/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AssetUploadProps {
  assetType: AssetType;
  onUploadSuccess?: () => void;
}

/**
 * アセットアップロードコンポーネント
 */
export function AssetUpload({ assetType, onUploadSuccess }: AssetUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<AssetUploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const label = ASSET_TYPE_LABELS[assetType];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      setSelectedFile(file);
      setError(null);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("type", assetType);

      const imageApiUrl = import.meta.env.VITE_IMAGE_API_URL || "http://localhost:8788";
      const response = await fetch(`${imageApiUrl}/api/assets`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

      const result: AssetUploadResponse = await response.json();
      setUploadResult(result);
      setSelectedFile(null);

      // ファイル入力をリセット
      const fileInput = document.getElementById(`asset-file-${assetType}`) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }

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
        <CardTitle>{label}画像アップロード</CardTitle>
        <CardDescription>
          {label}画像をR2にアップロードします（PNG, JPEG, WebP対応、最大10MB）
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor={`asset-file-${assetType}`}>画像ファイル</Label>
          <Input
            id={`asset-file-${assetType}`}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>

        {selectedFile && (
          <div className="text-sm text-gray-600">
            選択中: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
          </div>
        )}

        <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
          {uploading ? "アップロード中..." : "アップロード"}
        </Button>

        {error && <div className="text-sm text-red-600">エラー: {error}</div>}

        {uploadResult?.success && uploadResult.data && (
          <div className="rounded bg-green-50 p-4">
            <div className="text-sm font-semibold text-green-800">アップロード完了</div>
            <div className="mt-2 text-xs text-green-700">
              {uploadResult.data.isActive
                ? "この画像がアクティブに設定されました"
                : "アップロードされました（別の画像がアクティブです）"}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
