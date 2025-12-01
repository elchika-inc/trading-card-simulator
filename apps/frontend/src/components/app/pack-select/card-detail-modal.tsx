import type { Card } from "@repo/types";
import { X } from "lucide-react";
import { HoloCard } from "../holo-card";

interface CardDetailModalProps {
  card: Card | null;
  onClose: () => void;
  CardComponent?: React.ComponentType<{ card: Card }>;
}

/**
 * カードの詳細を表示するモーダル
 */
export function CardDetailModal({ card, onClose, CardComponent = HoloCard }: CardDetailModalProps) {
  if (!card) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
      {/* 背景オーバーレイ */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      />

      {/* モーダルコンテンツ */}
      <div className="relative z-10 flex flex-col items-center max-w-md w-full animate-[zoomIn_0.3s_cubic-bezier(0.16,1,0.3,1)]">
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 md:-right-12 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          type="button"
        >
          <X size={24} />
        </button>

        {/* カード拡大表示 */}
        <div className="w-48 h-64 transform scale-150 mb-12 shadow-2xl">
          <CardComponent card={card} />
        </div>

        {/* 詳細情報 */}
        <div className="bg-zinc-900/90 border border-white/10 rounded-xl p-6 w-full text-center shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span
              className={`text-sm font-bold px-2 py-0.5 rounded ${
                card.rarity === "SR"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-zinc-700 text-zinc-300"
              }`}
            >
              {card.rarity}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">{card.name}</h3>
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-white/20 to-transparent mx-auto mb-4" />
          <p className="text-zinc-400 text-sm leading-relaxed">
            {card.description || "このカードに関する詳細情報はまだありません。"}
          </p>
        </div>
      </div>
    </div>
  );
}
