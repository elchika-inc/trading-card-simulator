import {
  type AssetMetadata,
  type CardRarity,
  type Card as CardType,
  FRAME_COLOR_LABELS,
  type FrameColor,
  type FrameColorPreset,
  type GachaPack,
  type HoloType,
  type PackAssignment,
  type TextStyleType,
} from "@repo/types";
import { HoloCard } from "@repo/ui/holo-card";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { PackAssignmentSection } from "./pack-assignment-section";

// 全HoloType（60種類以上）
const HOLO_TYPES: HoloType[] = [
  "none",
  "basic",
  "vertical",
  "diagonal",
  "sparkle",
  "ghost",
  "rainbow",
  "checker",
  "cracked",
  "hexagon",
  "wireframe",
  "oil",
  "gold",
  "silver",
  "brushed",
  "carbon",
  "magma",
  "cosmic",
  "circuit",
  "scales",
  "glitter",
  "waves",
  "crystal",
  "nebula",
  "matrix",
  "vortex",
  "laser",
  "sequins",
  "marble",
  "plasmatic",
  "kaleidoscope",
  "aurora",
  "damascus",
  "quantum",
  "bio",
  "hyperspeed",
  "stained-glass",
  "caustics",
  "runes",
  "blueprint",
  "inferno",
  "enchanted",
  "moire",
  "liquid-metal",
  "cyber-glitch",
  "nebula-storm",
  "prismatic-shards",
  "phantom-grid",
  "animated-galaxy",
  "animated-rain",
  "animated-scan",
  "animated-warp",
  "animated-pulse",
  "animated-shimmer",
  "blaze",
  "ember",
  "hellfire",
  "phoenix",
  "hearts",
  "bubbles",
  "sparkle-dust",
  "candy-swirl",
  "frozen",
  "neon-grid",
  "stealth",
  "dark-matter",
  "abyssal",
  "shadow-warp",
  "eclipsed",
  "corrupted",
];

// 全TextStyleType（40種類以上）
const TEXT_STYLES: TextStyleType[] = [
  "none",
  "gold",
  "silver",
  "steel",
  "neon",
  "neon-pink",
  "plasma",
  "fire",
  "ice",
  "emerald",
  "holo",
  "glitch",
  "retro",
  "comic",
  "outline",
  "3d-pop",
  "matrix-text",
  "magma-text",
  "glass",
  "toxic",
  "deep-space",
  "runic",
  "ice-shard",
  "blueprint-text",
  "vapor",
  "glitch-pro",
  "liquid-chrome",
  "ghost-fade",
  "prism-shard",
  "animated-glitch",
  "breathing-glow",
  "cotton-candy",
  "bubblegum",
  "frostbite",
  "cyberpunk",
  "shadow-whispers",
  "void-script",
];

const RARITIES: CardRarity[] = ["hot", "cute", "cool", "dark", "white"];

// フレーム色プリセット一覧
const FRAME_COLOR_PRESETS: FrameColorPreset[] = [
  "default",
  "gold",
  "silver",
  "bronze",
  "platinum",
  "red",
  "blue",
  "green",
  "purple",
  "pink",
  "orange",
  "black",
  "white",
  "rainbow",
  "custom",
];

export interface CardFormData {
  name: string;
  holoType: HoloType;
  textStyle: TextStyleType;
  imageId: string;
  description: string;
  iconName: string;
  rarity: CardRarity;
  frameColor?: FrameColor;
  packAssignments: PackAssignment[];
}

/**
 * imageフィールドからassetIdを抽出するヘルパー関数
 * コンポーネント外に定義してuseEffectの依存配列問題を回避
 */
const extractAssetId = (image: string): string => {
  const imageId = image || "";

  // URLからassetIdを抽出（/api/assets/card/{assetId} 形式の場合）
  const assetIdMatch = imageId.match(/\/api\/assets\/card\/([^/?]+)/);
  if (assetIdMatch?.[1]) {
    return assetIdMatch[1];
  }
  // /serve/{assetId} 形式の場合
  const serveMatch = imageId.match(/\/serve\/([^/?]+)/);
  if (serveMatch?.[1]) {
    return serveMatch[1];
  }
  return imageId;
};

