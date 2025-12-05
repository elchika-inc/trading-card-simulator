import type { Card } from "@repo/types";
import { HoloCard } from "@repo/ui/holo-card";
import { Pencil, ZoomIn } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { CardPreviewModal } from "@/components/admin/card-preview-modal";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Card as UICard,
} from "@/components/ui/card";

interface CardListProps {
  refreshTrigger?: number;
  onEditCard?: (card: Card) => void;
}

export function CardList({ refreshTrigger, onEditCard }: CardListProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewCard, setPreviewCard] = useState<{ card: Card; imageUrl?: string } | null>(null);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8787";
      const response = await fetch(`${apiUrl}/api/cards`);

      if (!response.ok) {
        throw new Error("カード一覧の取得に失敗しました");
      }

      const data = await response.json();
      setCards(data.cards);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">エラー: {error}</div>;
  }

  return (
    <UICard className="bg-transparent border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-white">カード一覧</CardTitle>
        <CardDescription className="text-white/60">
          作成されたカード（{cards.length}枚）
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap justify-center gap-6">
          {cards.map((card) => {
            // 画像URLを決定：アセットAPIから取得（imageが空の場合はundefined）
            const imageApiUrl = import.meta.env.VITE_IMAGE_API_URL || "http://localhost:8788";
            const imageUrl = card.image
              ? card.image.startsWith("http")
                ? card.image
                : `${imageApiUrl}/api/assets/card/${card.image}?format=webp`
              : undefined;
            return (
              <div key={card.id} className="relative group">
                <button
                  type="button"
                  onClick={() => setPreviewCard({ card, imageUrl })}
                  className="w-52 h-80 cursor-pointer relative"
                >
                  <HoloCard
                    card={card}
                    showCount={false}
                    imageUrl={imageUrl}
                    className="w-full h-full"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                    <ZoomIn className="w-8 h-8 text-white" />
                  </div>
                </button>
                {onEditCard && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditCard(card);
                    }}
                  >
                    <Pencil className="w-4 h-4 mr-1" />
                    編集
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>

      {/* プレビューモーダル */}
      <CardPreviewModal
        card={previewCard?.card ?? null}
        imageUrl={previewCard?.imageUrl}
        open={previewCard !== null}
        onOpenChange={(open) => !open && setPreviewCard(null)}
      />
    </UICard>
  );
}
