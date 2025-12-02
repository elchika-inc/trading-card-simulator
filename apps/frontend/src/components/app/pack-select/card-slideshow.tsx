import type { Card } from "@repo/types";
import { Info, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { getImageUrl } from "@/lib/api-client";
import { HoloCard } from "../holo-card";

interface CardSlideshowProps {
  cards: Card[];
  onCardClick?: (card: Card) => void;
  CardComponent?: React.ComponentType<{ card: Card; className?: string; showCount?: boolean }>;
}

/**
 * 注目カードのスライドショーコンポーネント
 */
export function CardSlideshow({
  cards,
  onCardClick,
  CardComponent = HoloCard,
}: CardSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [direction, setDirection] = useState(1);

  // 画像の事前読み込み
  useEffect(() => {
    if (!cards || cards.length === 0) return;
    // 全てのスライドショー画像を事前にロード
    cards.forEach((card) => {
      const img = new Image();
      img.src = getImageUrl(card.image, { format: "webp" });
    });
  }, [cards]);

  // 自動スライド
  useEffect(() => {
    if (!cards || cards.length === 0) return;
    const interval = setInterval(() => {
      if (!transitioning) {
        setDirection(1);
        setTransitioning(true);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [cards, transitioning]);

  // アニメーション制御
  useEffect(() => {
    if (transitioning) {
      const timer = setTimeout(() => {
        setCurrentIndex((prev) => (prev + direction + cards.length) % cards.length);
        setTransitioning(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [transitioning, direction, cards.length]);

  if (!cards || cards.length === 0) return null;

  const currentCard = cards[currentIndex];
  if (!currentCard) return null;

  return (
    <div
      role="button"
      tabIndex={onCardClick ? 0 : undefined}
      className="flex flex-col items-center bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-2xl animate-[fadeIn_0.5s_ease-out] cursor-pointer hover:bg-black/50 transition-colors group relative"
      onClick={() => onCardClick?.(currentCard)}
      onKeyDown={(e) => e.key === "Enter" && onCardClick?.(currentCard)}
    >
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-white/20 p-1 rounded-full text-white">
          <Info size={16} />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 text-zinc-300">
        <Star size={16} className="text-yellow-500 fill-yellow-500" />
        <span className="text-sm font-bold tracking-wider uppercase">Featured Cards</span>
      </div>

      <div className="relative w-[300px] h-[420px] flex items-center justify-center mb-4">
        <div className="w-full h-full animate-float">
          {/* 全カードをDOMに保持してopacityで制御 */}
          {cards.map((card, idx) => {
            const isCurrent = idx === currentIndex;
            const prevIndex = (currentIndex - direction + cards.length) % cards.length;
            const isPrev = idx === prevIndex;

            // アニメーション中でなく、かつ現在のカードでない場合は非表示
            const shouldHide = !transitioning && !isCurrent;
            // アニメーション中は、現在と直前以外は非表示
            const shouldHideInTransition = transitioning && !isCurrent && !isPrev;

            let animClass = "";
            if (shouldHide || shouldHideInTransition) {
              // 非表示状態（DOMには残すが見えなくする）
              animClass = "opacity-0 pointer-events-none";
            } else if (transitioning) {
              if (isCurrent) {
                animClass = direction === 1 ? "card-anim-enter-right" : "card-anim-enter-left";
              } else if (isPrev) {
                animClass = direction === 1 ? "card-anim-exit-left" : "card-anim-exit-right";
              }
            } else if (isCurrent) {
              animClass = "opacity-100 z-10";
            }

            return (
              <div key={card.id} className={`absolute top-0 left-0 w-full h-full ${animClass}`}>
                <CardComponent card={card} className="w-full h-full" showCount={false} />
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center">
        <div className="text-lg font-bold text-white mb-1 group-hover:text-yellow-300 transition-colors">
          {currentCard.name}
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full">
          <span
            className={`text-xs font-bold ${
              currentCard.rarity === "hot" ? "text-yellow-400" : "text-zinc-300"
            }`}
          >
            Rarity: {currentCard.rarity}
          </span>
        </div>
      </div>

      <div className="flex gap-1.5 mt-6">
        {cards.map((_, idx) => (
          <div
            key={`${cards[idx]?.id}-${idx}`}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIndex ? "bg-white w-4" : "bg-white/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
