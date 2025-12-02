/**
 * ホログラフィックカードコンポーネント
 * マウス/タッチイベントに反応して3D変形とホログラム効果を表示
 */

import type { Card } from "@repo/types";
import * as LucideIcons from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { getImageUrl } from "@/lib/api-client";
import { getHoloStyle, getTextStyle } from "@/lib/card-styles";

interface HoloCardProps {
  card: Card;
  onClick?: () => void;
  className?: string;
  showCount?: boolean; // 所持枚数バッジの表示制御（デフォルト: true）
}

/**
 * 個別のカードコンポーネント
 * マウス/タッチイベントを処理し、3D変形とホログラム効果を適用
 */
export function HoloCard({ card, onClick, className = "", showCount = true }: HoloCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // 状態管理: 回転角度, グレア位置, 背景位置, ホバー状態
  const [state, setState] = useState({
    rotate: { x: 0, y: 0 },
    glare: { x: 50, y: 50, opacity: 0 },
    background: { x: 50, y: 50 },
    isHovering: false,
  });

  // 座標計算ロジック（マウス/タッチ共通）
  const updateCardState = useCallback((clientX: number, clientY: number) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // カード内の相対座標計算
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // 中心からの偏差 (-1.0 〜 1.0)
    const xPct = (x / width - 0.5) * 2;
    const yPct = (y / height - 0.5) * 2;

    // 更新
    setState({
      rotate: { x: -yPct * 12, y: xPct * 12 }, // 回転量
      glare: { x: (x / width) * 100, y: (y / height) * 100, opacity: 1 }, // グレア位置
      background: { x: (x / width) * 100, y: (y / height) * 100 }, // 背景位置
      isHovering: true,
    });
  }, []);

  // リセット処理
  const resetCardState = useCallback(() => {
    setState({
      rotate: { x: 0, y: 0 },
      glare: { x: 50, y: 50, opacity: 0 },
      background: { x: 50, y: 50 },
      isHovering: false,
    });
  }, []);

  // イベントハンドラ
  const handleMouseMove = (e: React.MouseEvent) => updateCardState(e.clientX, e.clientY);
  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) updateCardState(touch.clientX, touch.clientY);
  };

  // スタイル計算 - ホバー状態を渡す
  const holoStyle = getHoloStyle(card.holoType, state.background, state.isHovering);
  const textStyle = getTextStyle(card.textStyle, state.background, state.isHovering);

  // アイコンコンポーネントを動的に取得
  const IconComponent = (LucideIcons[card.iconName as keyof typeof LucideIcons] ||
    LucideIcons.Box) as React.ComponentType<{ className?: string }>;

  return (
    <div
      role={onClick ? "button" : "img"}
      tabIndex={onClick ? 0 : undefined}
      className={`relative group perspective-1000 touch-none ${className}`}
      style={{ perspective: "1000px" }}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <div
        ref={cardRef}
        role="presentation"
        // マウスイベント
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setState((s) => ({ ...s, isHovering: true }))}
        onMouseLeave={resetCardState}
        // タッチイベント
        onTouchStart={(e) => {
          const touch = e.touches[0];
          if (touch) updateCardState(touch.clientX, touch.clientY);
        }}
        onTouchMove={handleTouchMove}
        onTouchEnd={resetCardState}
        onTouchCancel={resetCardState}
        className="
          relative w-full h-full rounded-xl transition-all duration-300 ease-out
          shadow-xl select-none cursor-pointer overflow-hidden bg-gray-900 border border-gray-800
        "
        style={{
          transform: `rotateX(${state.rotate.x}deg) rotateY(${state.rotate.y}deg) scale3d(1, 1, 1)`,
          transformStyle: "preserve-3d",
          boxShadow: state.isHovering
            ? "0 20px 40px -10px rgba(0, 0, 0, 0.6)"
            : "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
        }}
      >
        {/* Layer 1: ベースコンテンツ (画像・テキスト) */}
        <div className="absolute inset-0 z-10 flex flex-col pointer-events-none">
          {/* 所持枚数バッジ - 立体的に浮かせる */}
          {showCount && (
            <div
              className="absolute top-3 right-3 z-50 px-3 py-1 bg-black/60 backdrop-blur-md border border-white/20 rounded-full shadow-lg"
              style={{ transform: "translateZ(30px)" }}
            >
              <span className="text-xs font-bold text-white font-mono tracking-wider drop-shadow-md">
                x{card.count}
              </span>
            </div>
          )}

          {/* 枠線 */}
          <div
            className={`absolute inset-0 border-[6px] rounded-xl border-opacity-60 z-20 pointer-events-none transition-colors duration-300 ${
              state.isHovering ? "border-gray-500" : "border-gray-800"
            }`}
          />

          {/* 画像 */}
          <div className="w-full aspect-square relative overflow-hidden bg-black">
            <img
              src={getImageUrl(card.image, { format: "webp" })}
              alt={card.name}
              className="w-full h-full object-cover transform scale-105"
              loading="eager"
              decoding="async"
            />
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-900 to-transparent" />
          </div>

          {/* テキストエリア */}
          <div className="flex-1 bg-gray-900 p-4 text-white relative overflow-hidden">
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h2
                    className="text-lg font-bold tracking-wide font-sans mb-0.5"
                    style={textStyle}
                  >
                    {card.name}
                  </h2>
                  <p className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">
                    {card.type}
                  </p>
                </div>
                <div className="bg-gray-800 p-1.5 rounded-md border border-gray-700">
                  <IconComponent className="w-5 h-5" />
                </div>
              </div>
              <div className="w-full h-[1px] bg-gray-800 my-2" />
              <p className="text-xs text-gray-400 leading-relaxed opacity-90">{card.description}</p>
            </div>
          </div>
        </div>

        {/* Layer 2: ホログラムエフェクト (動的スタイル適用) */}
        {card.holoType !== "none" && (
          <div
            className="absolute inset-0 z-20 pointer-events-none transition-opacity duration-300"
            style={{ ...holoStyle, opacity: state.isHovering ? holoStyle.opacity : 0 }}
          />
        )}

        {/* Layer 3: ノイズテクスチャ (共通) */}
        <div
          className="absolute inset-0 z-20 pointer-events-none mix-blend-overlay opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")`,
            opacity: state.isHovering ? 0.2 : 0.05,
          }}
        />

        {/* Layer 4: グレア（光沢） */}
        <div
          className="absolute inset-0 z-30 pointer-events-none mix-blend-overlay transition-opacity duration-300"
          style={{
            background: `radial-gradient(farthest-corner at ${state.glare.x}% ${state.glare.y}%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.3) 25%, rgba(255,255,255,0) 60%)`,
            opacity: state.isHovering ? 0.6 : 0,
          }}
        />

        {/* Layer 5: 内部発光 (Inner Glow) */}
        <div
          className="absolute inset-0 z-40 rounded-xl pointer-events-none transition-opacity duration-300"
          style={{
            boxShadow: `inset 0 0 15px rgba(255,255,255, ${state.isHovering ? 0.15 : 0})`,
          }}
        />
      </div>
    </div>
  );
}
