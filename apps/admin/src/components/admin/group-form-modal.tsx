import type { PackGroup } from "@repo/types";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8787";

// よく使うグラデーションカラーのプリセット
const COLOR_PRESETS = [
  { from: "from-purple-500", to: "to-purple-700", label: "パープル" },
  { from: "from-blue-500", to: "to-blue-700", label: "ブルー" },
  { from: "from-green-500", to: "to-green-700", label: "グリーン" },
  { from: "from-red-500", to: "to-red-700", label: "レッド" },
  { from: "from-orange-500", to: "to-orange-700", label: "オレンジ" },
  { from: "from-pink-500", to: "to-pink-700", label: "ピンク" },
  { from: "from-cyan-500", to: "to-cyan-700", label: "シアン" },
  { from: "from-yellow-500", to: "to-amber-700", label: "ゴールド" },
  { from: "from-gray-500", to: "to-gray-700", label: "グレー" },
  { from: "from-indigo-500", to: "to-violet-700", label: "インディゴ" },
];

// よく使うアイコン絵文字
const ICON_PRESETS = ["📦", "🎴", "🎮", "🎲", "🌟", "💎", "🔥", "❄️", "🌈", "🎁", "🃏", "👑"];

interface GroupFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingGroup?: PackGroup | null;
  onSuccess?: () => void;
}

/**
 * グループ作成/編集モーダル
 */
export function GroupFormModal({
  open,
  onOpenChange,
  editingGroup,
  onSuccess,
}: GroupFormModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("📦");
  const [colorFrom, setColorFrom] = useState("from-purple-500");
  const [colorTo, setColorTo] = useState("to-purple-700");
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 編集時にフォームに値をセット
  useEffect(() => {
    if (editingGroup) {
      setName(editingGroup.name);
      setDescription(editingGroup.description || "");
      setIcon(editingGroup.icon);
      setColorFrom(editingGroup.colorFrom);
      setColorTo(editingGroup.colorTo);
      setIsActive(editingGroup.isActive);
      setSortOrder(editingGroup.sortOrder);
    } else {
      // 新規作成時はリセット
      setName("");
      setDescription("");
      setIcon("📦");
      setColorFrom("from-purple-500");
      setColorTo("to-purple-700");
      setIsActive(true);
      setSortOrder(0);
    }
    setError(null);
  }, [editingGroup]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("名前を入力してください");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const body = {
        name: name.trim(),
        description: description.trim() || null,
        icon,
        colorFrom,
        colorTo,
        isActive,
        sortOrder,
      };

      const url = editingGroup
        ? `${API_URL}/api/gacha/groups/${editingGroup.id}`
        : `${API_URL}/api/gacha/groups`;

      const response = await fetch(url, {
        method: editingGroup ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save group");
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleColorPreset = (preset: (typeof COLOR_PRESETS)[0]) => {
    setColorFrom(preset.from);
    setColorTo(preset.to);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-white/20">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingGroup ? "グループを編集" : "新規グループ作成"}
            </DialogTitle>
            <DialogDescription className="text-white/60">
              パックをまとめるグループを{editingGroup ? "編集" : "作成"}します
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* 名前 */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">
                名前 *
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: Expansion Vol.1"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            {/* 説明 */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">
                説明
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="例: 第1弾パック"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            {/* アイコン */}
            <div className="space-y-2">
              <Label className="text-white">アイコン</Label>
              <div className="flex flex-wrap gap-2">
                {ICON_PRESETS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setIcon(emoji)}
                    className={`w-10 h-10 text-xl rounded-lg border transition-all ${
                      icon === emoji
                        ? "border-blue-500 bg-blue-500/20"
                        : "border-white/20 bg-white/10 hover:bg-white/20"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* カラー */}
            <div className="space-y-2">
              <Label className="text-white">グラデーションカラー</Label>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={`${preset.from}-${preset.to}`}
                    type="button"
                    onClick={() => handleColorPreset(preset)}
                    className={`h-8 px-3 rounded-lg bg-gradient-to-r ${preset.from} ${preset.to} border-2 transition-all ${
                      colorFrom === preset.from && colorTo === preset.to
                        ? "border-white scale-110"
                        : "border-transparent hover:scale-105"
                    }`}
                    title={preset.label}
                  />
                ))}
              </div>
              <div className={`h-8 w-full rounded-lg bg-gradient-to-r ${colorFrom} ${colorTo}`} />
            </div>

            {/* 表示順 */}
            <div className="space-y-2">
              <Label htmlFor="sortOrder" className="text-white">
                表示順
              </Label>
              <Input
                id="sortOrder"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number.parseInt(e.target.value, 10) || 0)}
                className="bg-white/10 border-white/20 text-white w-24"
              />
              <p className="text-xs text-white/40">小さい値が先に表示されます</p>
            </div>

            {/* 公開状態 */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="isActive" className="text-white">
                公開する
              </Label>
            </div>

            {error && <div className="text-sm text-red-400">{error}</div>}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "保存中..." : editingGroup ? "更新" : "作成"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
