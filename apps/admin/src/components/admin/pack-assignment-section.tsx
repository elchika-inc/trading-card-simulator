import type { GachaPack, PackAssignment } from "@repo/types";
import { WEIGHT_PRESETS } from "@repo/types";
import { Package, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PackAssignmentSectionProps {
  assignments: PackAssignment[];
  availablePacks: GachaPack[];
  onChange: (assignments: PackAssignment[]) => void;
}

/**
 * カードのパック割当セクション
 * カード作成・編集モーダルで使用
 */
export function PackAssignmentSection({
  assignments,
  availablePacks,
  onChange,
}: PackAssignmentSectionProps) {
  // 未割当のパック一覧
  const unassignedPacks = availablePacks.filter(
    (pack) => !assignments.some((a) => a.packId === pack.id),
  );

  // パックを追加
  const handleAddPack = (packId: string) => {
    const pack = availablePacks.find((p) => p.id === packId);
    if (!pack) return;

    const newAssignment: PackAssignment = {
      packId: pack.id,
      packName: pack.name,
      packIcon: pack.icon,
      weight: 100, // デフォルトは通常（100）
      isPickup: false,
    };
    onChange([...assignments, newAssignment]);
  };

  // パックを削除
  const handleRemovePack = (packId: string) => {
    onChange(assignments.filter((a) => a.packId !== packId));
  };

  // Weight を更新
  const handleWeightChange = (packId: string, weight: number) => {
    onChange(assignments.map((a) => (a.packId === packId ? { ...a, weight } : a)));
  };

  // Pickup を更新
  const handlePickupChange = (packId: string, isPickup: boolean) => {
    onChange(assignments.map((a) => (a.packId === packId ? { ...a, isPickup } : a)));
  };

  // Weight からプリセットラベルを取得
  const getPresetLabel = (weight: number): string => {
    const preset = WEIGHT_PRESETS.find((p) => p.weight === weight);
    return preset ? preset.label : `カスタム (${weight})`;
  };

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2">
        <Package className="w-4 h-4" />
        パック割当
      </Label>

      {/* 割当済みパック一覧 */}
      {assignments.length > 0 && (
        <div className="space-y-2">
          {assignments.map((assignment) => (
            <div
              key={assignment.packId}
              className="flex items-center gap-2 p-2 border rounded-md bg-muted/30"
            >
              {/* パック情報 */}
              <span className="text-lg">{assignment.packIcon}</span>
              <span className="flex-1 font-medium text-sm truncate">
                {assignment.packName || assignment.packId}
              </span>

              {/* Weight 選択 */}
              <Select
                value={String(assignment.weight)}
                onValueChange={(v) => handleWeightChange(assignment.packId, Number(v))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue>{getPresetLabel(assignment.weight)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {WEIGHT_PRESETS.map((preset) => (
                    <SelectItem key={preset.weight} value={String(preset.weight)}>
                      {preset.label} ({preset.weight})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Pickup チェックボックス */}
              <div className="flex items-center gap-1.5">
                <Checkbox
                  id={`pickup-${assignment.packId}`}
                  checked={assignment.isPickup}
                  onCheckedChange={(checked) =>
                    handlePickupChange(assignment.packId, checked === true)
                  }
                />
                <Label htmlFor={`pickup-${assignment.packId}`} className="text-xs cursor-pointer">
                  Pickup
                </Label>
              </div>

              {/* 削除ボタン */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => handleRemovePack(assignment.packId)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* パック追加ドロップダウン */}
      {unassignedPacks.length > 0 ? (
        <Select onValueChange={handleAddPack} value="">
          <SelectTrigger className="w-full">
            <SelectValue placeholder="パックを追加..." />
          </SelectTrigger>
          <SelectContent>
            {unassignedPacks.map((pack) => (
              <SelectItem key={pack.id} value={pack.id}>
                <span className="flex items-center gap-2">
                  <span>{pack.icon}</span>
                  <span>{pack.name}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <p className="text-sm text-muted-foreground">
          {assignments.length > 0 ? "すべてのパックに割当済みです" : "利用可能なパックがありません"}
        </p>
      )}
    </div>
  );
}
