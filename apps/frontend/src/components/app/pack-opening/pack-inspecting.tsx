import type { Card } from "@repo/types";
import { HoloCard } from "@repo/ui/holo-card";
import { ChevronsRight } from "lucide-react";
import { getImageUrl } from "@/lib/api-client";
import { INSPECT_CARD_SIZE } from "./constants";

interface PackInspectingProps {
  gameState: string;
  cards: Card[];
  currentCardIndex: number;
  isCardFlipped: boolean;
  isTransitioning: boolean;
  backImage: string | null;
  onCardClick: () => void;
  onSkipToResults: (e: React.MouseEvent) => void;
}

/**
 * 1枚ずつ確認モードコンポーネント
 */
export function PackInspecting({
  gameState,
  cards,
  currentCardIndex,
  isCardFlipped,
  isTransitioning,
  backImage,
  onCardClick,
  onSkipToResults,
}: PackInspectingProps) {
  if (gameState !== "inspecting") return null;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={isCardFlipped ? "次のカードへ" : "カードをめくる"}
      className="relative cursor-pointer perspective-[1200px]"
      onClick={onCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onCardClick();
        }
      }}
    >
      {/* 1枚確認時は大きなサイズを使用 */}
      <div className={`relative ${INSPECT_CARD_SIZE}`}>
        <div
          key={currentCardIndex}
          className={`
            w-full h-full relative transform-style-3d
            ${isCardFlipped ? "rotate-y-0" : "rotate-y-180"}
            ${isTransitioning ? "opacity-0 scale-90 translate-x-[-50px]" : "opacity-100 scale-100 translate-x-0"}
          `}
          style={{
            transition:
              "transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s, scale 0.3s",
          }}
        >
          {/* 表面: HoloCard を使用 */}
          <div className="absolute inset-0 backface-hidden z-10">
            {cards[currentCardIndex] && (
              <HoloCard
                card={cards[currentCardIndex]}
                imageUrl={getImageUrl(cards[currentCardIndex].image, { format: "webp" })}
                showCount={false}
                className="w-full h-full"
              />
            )}
          </div>

          {/* 裏面: カード裏のデザイン */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-xl overflow-hidden shadow-2xl border-[4px] border-slate-700 bg-slate-800">
            {backImage ? (
              <img src={backImage} alt="Card Back" className="w-full h-full object-cover" />
            ) : (
              /* CSSフォールバック: グラデーション + パターン */
              <div className="w-full h-full bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 relative">
                <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.05)_10px,rgba(255,255,255,0.05)_20px)]" />
                <div className="absolute inset-4 border-2 border-slate-600/50 rounded-lg" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-white/10" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {!isTransitioning && (
        <div className="absolute -bottom-28 left-0 right-0 text-center animate-fade-in flex flex-col items-center gap-4 pointer-events-auto">
          {/* プログレスインジケーター */}
          <div className="flex justify-center gap-1">
            {cards.map((_, idx) => (
              <div
                key={`progress-${
                  // biome-ignore lint/suspicious/noArrayIndexKey: プログレスインジケーターなので問題なし
                  idx
                }`}
                className={`h-1.5 rounded-full transition-all ${idx === currentCardIndex ? "w-6 bg-yellow-400" : "w-2 bg-slate-600"}`}
              />
            ))}
          </div>

          {/* 一括オープンボタン */}
          <button
            onClick={onSkipToResults}
            type="button"
            className="group flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium transition-all hover:scale-105 active:scale-95 backdrop-blur-md"
          >
            <ChevronsRight className="w-4 h-4 text-yellow-400 group-hover:translate-x-1 transition-transform" />
            Reveal All
          </button>
        </div>
      )}
    </div>
  );
}
