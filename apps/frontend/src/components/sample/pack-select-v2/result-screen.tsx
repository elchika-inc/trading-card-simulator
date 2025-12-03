import type { CardAsset } from "./constants";
import { ImageWithFallback } from "./image-with-fallback";

interface ResultScreenProps {
  cards: CardAsset[];
  onReset: () => void;
}

export function ResultScreen({ cards, onReset }: ResultScreenProps) {
  return (
    <div className="z-20 w-full h-full overflow-y-auto p-4 flex flex-col items-center bg-black/60 backdrop-blur-md animate-fade-in">
      <h2 className="text-3xl font-bold text-white mb-8 mt-10 drop-shadow-lg">
        獲得したカード
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 w-full max-w-5xl px-4">
        {cards.map((card, index) => (
          <div
            key={card.file}
            className="flex flex-col items-center animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div
              className={`relative w-full aspect-[1421/2064] rounded-xl overflow-hidden shadow-2xl transition-transform hover:scale-105 duration-300 group ${
                card.isRare ? "ring-2 ring-yellow-400" : ""
              }`}
            >
              <ImageWithFallback
                src={card.file}
                fallback={card.fallback}
                alt={`Card ${index}`}
                className="w-full h-full object-cover"
              />
              {card.isRare && (
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              )}
            </div>
            {card.isRare && (
              <span className="text-yellow-400 text-sm mt-3 font-bold tracking-widest">
                ★ RARE
              </span>
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onReset}
        className="mt-16 px-12 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-full font-bold shadow-lg transform transition hover:scale-105 active:scale-95 mb-12 tracking-widest ring-4 ring-blue-900/50"
      >
        もう一度開封する
      </button>
    </div>
  );
}