interface CardFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initialData?: CardType;
  onSubmit: (data: CardFormData) => Promise<void>;
}

/**
 * カード作成・編集共通モーダル
 */
export function CardFormModal({
  open,
  onOpenChange,
  mode,
  initialData,
  onSubmit,
}: CardFormModalProps) {
  const [formData, setFormData] = useState<CardFormData>({
    name: "",
    holoType: "basic",
    textStyle: "gold",
    imageId: "",
    description: "",
    iconName: "Star",
    rarity: "hot",
    frameColor: undefined,
    packAssignments: [],
  });
  const [assets, setAssets] = useState<AssetMetadata[]>([]);
  const [availablePacks, setAvailablePacks] = useState<GachaPack[]>([]);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [packsLoaded, setPacksLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // モーダルが開いたときに初期値を設定（assets & packsロード完了後）
  useEffect(() => {
    if (!open) {
      setAssetsLoaded(false);
      setPacksLoaded(false);
      return;
    }

    if (!assetsLoaded || !packsLoaded) return;

    const initializeFormData = async () => {
      if (mode === "edit" && initialData) {
        const imageId = extractAssetId(initialData.image);

        // 編集モードの場合、カード詳細APIからパック割当情報を取得
        let packAssignments: PackAssignment[] = [];
        try {
          const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8787";
          const response = await fetch(`${backendUrl}/api/cards/${initialData.id}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data?.packAssignments) {
              packAssignments = data.data.packAssignments;
            }
          }
        } catch (err) {
          console.error("Failed to fetch card pack assignments:", err);
        }

        setFormData({
          name: initialData.name,
          holoType: initialData.holoType,
          textStyle: initialData.textStyle,
          imageId,
          description: initialData.description,
          iconName: initialData.iconName,
          rarity: initialData.rarity,
          frameColor: initialData.frameColor,
          packAssignments,
        });
      } else if (mode === "create") {
        setFormData({
          name: "",
          holoType: "basic",
          textStyle: "gold",
          imageId: "",
          description: "",
          iconName: "Star",
          rarity: "hot",
          frameColor: undefined,
          packAssignments: [],
        });
      }
      setError(null);
    };

    initializeFormData();
  }, [open, mode, initialData, assetsLoaded, packsLoaded]);

  // 選択された画像のURLを取得
  const selectedImageUrl = useMemo(() => {
    if (!formData.imageId) return null;
    const imageApiUrl = import.meta.env.VITE_IMAGE_API_URL || "http://localhost:8788";
    return `${imageApiUrl}/api/assets/card/${formData.imageId}?format=webp`;
  }, [formData.imageId]);

  // プレビュー用のカードオブジェクトを作成
  const previewCard: CardType = useMemo(
    () => ({
      id: initialData?.id ?? 0,
      count: 1,
      name: formData.name || "カード名",
      type: `Style: ${formData.textStyle}, Anim: ${formData.holoType}`,
      holoType: formData.holoType,
      textStyle: formData.textStyle,
      image: selectedImageUrl || "",
      description: formData.description || "説明文を入力してください",
      iconName: formData.iconName || "Star",
      rarity: formData.rarity,
      frameColor: formData.frameColor,
    }),
    [formData, selectedImageUrl, initialData?.id],
  );

  // カード画像アセット一覧とパック一覧を取得（モーダルが開いたら最初に取得）
  useEffect(() => {
    if (!open) {
      // モーダルが閉じたらクリア
      setAssets([]);
      setAvailablePacks([]);
      setAssetsLoaded(false);
      setPacksLoaded(false);
      return;
    }

    const fetchAssets = async () => {
      try {
        const imageApiUrl = import.meta.env.VITE_IMAGE_API_URL || "http://localhost:8788";
        const response = await fetch(`${imageApiUrl}/api/assets?type=card`);
        if (!response.ok) throw new Error("アセット一覧の取得に失敗しました");
        const data = await response.json();
        setAssets(data.data.assets);
      } catch (err) {
        console.error("Failed to fetch assets:", err);
      } finally {
        setAssetsLoaded(true);
      }
    };

    const fetchPacks = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8787";
        const response = await fetch(`${backendUrl}/api/gacha/packs`);
        if (!response.ok) throw new Error("パック一覧の取得に失敗しました");
        const data = await response.json();
        setAvailablePacks(data.packs || []);
      } catch (err) {
        console.error("Failed to fetch packs:", err);
      } finally {
        setPacksLoaded(true);
      }
    };

    fetchAssets();
    fetchPacks();
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "カード作成" : "カード編集"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "新しいカードを作成します" : "カード情報を編集します"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
          {/* プレビューエリア（frontendの背景を再現） */}
          <div className="flex items-center justify-center rounded-lg bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] p-8">
            <div className="w-52 h-80">
              <HoloCard
                card={previewCard}
                showCount={false}
                imageUrl={selectedImageUrl || undefined}
                className="w-full h-full"
              />
            </div>
          </div>

          {/* フォームエリア */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">カード名</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="holoType">ホログラムエフェクト</Label>
              <Select
                value={formData.holoType}
                onValueChange={(value: HoloType) => setFormData({ ...formData, holoType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HOLO_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="textStyle">テキストスタイル</Label>
              <Select
                value={formData.textStyle}
                onValueChange={(value: TextStyleType) =>
                  setFormData({ ...formData, textStyle: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEXT_STYLES.map((style) => (
                    <SelectItem key={style} value={style}>
                      {style}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="imageId">画像</Label>
              <Select
                value={formData.imageId}
                onValueChange={(value) => setFormData({ ...formData, imageId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="画像を選択" />
                </SelectTrigger>
                <SelectContent>
                  {assets.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.originalName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="rarity">レアリティ</Label>
              <Select
                value={formData.rarity}
                onValueChange={(value: CardRarity) => setFormData({ ...formData, rarity: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RARITIES.map((rarity) => (
                    <SelectItem key={rarity} value={rarity}>
                      {rarity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="frameColor">フレーム色</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.frameColor?.preset || "default"}
                  onValueChange={(value: FrameColorPreset) => {
                    if (value === "default") {
                      setFormData({ ...formData, frameColor: undefined });
                    } else {
                      setFormData({
                        ...formData,
                        frameColor: {
                          preset: value,
                          customColor:
                            value === "custom" ? formData.frameColor?.customColor : undefined,
                        },
                      });
                    }
                  }}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FRAME_COLOR_PRESETS.map((preset) => (
                      <SelectItem key={preset} value={preset}>
                        {FRAME_COLOR_LABELS[preset]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.frameColor?.preset === "custom" && (
                  <Input
                    type="color"
                    value={formData.frameColor?.customColor || "#000000"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        frameColor: {
                          preset: "custom",
                          customColor: e.target.value,
                        },
                      })
                    }
                    className="w-14 h-10 p-1 cursor-pointer"
                  />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                未設定の場合、レアリティに応じたデフォルト色が使用されます
              </p>
            </div>

            <div>
              <Label htmlFor="description">説明文（任意）</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="iconName">アイコン名（任意）</Label>
              <Input
                id="iconName"
                value={formData.iconName}
                onChange={(e) => setFormData({ ...formData, iconName: e.target.value })}
                placeholder="例: Flame, Heart, Snowflake"
              />
            </div>

            {/* パック割当セクション */}
            <div className="pt-2 border-t">
              <PackAssignmentSection
                assignments={formData.packAssignments}
                availablePacks={availablePacks}
                onChange={(packAssignments) => setFormData({ ...formData, packAssignments })}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                キャンセル
              </Button>
              <Button type="submit" disabled={loading || !formData.imageId}>
                {loading
                  ? mode === "create"
                    ? "作成中..."
                    : "更新中..."
                  : mode === "create"
                    ? "カードを作成"
                    : "カードを更新"}
              </Button>
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
