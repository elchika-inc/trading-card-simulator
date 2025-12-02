import React, { useState, useRef, useEffect } from 'react';
import { Star } from 'lucide-react';

/**
 * 汎用カードコンポーネント（3Dホバーエフェクト付き）
 */
export function GameCard({ data, isHoverEnabled = true }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  // isHoverEnabled が false になったら位置をリセット
  useEffect(() => {
    if (!isHoverEnabled) {
      setMousePos({ x: 0, y: 0 });
    }
  }, [isHoverEnabled]);

  const handleMouseMove = (e) => {
    if (!isHoverEnabled || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // 中心からの距離に応じて回転角度を計算 (最大15度 - 少し控えめに)
    const rotateX = ((y - centerY) / centerY) * -15;
    const rotateY = ((x - centerX) / centerX) * 15;

    setMousePos({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  // テーマカラーによる背景色の決定
  const getBgGradient = () => {
    switch(data.theme) {
      case 'red': return 'from-[#2d1a1a] to-[#3d1a1a]';
      case 'blue': return 'from-[#1a1a2d] to-[#1a2d3d]';
      default: return 'from-[#1a1a1a] to-[#2d2d2d]'; // purple/default
    }
  };

  const getArtGradient = () => {
    switch(data.theme) {
      case 'red': return 'from-red-900 to-orange-950';
      case 'blue': return 'from-blue-900 to-cyan-950';
      default: return 'from-purple-900 to-indigo-950';
    }
  };

  return (
    <div
      className="relative w-full h-full"
      style={{ perspective: '1000px' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      ref={cardRef}
    >
      <div
        className={`w-full h-full rounded-[20px] bg-gradient-to-br ${getBgGradient()} border-2 border-white/10 relative shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_30px_rgba(139,92,246,0.2)] overflow-hidden`}
        style={{
          // 遷移中は transition をつけて滑らかに戻るようにする
          transform: `rotateX(${mousePos.x}deg) rotateY(${mousePos.y}deg)`,
          transformStyle: 'preserve-3d',
          transition: isHoverEnabled ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out'
        }}
      >
        {/* ホログラムオーバーレイ */}
        <div
          className="absolute inset-0 z-20 opacity-60 pointer-events-none mix-blend-color-dodge"
          style={{
            background: `linear-gradient(105deg, transparent 20%, rgba(255, 255, 255, 0.1) 25%, transparent 45%, rgba(255, 0, 255, 0.1) 50%, transparent 70%, rgba(0, 255, 255, 0.1) 75%, transparent 80%)`,
            backgroundPosition: `${mousePos.y * 2}% ${mousePos.x * 2}%`,
            backgroundSize: '200% 200%'
          }}
        />

        {/* カードコンテンツ */}
        <div className="p-4 h-full flex flex-col relative z-10 text-white">
          {/* カードヘッダー */}
          <div className="flex justify-between items-start mb-2">
            <span className="font-orbitron font-bold text-yellow-400 text-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {data.rarity}
            </span>
            <div className="flex gap-0.5">
              {[...Array(data.stars)].map((_, i) => (
                <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
          </div>

          {/* カードイラスト */}
          <div className="relative h-[60%] rounded-xl overflow-hidden border border-white/10 shadow-inner group">
            <div className={`absolute inset-0 bg-gradient-to-b ${getArtGradient()} flex items-center justify-center`}>
              {/* イラスト部分：ここでは汎用SVGを表示。 */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-32 h-32 text-white/80 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                <path d="M12 2L15 8L21 9L17 14L18 20L12 17L6 20L7 14L3 9L9 8L12 2Z" fill="currentColor" className="opacity-20" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 10c-1.5 0-3-1-3-2.5 0-.5.5-1 1-1.5.5-1 1.5-1.5 2-2.5-1.5 0-2.5-1-2.5-2.5 0-.5.5-1 .5-1.5-.5-1-1-1.5-2-2C14.5 1 13 2 12 3c-1.5-1-3-2-4.5-1-1 .5-1.5 1-2 2 0 .5.5 1 .5 1.5 0 1.5-1 2.5-2.5 2.5.5 1 1.5 1.5 2 2.5.5.5 1 1 1 1.5 0 1.5-1.5 2.5-3 2.5 2.5 0 4-1.5 4-3.5 0-2 2-3.5 4.5-3.5s4.5 1.5 4.5 3.5c0 2 1.5 3.5 4 3.5z" />
              </svg>
            </div>
            {/* イラスト上のエフェクト */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>

          {/* カード情報 */}
          <div className="mt-4 flex-grow">
            <h3 className="font-bold text-lg mb-1 tracking-wide font-zen text-shadow">{data.name}</h3>
            <div className={`w-full h-px bg-gradient-to-r from-transparent ${data.theme === 'red' ? 'via-red-500' : data.theme === 'blue' ? 'via-blue-500' : 'via-purple-500'} to-transparent mb-2 opacity-50`}></div>
            <p className="text-[10px] text-gray-300 leading-relaxed font-light">
              {data.description}
            </p>
          </div>

          {/* カードステータス */}
          <div className="mt-auto flex justify-between items-end font-orbitron">
            <div className="text-center">
              <div className="text-[9px] text-gray-400 tracking-wider">ATK</div>
              <div className="text-2xl font-bold text-red-400 leading-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">{data.atk}</div>
            </div>
            <div className="text-center">
              <div className="text-[9px] text-gray-400 tracking-wider">DEF</div>
              <div className="text-2xl font-bold text-blue-400 leading-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">{data.def}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
