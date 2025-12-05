import { ASSET_TYPE_LABELS, type AssetType, type AssetUploadResponse } from "@repo/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AssetUploadProps {
  assetType: AssetType;
  onUploadSuccess?: () => void;
  /** 複数ファイルアップロードを許可するか */
  multiple?: boolean;
}

interface UploadProgress {
  total: number;
  completed: number;
  failed: number;
}

/**
 * アセットアップロードコンポーネント
 */
export function AssetUpload({ assetType, onUploadSuccess, multiple = false }: AssetUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<AssetUploadResponse | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const label = ASSET_TYPE_LABELS[assetType];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFiles(Array.from(files));
      setError(null);
      setUploadResult(null);
      setUploadProgress(null);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setError(null);
    setUploadResult(null);

    const imageApiUrl = import.meta.env.VITE_IMAGE_API_URL || "http://localhost:8788";

    if (multiple && selectedFiles.length > 1) {
      // 複数ファイルアップロード
      const progress: UploadProgress = { total: selectedFiles.length, completed: 0, failed: 0 };
      setUploadProgress(progress);

      for (const file of selectedFiles) {
        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("type", assetType);

          const response = await fetch(`${imageApiUrl}/api/assets`, {
            method: "POST",
            body: formData,
          });

          if (response.ok) {
            progress.completed++;
          } else {
            progress.failed++;
          }
        } catch {
          progress.failed++;
        }
        setUploadProgress({ ...progress });
      }

      setSelectedFiles([]);
      const fileInput = document.getElementById(`asset-file-${assetType}`) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      onUploadSuccess?.();
    } else {
      // 単一ファイルアップロード
      const file = selectedFiles[0];
      if (!file) return;

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", assetType);

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
        setSelectedFiles([]);

        const fileInput = document.getElementById(`asset-file-${assetType}`) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        onUploadSuccess?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      }
    }

    setUploading(false);
  };

  return (
    <Card className="bg-transparent border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-white">{label}アップロード</CardTitle>
        <CardDescription className="text-white/60">
          {label}をR2にアップロードします（PNG, JPEG, WebP対応、最大10MB）
          {multiple && "。複数ファイルを選択できます。"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor={`asset-file-${assetType}`} className="text-white">
            画像ファイル
          </Label>
          <Input
            id={`asset-file-${assetType}`}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            disabled={uploading}
            multiple={multiple}
          />
        </div>

        {selectedFiles.length > 0 && selectedFiles[0] && (
          <div className="text-sm text-white/60">
            {selectedFiles.length === 1 ? (
              <>
                選択中: {selectedFiles[0].name} ({(selectedFiles[0].size / 1024 / 1024).toFixed(2)}{" "}
                MB)
              </>
            ) : (
              <>選択中: {selectedFiles.length}ファイル</>
            )}
          </div>
        )}

        <Button onClick={handleUpload} disabled={selectedFiles.length === 0 || uploading}>
          {uploading ? "アップロード中..." : "アップロード"}
        </Button>

        {error && <div className="text-sm text-red-400">エラー: {error}</div>}

        {uploadProgress && (
          <div className="rounded bg-blue-500/20 border border-blue-500/50 p-4">
            <div className="text-sm font-semibold text-blue-200">
              アップロード進捗: {uploadProgress.completed + uploadProgress.failed} /{" "}
              {uploadProgress.total}
            </div>
            <div className="mt-2 text-xs text-blue-300">
              成功: {uploadProgress.completed} / 失敗: {uploadProgress.failed}
            </div>
            {uploadProgress.completed + uploadProgress.failed === uploadProgress.total && (
              <div className="mt-2 text-xs text-green-300">完了しました</div>
            )}
          </div>
        )}

        {uploadResult?.success && uploadResult.data && (
          <div className="rounded bg-green-500/20 border border-green-500/50 p-4">
            <div className="text-sm font-semibold text-green-200">アップロード完了</div>
            <div className="mt-2 text-xs text-green-300">
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
