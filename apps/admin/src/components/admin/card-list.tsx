import type { Card } from "@repo/types";
import { HoloCard } from "@repo/ui/holo-card";
import { useCallback, useEffect, useState } from "react";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Card as UICard,
} from "@/components/ui/card";

interface CardListProps {
  refreshTrigger?: number;
}

export function CardList({ refreshTrigger }: CardListProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <UICard>
      <CardHeader>
        <CardTitle>カード一覧</CardTitle>
        <CardDescription>作成されたカード（{cards.length}枚）</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap justify-center gap-6">
          {cards.map((card) => {
            // 画像URLを決定：images APIから取得
            const imageApiUrl = import.meta.env.VITE_IMAGE_API_URL || "http://localhost:8788";
            const imageUrl = card.image.startsWith("http")
              ? card.image
              : `${imageApiUrl}/api/images/${card.image}?format=webp`;
            return (
              <div key={card.id} className="w-52 h-80">
                <HoloCard
                  card={card}
                  showCount={false}
                  imageUrl={imageUrl}
                  className="w-full h-full"
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </UICard>
  );
}
