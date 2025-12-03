import type {
  CardCreateRequest,
  CardRarity,
  Card as CardType,
  HoloType,
  ImageMetadata,
  TextStyleType,
} from "@repo/types";
import { HoloCard } from "@repo/ui/holo-card";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

interface CardCreateProps {
  onCreateSuccess?: () => void;
}

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

export function CardCreate({ onCreateSuccess }: CardCreateProps) {
  const [formData, setFormData] = useState<CardCreateRequest>({
    name: "",
    holoType: "basic",
    textStyle: "gold",
    imageId: "",
    description: "",
    iconName: "Star",
    rarity: "hot",
  });
  const [images, setImages] = useState<ImageMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 選択された画像のURLを取得
  const selectedImageUrl = useMemo(() => {
    if (!formData.imageId) return null;
    const imageApiUrl = import.meta.env.VITE_IMAGE_API_URL || "http://localhost:8788";
    return `${imageApiUrl}/api/images/${formData.imageId}?format=webp`;
  }, [formData.imageId]);

  // プレビュー用のカードオブジェクトを作成
  const previewCard: CardType = useMemo(
    () => ({
      id: 0,
      count: 1,
      name: formData.name || "カード名",
      type: `Style: ${formData.textStyle}, Anim: ${formData.holoType}`,
      holoType: formData.holoType,
      textStyle: formData.textStyle,
      image: selectedImageUrl || "",
      description: formData.description || "説明文を入力してください",
      iconName: formData.iconName || "Star",
      rarity: formData.rarity,
    }),
    [formData, selectedImageUrl],
  );

  // 画像一覧を取得
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const imageApiUrl = import.meta.env.VITE_IMAGE_API_URL || "http://localhost:8788";
        const response = await fetch(`${imageApiUrl}/api/images`);
        if (!response.ok) throw new Error("画像一覧の取得に失敗しました");
        const data = await response.json();
        setImages(data.data.images);
      } catch (err) {
        console.error("Failed to fetch images:", err);
      }
    };
    fetchImages();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8787";
      const response = await fetch(`${apiUrl}/api/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`カード作成に失敗しました: ${errorText}`);
      }

      // フォームリセット
      setFormData({
        name: "",
        holoType: "basic",
        textStyle: "gold",
        imageId: "",
        description: "",
        iconName: "Star",
        rarity: "hot",
      });

      onCreateSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "カード作成に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>カード作成</CardTitle>
        <CardDescription>新しいカードを作成します</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* プレビューエリア */}
          <div className="flex items-start justify-center pt-4">
            <div className="w-64 h-96">
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
                  {images.map((img) => (
                    <SelectItem key={img.id} value={img.id}>
                      {img.originalName}
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

            <Button type="submit" disabled={loading || !formData.imageId}>
              {loading ? "作成中..." : "カードを作成"}
            </Button>

            {error && <div className="text-sm text-red-600">{error}</div>}
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
