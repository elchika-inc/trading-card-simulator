import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PackUploadProps {
  onUploadSuccess?: () => void;
}

/**
 * パック画像アップロードコンポーネント
 * 表面・裏面を同時にアップロードする（同じセットIDで紐付け）
 */
export function PackUpload({ onUploadSuccess }: PackUploadProps) {
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFrontFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      setFrontFile(file);
      setError(null);
      setUploadSuccess(false);
    }
  };

  const handleBackFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      setBackFile(file);
      setError(null);
      setUploadSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!frontFile || !backFile) return;

    setUploading(true);
    setError(null);

    try {
      const imageApiUrl = import.meta.env.VITE_IMAGE_API_URL || "http://localhost:8788";

      // 同じセットIDを生成（表面と裏面を紐付ける）
      const packSetId = crypto.randomUUID();

      // 表面をアップロード
      const frontFormData = new FormData();
      frontFormData.append("file", frontFile);
      frontFormData.append("type", "pack-front");
      frontFormData.append("packSetId", packSetId);

      const frontResponse = await fetch(`${imageApiUrl}/api/assets`, {
        method: "POST",
        body: frontFormData,
      });

      if (!frontResponse.ok) {
        const errorText = await frontResponse.text();
        throw new Error(`表面のアップロードに失敗: ${errorText}`);
      }

      // 裏面をアップロード
      const backFormData = new FormData();
      backFormData.append("file", backFile);
      backFormData.append("type", "pack-back");
      backFormData.append("packSetId", packSetId);

      const backResponse = await fetch(`${imageApiUrl}/api/assets`, {
        method: "POST",
        body: backFormData,
      });

      if (!backResponse.ok) {
        const errorText = await backResponse.text();
        throw new Error(`裏面のアップロードに失敗: ${errorText}`);
      }

      setUploadSuccess(true);
      setFrontFile(null);
      setBackFile(null);

      // ファイル入力をリセット
      const frontInput = document.getElementById("pack-front-file") as HTMLInputElement;
      const backInput = document.getElementById("pack-back-file") as HTMLInputElement;
      if (frontInput) frontInput.value = "";
      if (backInput) backInput.value = "";

      onUploadSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const canUpload = frontFile && backFile && !uploading;

  return (
    <Card className="bg-transparent border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-white">パック画像アップロード</CardTitle>
        <CardDescription className="text-white/60">
          パックの表面・裏面画像をセットでアップロードします（PNG, JPEG, WebP対応、最大10MB）
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 表面 */}
          <div className="space-y-2">
            <Label htmlFor="pack-front-file" className="text-white">
              表面画像
            </Label>
            <Input
              id="pack-front-file"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFrontFileChange}
              disabled={uploading}
            />
            {frontFile && (
              <div className="text-xs text-white/60">
                {frontFile.name} ({(frontFile.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </div>

          {/* 裏面 */}
          <div className="space-y-2">
            <Label htmlFor="pack-back-file" className="text-white">
              裏面画像
            </Label>
            <Input
              id="pack-back-file"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleBackFileChange}
              disabled={uploading}
            />
            {backFile && (
              <div className="text-xs text-white/60">
                {backFile.name} ({(backFile.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </div>
        </div>

        <Button onClick={handleUpload} disabled={!canUpload} className="w-full">
          {uploading ? "アップロード中..." : "両面をアップロード"}
        </Button>

        {!frontFile && !backFile && (
          <div className="text-sm text-white/60 text-center">
            表面・裏面の両方を選択してください
          </div>
        )}

        {error && <div className="text-sm text-red-400">エラー: {error}</div>}

        {uploadSuccess && (
          <div className="rounded bg-green-500/20 border border-green-500/50 p-4">
            <div className="text-sm font-semibold text-green-200">アップロード完了</div>
            <div className="mt-2 text-xs text-green-300">
              パック画像（表面・裏面）がアップロードされました
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
