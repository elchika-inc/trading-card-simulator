import type {
  AssetListResponse,
  AssetMetadata,
  Card,
  CardAssignment,
  GachaPack,
} from "@repo/types";
import { WEIGHT_PRESETS } from "@repo/types";
import { PackVisual } from "@repo/ui/pack-visual";
import { Check, Image, Layers, Package, RefreshCw, Save, Star, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Card as CardUI,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PackWithFeatured extends GachaPack {
  featuredCards: Card[];
}

interface PackImageSet {
  packSetId: string;
  front: AssetMetadata | null;
  back: AssetMetadata | null;
}

type TabType = "pickup" | "cards" | "images";

/**
 * ガチャパック管理コンポーネント
 * パックごとに注目カードとパック画像を設定できる
 */
export function GachaPackManager() {
  const [packs, setPacks] = useState<PackWithFeatured[]>([]);
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [packImageSets, setPackImageSets] = useState<PackImageSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [expandedPack, setExpandedPack] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("pickup");
  const [selectedCardIds, setSelectedCardIds] = useState<Record<string, number[]>>({});
  const [selectedPackSetIds, setSelectedPackSetIds] = useState<Record<string, string | null>>({});
  // 封入カードの割当情報（packId -> CardAssignment[]）
  const [cardAssignments, setCardAssignments] = useState<Record<string, CardAssignment[]>>({});
  const [originalCardAssignments, setOriginalCardAssignments] = useState<
    Record<string, CardAssignment[]>
  >({});
  // 封入枚数（packId -> number）
  const [cardsPerPack, setCardsPerPack] = useState<Record<string, number>>({});
  const [originalCardsPerPack, setOriginalCardsPerPack] = useState<Record<string, number>>({});

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8787";
  const imageApiUrl = import.meta.env.VITE_IMAGE_API_URL || "http://localhost:8788";

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // パック一覧、全カード、アセットを並行して取得
      const [packsRes, cardsRes, frontRes, backRes] = await Promise.all([
        fetch(`${apiUrl}/api/gacha/packs`),
        fetch(`${apiUrl}/api/cards`),
        fetch(`${imageApiUrl}/api/assets?type=pack-front`),
        fetch(`${imageApiUrl}/api/assets?type=pack-back`),
      ]);

      if (!packsRes.ok || !cardsRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const packsData = await packsRes.json();
      const cardsData = await cardsRes.json();

      // アセットデータをpackSetIdでグループ化
      let frontAssets: AssetMetadata[] = [];
      let backAssets: AssetMetadata[] = [];

      if (frontRes.ok) {
        const frontData: AssetListResponse = await frontRes.json();
        if (frontData.success) {
          frontAssets = frontData.data.assets;
        }
      }
      if (backRes.ok) {
        const backData: AssetListResponse = await backRes.json();
        if (backData.success) {
          backAssets = backData.data.assets;
        }
      }

      // packSetIdでペアを作成
      const setMap = new Map<string, PackImageSet>();
      for (const asset of frontAssets) {
        if (asset.packSetId) {
          const existing = setMap.get(asset.packSetId);
          if (existing) {
            existing.front = asset;
          } else {
            setMap.set(asset.packSetId, { packSetId: asset.packSetId, front: asset, back: null });
          }
        }
      }
      for (const asset of backAssets) {
        if (asset.packSetId) {
          const existing = setMap.get(asset.packSetId);
          if (existing) {
            existing.back = asset;
          } else {
            setMap.set(asset.packSetId, { packSetId: asset.packSetId, front: null, back: asset });
          }
        }
      }
      setPackImageSets(Array.from(setMap.values()));

      // 各パックの詳細（注目カード含む）を取得
      const packsWithFeatured: PackWithFeatured[] = await Promise.all(
        (packsData.packs as GachaPack[]).map(async (pack) => {
          const detailRes = await fetch(`${apiUrl}/api/gacha/packs/${pack.id}`);
          if (detailRes.ok) {
            const detailData = await detailRes.json();
            return {
              ...pack,
              featuredCards: detailData.featuredCards || [],
            };
          }
          return { ...pack, featuredCards: [] };
        }),
      );

      setPacks(packsWithFeatured);
      setAllCards(cardsData.cards || []);

      // 各パックの選択状態を初期化
      const initialSelectedCards: Record<string, number[]> = {};
      const initialPackSetIds: Record<string, string | null> = {};
      const initialCardsPerPack: Record<string, number> = {};
      for (const pack of packsWithFeatured) {
        initialSelectedCards[pack.id] = pack.featuredCards.map((c) => c.id);
        initialPackSetIds[pack.id] = pack.packSetId;
        initialCardsPerPack[pack.id] = pack.cardsPerPack;
      }
      setSelectedCardIds(initialSelectedCards);
      setSelectedPackSetIds(initialPackSetIds);
      setCardsPerPack(initialCardsPerPack);
      setOriginalCardsPerPack(initialCardsPerPack);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleCardSelection = (packId: string, cardId: number) => {
    setSelectedCardIds((prev) => {
      const current = prev[packId] || [];
      if (current.includes(cardId)) {
        return { ...prev, [packId]: current.filter((id) => id !== cardId) };
      }
      return { ...prev, [packId]: [...current, cardId] };
    });
  };

  const selectPackSetId = (packId: string, packSetId: string | null) => {
    setSelectedPackSetIds((prev) => ({
      ...prev,
      [packId]: packSetId,
    }));
  };

  const handleSavePickup = async (packId: string) => {
    setSaving(`pickup-${packId}`);

    try {
      const response = await fetch(`${apiUrl}/api/gacha/packs/${packId}/pickup`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardIds: selectedCardIds[packId] || [] }),
      });

      if (!response.ok) {
        throw new Error("Failed to update pickup cards");
      }

      // 更新後にパックを再取得
      const detailRes = await fetch(`${apiUrl}/api/gacha/packs/${packId}`);
      if (detailRes.ok) {
        const detailData = await detailRes.json();
        setPacks((prev) =>
          prev.map((p) =>
            p.id === packId ? { ...p, featuredCards: detailData.featuredCards || [] } : p,
          ),
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(null);
    }
  };

  const handleSavePackSetId = async (packId: string) => {
    setSaving(`assets-${packId}`);

    try {
      const packSetId = selectedPackSetIds[packId];
      const response = await fetch(`${apiUrl}/api/gacha/packs/${packId}/pack-set`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packSetId: packSetId ?? null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update pack image set");
      }

      // パック一覧を更新
      setPacks((prev) =>
        prev.map((p) =>
          p.id === packId
            ? {
                ...p,
                packSetId: packSetId ?? null,
              }
            : p,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save pack image set");
    } finally {
      setSaving(null);
    }
  };

  const hasPickupChanges = (packId: string) => {
    const pack = packs.find((p) => p.id === packId);
    if (!pack) return false;
    const currentIds = pack.featuredCards.map((c) => c.id).sort();
    const selectedIds = (selectedCardIds[packId] || []).sort();
    return JSON.stringify(currentIds) !== JSON.stringify(selectedIds);
  };

  const hasPackSetIdChanges = (packId: string) => {
    const pack = packs.find((p) => p.id === packId);
    if (!pack) return false;
    const selectedSetId = selectedPackSetIds[packId];
    return pack.packSetId !== selectedSetId;
  };

  // 封入カード割当を取得
  const fetchCardAssignments = useCallback(async (packId: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/gacha/packs/${packId}/rates`);
      if (response.ok) {
        const data = await response.json();
        const assignments: CardAssignment[] = data.data?.cardAssignments || [];
        setCardAssignments((prev) => ({ ...prev, [packId]: assignments }));
        setOriginalCardAssignments((prev) => ({ ...prev, [packId]: assignments }));
      }
    } catch (err) {
      console.error("Failed to fetch card assignments:", err);
    }
  }, []);

  // パック展開時に封入カード情報を取得
  useEffect(() => {
    if (expandedPack && activeTab === "cards" && !cardAssignments[expandedPack]) {
      fetchCardAssignments(expandedPack);
    }
  }, [expandedPack, activeTab, cardAssignments, fetchCardAssignments]);

  // 封入カード割当を保存
  const handleSaveCardAssignments = async (packId: string) => {
    setSaving(`cards-${packId}`);

    try {
      const assignments = cardAssignments[packId] || [];
      const response = await fetch(`${apiUrl}/api/gacha/packs/${packId}/rates`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardAssignments: assignments }),
      });

      if (!response.ok) {
        throw new Error("Failed to update card assignments");
      }

      // 保存成功後、オリジナルを更新
      setOriginalCardAssignments((prev) => ({ ...prev, [packId]: assignments }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save card assignments");
    } finally {
      setSaving(null);
    }
  };

  // 封入カードのトグル
  const toggleCardAssignment = (packId: string, cardId: number) => {
    setCardAssignments((prev) => {
      const current = prev[packId] || [];
      const existingIndex = current.findIndex((a) => a.cardId === cardId);

      if (existingIndex >= 0) {
        // 既存の割当を削除
        return { ...prev, [packId]: current.filter((a) => a.cardId !== cardId) };
      }
      // 新規割当を追加（デフォルトweight: 100）
      const card = allCards.find((c) => c.id === cardId);
      return {
        ...prev,
        [packId]: [...current, { cardId, cardName: card?.name, weight: 100, isPickup: false }],
      };
    });
  };

  // 封入カードのweight更新
  const updateAssignmentWeight = (packId: string, cardId: number, weight: number) => {
    setCardAssignments((prev) => {
      const current = prev[packId] || [];
      return {
        ...prev,
        [packId]: current.map((a) => (a.cardId === cardId ? { ...a, weight } : a)),
      };
    });
  };

  // 封入カードのpickup更新
  const updateAssignmentPickup = (packId: string, cardId: number, isPickup: boolean) => {
    setCardAssignments((prev) => {
      const current = prev[packId] || [];
      return {
        ...prev,
        [packId]: current.map((a) => (a.cardId === cardId ? { ...a, isPickup } : a)),
      };
    });
  };

  // 封入カードの変更検知
  const hasCardAssignmentChanges = (packId: string) => {
    const current = cardAssignments[packId] || [];
    const original = originalCardAssignments[packId] || [];
    return JSON.stringify(current) !== JSON.stringify(original);
  };

  // 封入枚数の変更検知
  const hasCardsPerPackChanges = (packId: string) => {
    return cardsPerPack[packId] !== originalCardsPerPack[packId];
  };

  // 封入枚数の更新
  const updateCardsPerPack = (packId: string, value: number) => {
    setCardsPerPack((prev) => ({ ...prev, [packId]: value }));
  };

  // 封入枚数の保存
  const handleSaveCardsPerPack = async (packId: string) => {
    setSaving(`cardsPerPack-${packId}`);

    try {
      const value = cardsPerPack[packId];
      const response = await fetch(`${apiUrl}/api/gacha/packs/${packId}/cards-per-pack`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardsPerPack: value }),
      });

      if (!response.ok) {
        throw new Error("Failed to update cards per pack");
      }

      // 保存成功後、オリジナルを更新
      setOriginalCardsPerPack((prev) => ({ ...prev, [packId]: value }));
      // パック一覧も更新
      setPacks((prev) => prev.map((p) => (p.id === packId ? { ...p, cardsPerPack: value } : p)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save cards per pack");
    } finally {
      setSaving(null);
    }
  };

  // Weight からプリセットラベルを取得
  const getWeightLabel = (weight: number): string => {
    const preset = WEIGHT_PRESETS.find((p) => p.weight === weight);
    return preset ? preset.label : `カスタム (${weight})`;
  };

  // packSetIdから画像セットを取得
  const getPackImageSet = (packSetId: string | null): PackImageSet | null => {
    if (!packSetId) return null;
    return packImageSets.find((s) => s.packSetId === packSetId) ?? null;
  };

  // パックの現在の画像URLを取得
  const getPackFrontUrl = (pack: PackWithFeatured): string | undefined => {
    const set = getPackImageSet(pack.packSetId);
    return set?.front?.thumbnailUrl;
  };

  return (
    <CardUI className="bg-transparent border-none shadow-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Package className="w-5 h-5" />
              ガチャパック一覧
            </CardTitle>
            <CardDescription className="text-white/60">
              各パックの注目カードとパック画像を管理します
            </CardDescription>
          </div>
          <Button onClick={fetchData} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            再読み込み
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && <div className="text-sm text-white/60">読み込み中...</div>}

        {error && <div className="text-sm text-red-400">エラー: {error}</div>}

        {!loading && !error && packs.length === 0 && (
          <div className="text-sm text-white/60">パックがありません</div>
        )}

        {!loading && !error && packs.length > 0 && (
          <div className="space-y-4">
            {packs.map((pack) => (
              <div key={pack.id} className="border border-white/20 rounded-lg overflow-hidden">
                {/* パックヘッダー */}
                <button
                  type="button"
                  onClick={() => setExpandedPack(expandedPack === pack.id ? null : pack.id)}
                  className="w-full p-4 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    {getPackFrontUrl(pack) ? (
                      <div className="w-10 h-14 rounded overflow-hidden">
                        <PackVisual
                          frontImageUrl={getPackFrontUrl(pack)}
                          className="w-full h-full"
                        />
                      </div>
                    ) : (
                      <span className="text-2xl">{pack.icon}</span>
                    )}
                    <div>
                      <div className="font-medium text-white">{pack.name}</div>
                      <div className="text-sm text-white/60">{pack.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {pack.packSetId && (
                      <Badge variant="outline" className="text-blue-400 border-blue-400/50">
                        <Image className="w-3 h-3 mr-1" />
                        画像設定済
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-yellow-400 border-yellow-400/50">
                      <Star className="w-3 h-3 mr-1" />
                      {pack.featuredCards.length}枚
                    </Badge>
                    {(hasPickupChanges(pack.id) ||
                      hasPackSetIdChanges(pack.id) ||
                      hasCardAssignmentChanges(pack.id) ||
                      hasCardsPerPackChanges(pack.id)) && (
                      <Badge className="bg-orange-500">変更あり</Badge>
                    )}
                  </div>
                </button>

                {/* 展開時の設定エリア */}
                {expandedPack === pack.id && (
                  <div className="border-t border-white/10">
                    {/* タブ */}
                    <div className="flex border-b border-white/10">
                      <button
                        type="button"
                        onClick={() => setActiveTab("pickup")}
                        className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                          activeTab === "pickup"
                            ? "bg-white/10 text-white border-b-2 border-yellow-400"
                            : "text-white/60 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <Star className="w-4 h-4 inline-block mr-2" />
                        注目カード
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("cards")}
                        className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                          activeTab === "cards"
                            ? "bg-white/10 text-white border-b-2 border-green-400"
                            : "text-white/60 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <Layers className="w-4 h-4 inline-block mr-2" />
                        封入カード
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("images")}
                        className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
                          activeTab === "images"
                            ? "bg-white/10 text-white border-b-2 border-blue-400"
                            : "text-white/60 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <Image className="w-4 h-4 inline-block mr-2" />
                        パック画像
                      </button>
                    </div>

                    {/* 注目カード設定 */}
                    {activeTab === "pickup" && (
                      <div className="p-4 bg-white/5">
                        <div className="mb-4 flex items-center justify-between">
                          <div className="text-sm text-white/60">
                            注目カードとして表示するカードを選択してください
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleSavePickup(pack.id)}
                            disabled={saving === `pickup-${pack.id}` || !hasPickupChanges(pack.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {saving === `pickup-${pack.id}` ? (
                              "保存中..."
                            ) : (
                              <>
                                <Save className="w-4 h-4 mr-2" />
                                保存
                              </>
                            )}
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                          {allCards.map((card) => {
                            const isSelected = (selectedCardIds[pack.id] || []).includes(card.id);
                            return (
                              <button
                                key={card.id}
                                type="button"
                                onClick={() => toggleCardSelection(pack.id, card.id)}
                                className={`p-2 rounded-lg border transition-all text-left ${
                                  isSelected
                                    ? "border-yellow-400 bg-yellow-400/20"
                                    : "border-white/20 bg-white/5 hover:bg-white/10"
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs text-white/40">#{card.id}</div>
                                    <div className="text-sm text-white truncate">{card.name}</div>
                                    <div className="text-xs text-white/60">{card.rarity}</div>
                                  </div>
                                  {isSelected && (
                                    <Check className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 封入カード設定 */}
                    {activeTab === "cards" && (
                      <div className="p-4 bg-white/5">
                        {/* 封入枚数設定 */}
                        <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <label
                                htmlFor={`cards-per-pack-${pack.id}`}
                                className="text-sm text-white"
                              >
                                1パックあたりの封入枚数
                              </label>
                              <Input
                                id={`cards-per-pack-${pack.id}`}
                                type="number"
                                min={1}
                                max={100}
                                value={cardsPerPack[pack.id] || pack.cardsPerPack}
                                onChange={(e) =>
                                  updateCardsPerPack(
                                    pack.id,
                                    Number.parseInt(e.target.value, 10) || 1,
                                  )
                                }
                                className="w-20 bg-white/10 border-white/20"
                              />
                              <span className="text-sm text-white/60">枚</span>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleSaveCardsPerPack(pack.id)}
                              disabled={
                                saving === `cardsPerPack-${pack.id}` ||
                                !hasCardsPerPackChanges(pack.id)
                              }
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {saving === `cardsPerPack-${pack.id}` ? (
                                "保存中..."
                              ) : (
                                <>
                                  <Save className="w-4 h-4 mr-2" />
                                  保存
                                </>
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="mb-4 flex items-center justify-between">
                          <div className="text-sm text-white/60">
                            このパックに封入するカードと排出確率を設定してください
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleSaveCardAssignments(pack.id)}
                            disabled={
                              saving === `cards-${pack.id}` || !hasCardAssignmentChanges(pack.id)
                            }
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {saving === `cards-${pack.id}` ? (
                              "保存中..."
                            ) : (
                              <>
                                <Save className="w-4 h-4 mr-2" />
                                保存
                              </>
                            )}
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                          {allCards.map((card) => {
                            const assignment = (cardAssignments[pack.id] || []).find(
                              (a) => a.cardId === card.id,
                            );
                            const isAssigned = !!assignment;

                            return (
                              <div
                                key={card.id}
                                className={`p-3 rounded-lg border transition-all ${
                                  isAssigned
                                    ? "border-green-400 bg-green-400/10"
                                    : "border-white/20 bg-white/5"
                                }`}
                              >
                                {/* カード情報 */}
                                <div className="mb-2">
                                  <div className="text-xs text-white/40">#{card.id}</div>
                                  <div className="text-sm text-white truncate">{card.name}</div>
                                  <div className="text-xs text-white/60">{card.rarity}</div>
                                </div>

                                {/* 封入チェックボックス */}
                                <div className="flex items-center gap-2 mb-2">
                                  <Checkbox
                                    id={`assign-${pack.id}-${card.id}`}
                                    checked={isAssigned}
                                    onCheckedChange={() => toggleCardAssignment(pack.id, card.id)}
                                  />
                                  <label
                                    htmlFor={`assign-${pack.id}-${card.id}`}
                                    className="text-xs text-white cursor-pointer"
                                  >
                                    封入する
                                  </label>
                                </div>

                                {/* Weight選択（封入時のみ表示） */}
                                {isAssigned && (
                                  <div className="space-y-2">
                                    <Select
                                      value={String(assignment?.weight || 100)}
                                      onValueChange={(v) =>
                                        updateAssignmentWeight(pack.id, card.id, Number(v))
                                      }
                                    >
                                      <SelectTrigger className="h-8 text-xs">
                                        <SelectValue>
                                          {getWeightLabel(assignment?.weight || 100)}
                                        </SelectValue>
                                      </SelectTrigger>
                                      <SelectContent>
                                        {WEIGHT_PRESETS.map((preset) => (
                                          <SelectItem
                                            key={preset.weight}
                                            value={String(preset.weight)}
                                          >
                                            {preset.label} ({preset.weight})
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>

                                    {/* Pickupチェックボックス */}
                                    <div className="flex items-center gap-1.5">
                                      <Checkbox
                                        id={`pickup-assign-${pack.id}-${card.id}`}
                                        checked={assignment?.isPickup || false}
                                        onCheckedChange={(checked) =>
                                          updateAssignmentPickup(pack.id, card.id, checked === true)
                                        }
                                      />
                                      <label
                                        htmlFor={`pickup-assign-${pack.id}-${card.id}`}
                                        className="text-xs text-white/60 cursor-pointer"
                                      >
                                        Pickup
                                      </label>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {allCards.length === 0 && (
                          <div className="text-center text-white/40 py-8">
                            カードが登録されていません
                          </div>
                        )}
                      </div>
                    )}

                    {/* パック画像設定 */}
                    {activeTab === "images" && (
                      <div className="p-4 bg-white/5">
                        <div className="mb-4 flex items-center justify-between">
                          <div className="text-sm text-white/60">
                            パック画像セットを選択してください（表面・裏面がペアで管理されます）
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleSavePackSetId(pack.id)}
                            disabled={
                              saving === `assets-${pack.id}` || !hasPackSetIdChanges(pack.id)
                            }
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {saving === `assets-${pack.id}` ? (
                              "保存中..."
                            ) : (
                              <>
                                <Save className="w-4 h-4 mr-2" />
                                保存
                              </>
                            )}
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {/* 画像なしオプション */}
                          <button
                            type="button"
                            onClick={() => selectPackSetId(pack.id, null)}
                            className={`p-3 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                              selectedPackSetIds[pack.id] === null
                                ? "border-blue-400 bg-blue-400/20"
                                : "border-white/20 bg-white/5 hover:bg-white/10"
                            }`}
                          >
                            <X className="w-8 h-8 text-white/40 mb-2" />
                            <span className="text-xs text-white/60">なし</span>
                          </button>

                          {packImageSets.map((set) => (
                            <button
                              key={set.packSetId}
                              type="button"
                              onClick={() => selectPackSetId(pack.id, set.packSetId)}
                              className={`p-3 rounded-lg border-2 overflow-hidden transition-all ${
                                selectedPackSetIds[pack.id] === set.packSetId
                                  ? "border-blue-400 ring-2 ring-blue-400/50"
                                  : "border-white/20 hover:border-white/40"
                              }`}
                            >
                              <div className="flex gap-2 mb-2">
                                {/* 表面サムネイル */}
                                <div className="flex-1 aspect-[3/4] rounded overflow-hidden bg-white/10">
                                  {set.front ? (
                                    <img
                                      src={set.front.thumbnailUrl}
                                      alt="表面"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white/30 text-xs">
                                      表面なし
                                    </div>
                                  )}
                                </div>
                                {/* 裏面サムネイル */}
                                <div className="flex-1 aspect-[3/4] rounded overflow-hidden bg-white/10">
                                  {set.back ? (
                                    <img
                                      src={set.back.thumbnailUrl}
                                      alt="裏面"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white/30 text-xs">
                                      裏面なし
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-xs text-white/60 truncate text-center">
                                {set.front?.originalName || set.back?.originalName || "画像セット"}
                              </div>
                            </button>
                          ))}
                        </div>

                        {packImageSets.length === 0 && (
                          <div className="text-center text-white/40 py-8">
                            パック画像セットがアップロードされていません。
                            <br />
                            アセット管理でパック画像をセットでアップロードしてください。
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </CardUI>
  );
}
