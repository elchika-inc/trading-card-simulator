import type { Card } from "@repo/types";
import { HoloCard } from "@repo/ui/holo-card";
import { RefreshCcw } from "lucide-react";
import { getImageUrl } from "@/lib/api-client";

interface PackResultsProps {
  gameState: string;
  cards: Card[];
  onReset: () => void;
}

/**
 * 結果一覧モードコンポーネント
 */
export function PackResults({ gameState, cards, onReset }: PackResultsProps) {
  if (gameState !== "results") return null;

  return (
    <div className="absolute inset-0 z-[100] animate-fade-in pointer-events-auto flex items-center justify-center">
      <div className="w-full h-full flex flex-col items-center justify-center p-4">
        {/* カード一覧コンテナ */}
        <div className="flex flex-col items-center justify-center gap-4 w-full">
          {/* 1行目 (3枚) */}
          <div className="flex flex-wrap justify-center items-end gap-2 sm:gap-6">
            {cards.slice(0, 3).map((card, index) => (
              <div
                key={card.id}
                className="relative w-20 h-28 sm:w-28 sm:h-40 md:w-36 md:h-52 animate-result-card opacity-0"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: "forwards",
                }}
              >
                <HoloCard
                  card={card}
                  imageUrl={getImageUrl(card.image, { format: "webp" })}
                  showCount={false}
                  className="w-full h-full"
                />
              </div>
            ))}
          </div>

          {/* 2行目 (残り) */}
          <div className="flex flex-wrap justify-center items-start gap-2 sm:gap-6">
            {cards.slice(3).map((card, index) => (
              <div
                key={card.id}
                className="relative w-20 h-28 sm:w-28 sm:h-40 md:w-36 md:h-52 animate-result-card opacity-0"
                style={{
                  animationDelay: `${(index + 3) * 100}ms`,
                  animationFillMode: "forwards",
                }}
              >
                <HoloCard
                  card={card}
                  imageUrl={getImageUrl(card.image, { format: "webp" })}
                  showCount={false}
                  className="w-full h-full"
                />
              </div>
            ))}
          </div>
        </div>

        <div
          className="mt-6 flex flex-col items-center gap-4 animate-fade-in"
          style={{ animationDelay: "800ms", animationFillMode: "both" }}
        >
          <h2 className="text-white text-xl md:text-2xl font-bold tracking-widest drop-shadow-lg">
            NEW CARDS!
          </h2>
          <button
            onClick={onReset}
            type="button"
            className="px-6 py-2.5 bg-white text-slate-900 rounded-full font-bold shadow-lg shadow-white/20 hover:scale-105 active:scale-95 transition-transform flex items-center gap-2 text-sm md:text-base"
          >
            <RefreshCcw className="w-4 h-4" />
            Open Another Pack
          </button>
        </div>
      </div>
    </div>
  );
}
