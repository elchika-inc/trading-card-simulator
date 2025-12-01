import type { ImageUploadResponse } from "@repo/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ImageUploadProps {
  onUploadSuccess?: () => void;
}

/**
 * 画像アップロードコンポーネント
 */
export function ImageUpload({ onUploadSuccess }: ImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<ImageUploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
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
      formData.append("metadata", JSON.stringify({ originalName: selectedFile.name }));

      const imageApiUrl = import.meta.env.VITE_IMAGE_API_URL || "http://localhost:8788";
      const response = await fetch(`${imageApiUrl}/api/images`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

      const result: ImageUploadResponse = await response.json();
      setUploadResult(result);

      // 成功後、選択をクリア
      setSelectedFile(null);
      setPreview(null);

      // 親コンポーネントに通知
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
        <CardTitle>画像アップロード</CardTitle>
        <CardDescription>
          カード画像をR2にアップロードします（PNG, JPEG, WebP対応、最大10MB）
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="image">画像ファイル</Label>
          <Input
            id="image"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>

        {preview && (
          <div>
            <Label>プレビュー</Label>
            <img src={preview} alt="Preview" className="mt-2 max-w-md rounded border" />
          </div>
        )}

        <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
          {uploading ? "アップロード中..." : "アップロード"}
        </Button>

        {error && <div className="text-sm text-red-600">エラー: {error}</div>}

        {uploadResult?.success && uploadResult.data && (
          <div className="space-y-2 rounded bg-green-50 p-4">
            <div className="text-sm font-semibold text-green-800">アップロード成功</div>
            <div className="text-xs space-y-1">
              <div>
                ID: <code className="bg-white px-1 py-0.5 rounded">{uploadResult.data.id}</code>
              </div>
              <div className="break-all">
                URL:{" "}
                <code className="bg-white px-1 py-0.5 rounded text-[10px]">
                  {uploadResult.data.url}
                </code>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
