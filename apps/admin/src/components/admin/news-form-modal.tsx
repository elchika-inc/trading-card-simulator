import type { Card, GachaPack, News } from "@repo/types";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// バッジテキストのプリセット
const BADGE_PRESETS = ["NEW", "NEW ARRIVAL", "PICK UP", "HOT", "LIMITED", "EVENT"];

export interface NewsFormData {
  title: string;
  subtitle: string | null;
  badgeText: string;
  packIds: string[];
  bannerAssetId: string | null;
  isActive: boolean;
  sortOrder: number;
  cardIds: number[];
}

interface NewsFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initialData?: News;
  onSubmit: (data: NewsFormData) => Promise<void>;
}

/**
 * News作成・編集モーダル
 */
export function NewsFormModal({
  open,
  onOpenChange,
  mode,
  initialData,
  onSubmit,
}: NewsFormModalProps) {
  const [formData, setFormData] = useState<NewsFormData>({
    title: "",
    subtitle: null,
    badgeText: "NEW",
    packIds: [],
    bannerAssetId: null,
    isActive: true,
    sortOrder: 0,
    cardIds: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [packs, setPacks] = useState<GachaPack[]>([]);
  const [_dataLoaded, setDataLoaded] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8787";

  // カードとパックのデータを取得
  const fetchData = useCallback(async () => {
    try {
      const [cardsRes, packsRes] = await Promise.all([
        fetch(`${apiUrl}/api/cards`),
        fetch(`${apiUrl}/api/gacha/packs`),
      ]);

      if (cardsRes.ok) {
        const cardsData = await cardsRes.json();
        setCards(cardsData.cards || []);
      }
      if (packsRes.ok) {
        const packsData = await packsRes.json();
        setPacks(packsData.packs || []);
      }
      setDataLoaded(true);
    } catch (err) {
      console.error("データ取得エラー:", err);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, fetchData]);

  // 初期データの設定
  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initialData) {
      setFormData({
        title: initialData.title,
        subtitle: initialData.subtitle,
        badgeText: initialData.badgeText,
        packIds: [...initialData.packIds],
        bannerAssetId: initialData.bannerAssetId,
        isActive: initialData.isActive,
        sortOrder: initialData.sortOrder,
        cardIds: [...initialData.cardIds],
      });
    } else {
      setFormData({
        title: "",
        subtitle: null,
        badgeText: "NEW",
        packIds: [],
        bannerAssetId: null,
        isActive: true,
        sortOrder: 0,
        cardIds: [],
      });
    }
  }, [open, mode, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("タイトルを入力してください");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  };

  // カード選択のトグル
  const toggleCard = (cardId: number) => {
    setFormData((prev) => {
      const exists = prev.cardIds.includes(cardId);
      if (exists) {
        return { ...prev, cardIds: prev.cardIds.filter((id) => id !== cardId) };
      }
      return { ...prev, cardIds: [...prev.cardIds, cardId] };
    });
  };

  // カードの順序変更
  const moveCard = (index: number, direction: "up" | "down") => {
    setFormData((prev) => {
      const newIds = [...prev.cardIds];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newIds.length) return prev;
      [newIds[index], newIds[targetIndex]] = [newIds[targetIndex], newIds[index]];
      return { ...prev, cardIds: newIds };
    });
  };

  // カードを削除
  const removeCard = (cardId: number) => {
    setFormData((prev) => ({
      ...prev,
      cardIds: prev.cardIds.filter((id) => id !== cardId),
    }));
  };

  // パック選択のトグル
  const togglePack = (packId: string) => {
    setFormData((prev) => {
      const exists = prev.packIds.includes(packId);
      if (exists) {
        return { ...prev, packIds: prev.packIds.filter((id) => id !== packId) };
      }
      return { ...prev, packIds: [...prev.packIds, packId] };
    });
  };

  // パックの順序変更
  const movePack = (index: number, direction: "up" | "down") => {
    setFormData((prev) => {
      const newIds = [...prev.packIds];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newIds.length) return prev;
      [newIds[index], newIds[targetIndex]] = [newIds[targetIndex], newIds[index]];
      return { ...prev, packIds: newIds };
    });
  };

  // パックを削除
  const removePack = (packId: string) => {
    setFormData((prev) => ({
      ...prev,
      packIds: prev.packIds.filter((id) => id !== packId),
    }));
  };

  const selectedCards = formData.cardIds
    .map((id) => cards.find((c) => c.id === id))
    .filter(Boolean) as Card[];
  const selectedPacks = formData.packIds
    .map((id) => packs.find((p) => p.id === id))
    .filter(Boolean) as GachaPack[];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 border-white/20 text-white">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "News作成" : "News編集"}</DialogTitle>
          <DialogDescription className="text-white/60">
            ランディングページのカルーセルに表示されるNewsを{mode === "create" ? "作成" : "編集"}
            します
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* タイトル */}
          <div className="space-y-2">
            <Label htmlFor="title">タイトル *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="例: 新パック「虚空の覇者」登場"
              className="bg-white/10 border-white/20"
            />
          </div>

          {/* サブタイトル */}
          <div className="space-y-2">
            <Label htmlFor="subtitle">サブタイトル</Label>
            <Input
              id="subtitle"
              value={formData.subtitle || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, subtitle: e.target.value || null }))
              }
              placeholder="例: 強力なカードを手に入れよう！"
              className="bg-white/10 border-white/20"
            />
          </div>

          {/* バッジテキスト */}
          <div className="space-y-2">
            <Label htmlFor="badgeText">バッジテキスト</Label>
            <Select
              value={formData.badgeText}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, badgeText: value }))}
            >
              <SelectTrigger className="bg-white/10 border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-white/20">
                {BADGE_PRESETS.map((preset) => (
                  <SelectItem key={preset} value={preset} className="text-white">
                    {preset}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* パック選択（複数） */}
          <div className="space-y-4">
            <Label>表示パック（複数選択・並び替え可能）</Label>

            {/* 選択済みパック */}
            {selectedPacks.length > 0 && (
              <div className="space-y-2 bg-white/5 p-3 rounded-lg">
                <p className="text-sm text-white/60">選択済み（{selectedPacks.length}個）</p>
                {selectedPacks.map((pack, index) => (
                  <div
                    key={pack.id}
                    className="flex items-center justify-between bg-white/10 p-2 rounded"
                  >
                    <span className="text-sm">
                      {index + 1}. {pack.name}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => movePack(index, "up")}
                        disabled={index === 0}
                        className="p-1 h-auto"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => movePack(index, "down")}
                        disabled={index === selectedPacks.length - 1}
                        className="p-1 h-auto"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removePack(pack.id)}
                        className="p-1 h-auto text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* パック一覧 */}
            <div className="max-h-32 overflow-y-auto bg-white/5 p-3 rounded-lg space-y-1">
              <p className="text-sm text-white/60 mb-2">パックを選択（クリックで追加）</p>
              {packs
                .filter((p) => !formData.packIds.includes(p.id))
                .map((pack) => (
                  <Button
                    key={pack.id}
                    type="button"
                    variant="ghost"
                    className="w-full justify-start text-sm h-auto py-1"
                    onClick={() => togglePack(pack.id)}
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    {pack.name}
                    <span className="ml-auto text-white/40">{pack.icon}</span>
                  </Button>
                ))}
            </div>
          </div>

          {/* 表示順序 */}
          <div className="space-y-2">
            <Label htmlFor="sortOrder">表示順序</Label>
            <Input
              id="sortOrder"
              type="number"
              value={formData.sortOrder}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  sortOrder: Number.parseInt(e.target.value, 10) || 0,
                }))
              }
              className="bg-white/10 border-white/20 w-24"
            />
          </div>

          {/* アクティブ状態 */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isActive: checked === true }))
              }
            />
            <Label htmlFor="isActive">公開する</Label>
          </div>

          {/* カード選択 */}
          <div className="space-y-4">
            <Label>表示カード（複数選択・並び替え可能）</Label>

            {/* 選択済みカード */}
            {selectedCards.length > 0 && (
              <div className="space-y-2 bg-white/5 p-3 rounded-lg">
                <p className="text-sm text-white/60">選択済み（{selectedCards.length}枚）</p>
                {selectedCards.map((card, index) => (
                  <div
                    key={card.id}
                    className="flex items-center justify-between bg-white/10 p-2 rounded"
                  >
                    <span className="text-sm">
                      {index + 1}. {card.name}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => moveCard(index, "up")}
                        disabled={index === 0}
                        className="p-1 h-auto"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => moveCard(index, "down")}
                        disabled={index === selectedCards.length - 1}
                        className="p-1 h-auto"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeCard(card.id)}
                        className="p-1 h-auto text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* カード一覧 */}
            <div className="max-h-48 overflow-y-auto bg-white/5 p-3 rounded-lg space-y-1">
              <p className="text-sm text-white/60 mb-2">カードを選択（クリックで追加）</p>
              {cards
                .filter((c) => !formData.cardIds.includes(c.id))
                .map((card) => (
                  <Button
                    key={card.id}
                    type="button"
                    variant="ghost"
                    className="w-full justify-start text-sm h-auto py-1"
                    onClick={() => toggleCard(card.id)}
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    {card.name}
                    <span className="ml-auto text-white/40">{card.rarity}</span>
                  </Button>
                ))}
            </div>
          </div>

          {/* 送信ボタン */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {submitting ? "処理中..." : mode === "create" ? "作成" : "更新"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
