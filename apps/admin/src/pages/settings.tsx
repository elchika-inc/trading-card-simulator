import type { BackgroundPresetId } from "@repo/types";
import { BACKGROUND_PRESET_IDS, BACKGROUND_PRESETS } from "@repo/ui/background-presets";
import { Check, Save } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { AssetList } from "@/components/admin/asset-list";
import { AssetUpload } from "@/components/admin/asset-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function SettingsPage() {
  const [currentPreset, setCurrentPreset] = useState<BackgroundPresetId>("purple-cosmos");
  const [selectedPreset, setSelectedPreset] = useState<BackgroundPresetId>("purple-cosmos");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [cardBackRefreshTrigger, setCardBackRefreshTrigger] = useState(0);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8787";

  const handleCardBackUploadSuccess = () => {
    setCardBackRefreshTrigger((prev) => prev + 1);
  };

  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/api/settings`);
      if (response.ok) {
        const data = await response.json();
        setCurrentPreset(data.settings.backgroundPresetId);
        setSelectedPreset(data.settings.backgroundPresetId);
      }
    } catch (_err) {
      setError("設定の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8787";
      const response = await fetch(`${apiUrl}/api/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          backgroundPresetId: selectedPreset,
        }),
      });

      if (!response.ok) {
        throw new Error("設定の保存に失敗しました");
      }

      const data = await response.json();
      setCurrentPreset(data.settings.backgroundPresetId);
      setSuccessMessage("設定を保存しました");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = currentPreset !== selectedPreset;

  if (loading) {
    return (
      <AdminLayout title="設定" description="サイト全体の設定を管理">
        <div className="text-center py-8 text-white/60">読み込み中...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="設定"
      description="サイト全体の設定を管理"
      headerActions={
        <Button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? "保存中..." : "保存"}
        </Button>
      }
    >
      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 flex items-center gap-2">
          <Check className="w-4 h-4" />
          {successMessage}
        </div>
      )}

      <Card className="bg-white/10 border-white/20">
        <CardHeader>
          <CardTitle className="text-white">背景設定</CardTitle>
          <CardDescription className="text-white/60">
            サイト全体の背景を選択してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BACKGROUND_PRESET_IDS.map((presetId) => {
              const preset = BACKGROUND_PRESETS[presetId];
              const isSelected = selectedPreset === presetId;
              const isCurrent = currentPreset === presetId;

              return (
                <button
                  key={presetId}
                  type="button"
                  onClick={() => setSelectedPreset(presetId)}
                  className={`relative rounded-lg overflow-hidden transition-all ${
                    isSelected
                      ? "ring-2 ring-purple-500 ring-offset-2 ring-offset-transparent"
                      : "hover:ring-2 hover:ring-white/30"
                  }`}
                >
                  {/* プレビュー背景 */}
                  <div
                    className="h-32 flex items-center justify-center"
                    style={{
                      background: `linear-gradient(to bottom right, ${preset.colors.from}, ${preset.colors.via}, ${preset.colors.to})`,
                    }}
                  >
                    <span className="text-white font-bold text-lg drop-shadow-lg">
                      {preset.name}
                    </span>
                  </div>

                  {/* ラベル */}
                  <div className="p-3 bg-black/40 flex items-center justify-between">
                    <span className="text-sm text-white/80">{preset.name}</span>
                    <div className="flex items-center gap-2">
                      {isCurrent && (
                        <span className="text-xs bg-green-500/30 text-green-300 px-2 py-0.5 rounded">
                          現在
                        </span>
                      )}
                      {isSelected && !isCurrent && (
                        <span className="text-xs bg-purple-500/30 text-purple-300 px-2 py-0.5 rounded">
                          選択中
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {hasChanges && (
            <div className="mt-6 p-4 bg-purple-500/20 border border-purple-500/50 rounded-lg text-purple-200">
              変更があります。保存ボタンをクリックして変更を適用してください。
            </div>
          )}
        </CardContent>
      </Card>

      <Separator className="my-8 bg-white/20" />

      {/* カード背面設定 */}
      <Card className="bg-white/10 border-white/20">
        <CardHeader>
          <CardTitle className="text-white">カード背面設定</CardTitle>
          <CardDescription className="text-white/60">
            カードの裏面に表示される画像を設定します
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <AssetUpload assetType="card-back" onUploadSuccess={handleCardBackUploadSuccess} />
          <Separator className="bg-white/20" />
          <AssetList assetType="card-back" refreshTrigger={cardBackRefreshTrigger} />
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
