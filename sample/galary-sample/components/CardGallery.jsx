import React, { useState } from 'react';
import { X } from 'lucide-react';
import { HoloCard } from './HoloCard';
import { CARDS_DATA } from '../data/cards-data';
import { cssKeyframes } from '../styles/keyframes';

// ==========================================
// CardGallery Component (Main App)
// ==========================================

export function CardGallery() {
  const [selectedCard, setSelectedCard] = useState(null);

  // モーダルを閉じる処理
  const handleCloseModal = () => {
    setSelectedCard(null);
  };

  return (
    <div className="min-h-screen bg-neutral-950 py-16 px-4 text-slate-200">
      {/* グローバルCSSアニメーションを注入 */}
      <style dangerouslySetInnerHTML={{ __html: cssKeyframes }} />

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-purple-200 to-pink-200 pb-2">
            Holographic Card Gallery
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-base">
            Click on a card to inspect it in detail.
          </p>
        </div>

        {/* グリッドレイアウト */}
        <div className="flex flex-wrap justify-center gap-8 perspective-origin-center">
          {CARDS_DATA.map((card) => (
            <HoloCard
              key={card.id}
              card={card}
              onClick={() => setSelectedCard(card)} // クリックで選択
              className="w-[260px] h-[400px]" // デフォルトサイズ
            />
          ))}
        </div>

        <div className="mt-20 text-center text-xs text-gray-700">
          <p>Powered by React, Tailwind CSS & CSS Blend Modes.</p>
        </div>
      </div>

      {/* モーダルオーバーレイ */}
      {selectedCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity duration-300"
          onClick={handleCloseModal} // 背景クリックで閉じる
        >
          <div
            className="relative"
            onClick={(e) => e.stopPropagation()} // カードクリック時は閉じない
          >
            {/* 閉じるボタン */}
            <button
              onClick={handleCloseModal}
              className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={24} />
            </button>

            {/* 拡大表示されたカード */}
            <HoloCard
              card={selectedCard}
              className="w-[320px] h-[480px] sm:w-[400px] sm:h-[600px]" // 拡大サイズ
            />
          </div>
        </div>
      )}
    </div>
  );
}
