import React from 'react';

/**
 * カード表示コンポーネント
 */
export const CardView = ({ card, borderWidth = "border-[6px]" }) => {
  if (!card) return null;

  return (
    <div className={`w-full h-full rounded-xl overflow-hidden ${borderWidth} border-yellow-500/30 relative bg-slate-800 ${card.color || 'bg-slate-800'} shadow-2xl`}>
      <img
        src={card.image}
        alt={card.name}
        className="w-full h-full object-cover mix-blend-overlay opacity-80"
        onError={(e) => { e.target.style.opacity = 0; }}
      />
      <div className="absolute inset-0 p-4 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <span className="text-white font-bold text-lg drop-shadow-md">{card.name}</span>
          <span className="text-yellow-300 text-sm font-bold bg-black/30 px-2 py-0.5 rounded">{card.rarity}</span>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-0 animate-shimmer pointer-events-none"></div>
    </div>
  );
};
