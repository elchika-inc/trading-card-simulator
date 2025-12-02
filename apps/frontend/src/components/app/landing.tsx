import { ArrowRight, ChevronLeft, ChevronRight, Layers, Sparkles, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { featuredCards } from "@/data/featured-cards";
import { HoloCard } from "./holo-card";
import { MenuButton } from "./menu-button";
import { ParticleBackground } from "./particle-background";

/**
 * ランディングページコンポーネント
 * カルーセル機能付きのトップページ
 */
export function Landing() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [direction, setDirection] = useState(1); // 1: next, -1: prev

  // 自動スライドショー
  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      // 遷移中はスキップ
      if (!transitioning) {
        setDirection(1);
        setTransitioning(true);
      }
    }, 5000); // 5秒ごとに切り替え

    return () => clearInterval(interval);
  }, [isAutoPlay, transitioning]);

  // アニメーション制御
  useEffect(() => {
    if (transitioning) {
      const timer = setTimeout(() => {
        setCurrentIndex((prev) => (prev + direction + featuredCards.length) % featuredCards.length);
        setTransitioning(false);
      }, 500); // CSSのアニメーション時間(0.5s)と一致させる
      return () => clearTimeout(timer);
    }
  }, [transitioning, direction]);

  const nextCard = () => {
    if (transitioning) return;
    setDirection(1);
    setIsAutoPlay(false); // 手動操作したら自動再生を一時停止
    setTransitioning(true);
  };

  const prevCard = () => {
    if (transitioning) return;
    setDirection(-1);
    setIsAutoPlay(false);
    setTransitioning(true);
  };

  const goToCard = (index: number) => {
    if (transitioning || currentIndex === index) return;
    setDirection(index > currentIndex ? 1 : -1);
    setIsAutoPlay(false);
    setTransitioning(true);
  };

  return (
    <div className="relative min-h-screen bg-[#0f0c29] text-white overflow-hidden font-sans selection:bg-purple-500 selection:text-white">
      {/* 背景エフェクト */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] animate-gradient-bg bg-[length:400%_400%]" />
        <ParticleBackground />
      </div>

      {/* メインコンテンツ */}
      <main className="relative z-20 flex-grow flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-32 p-6 min-h-screen">
        {/* 左側：3Dカードカルーセルエリア */}
        <div className="flex flex-col items-center perspective-1000 w-full max-w-[400px] lg:max-w-none">
          {/* カルーセルコンテナ */}
          <div className="relative w-full flex flex-col items-center">
            <div className="mb-6 text-center lg:hidden">
              <span className="px-3 py-1 rounded-full bg-purple-900/50 border border-purple-500/50 text-purple-300 text-xs font-bold tracking-wider mb-2 inline-block shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                PICK UP
              </span>
              <h2 className="text-2xl font-bold text-white drop-shadow-lg h-8">
                {featuredCards[currentIndex]?.name}
              </h2>
            </div>

            {/* カード表示エリア (左右ボタン付き) */}
            <div className="flex items-center justify-center gap-4 sm:gap-8 w-full z-10">
              {/* 前へボタン */}
              <button
                onClick={prevCard}
                className="p-2 rounded-full bg-white/5 hover:bg-white/20 hover:scale-110 transition-all border border-white/10 z-20 disabled:opacity-30 disabled:cursor-not-allowed"
                disabled={transitioning}
                type="button"
              >
                <ChevronLeft className="w-6 h-6 text-gray-300" />
              </button>

              {/* カード配置コンテナ */}
              <div className="relative w-[300px] h-[420px]">
                {/* 浮遊アニメーション用のラッパー */}
                <div className="w-full h-full animate-float">
                  {/* カード展開 */}
                  {featuredCards.map((card, idx) => {
                    // 表示判定ロジック
                    const isCurrent = idx === currentIndex;
                    const prevIndex =
                      (currentIndex - direction + featuredCards.length) % featuredCards.length;
                    const isPrev = idx === prevIndex;

                    // アニメーション中でなく、かつ現在のカードでないならレンダリングしない
                    if (!transitioning && !isCurrent) return null;
                    // アニメーション中は、現在と直前以外レンダリングしない
                    if (transitioning && !isCurrent && !isPrev) return null;

                    // アニメーションクラスの決定
                    let animClass = "";
                    if (transitioning) {
                      if (isCurrent) {
                        animClass =
                          direction === 1 ? "card-anim-enter-right" : "card-anim-enter-left";
                      } else if (isPrev) {
                        animClass =
                          direction === 1 ? "card-anim-exit-left" : "card-anim-exit-right";
                      }
                    } else if (isCurrent) {
                      // 通常時はアニメーションなしで表示
                      animClass = "opacity-100 z-10";
                    }

                    return (
                      <div
                        key={card.id}
                        className={`absolute top-0 left-0 w-full h-full ${animClass}`}
                      >
                        <HoloCard card={card} className="w-full h-full" showCount={false} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 次へボタン */}
              <button
                onClick={nextCard}
                className="p-2 rounded-full bg-white/5 hover:bg-white/20 hover:scale-110 transition-all border border-white/10 z-20 disabled:opacity-30 disabled:cursor-not-allowed"
                disabled={transitioning}
                type="button"
              >
                <ChevronRight className="w-6 h-6 text-gray-300" />
              </button>
            </div>

            {/* インジケーター */}
            <div className="flex gap-2 mt-8 z-20">
              {featuredCards.map((card, idx) => (
                <button
                  key={card.id}
                  onClick={() => goToCard(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? "w-8 bg-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.5)]"
                      : "w-2 bg-white/20 hover:bg-white/40"
                  }`}
                  disabled={transitioning}
                  type="button"
                  aria-label={`${card.name}を表示`}
                />
              ))}
            </div>
          </div>

          <div className="hidden lg:block mt-8 text-center max-w-sm fade-in-up">
            <span className="px-3 py-1 rounded-full bg-purple-900/50 border border-purple-500/50 text-purple-300 text-xs font-bold tracking-wider mb-2 inline-block shadow-[0_0_10px_rgba(168,85,247,0.3)]">
              NEW ARRIVAL
            </span>
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
              新パック「虚空の覇者」登場
            </h2>
            <p className="text-gray-400 text-sm font-light">
              {featuredCards[currentIndex]?.name} などの強力なカードを手に入れよう！
            </p>
          </div>
        </div>

        {/* 右側：メニューアクションエリア */}
        <div className="flex flex-col gap-6 w-full max-w-md">
          {/* 召喚ボタン（メイン） */}
          <MenuButton
            title="召喚 - SUMMON"
            subtitle="新たな力を手に入れろ"
            icon={<Sparkles className="w-8 h-8" />}
            active
            onClick={() => navigate("/packs")}
          />

          {/* ギャラリーボタン */}
          <MenuButton
            title="ギャラリー - GALLERY"
            subtitle="獲得したカードを確認"
            icon={<Layers className="w-8 h-8" />}
            onClick={() => navigate("/gallery")}
          />

          {/* お知らせエリア */}
          <div className="mt-4 p-4 rounded-xl bg-black/40 border border-white/5 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3 text-sm text-gray-300 border-b border-white/5 pb-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="font-bold tracking-wider">ランキングニュース</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs group cursor-pointer">
                <span className="text-gray-400 group-hover:text-white transition-colors">
                  1. 世界大会予選開始！
                </span>
                <ArrowRight className="w-3 h-3 text-gray-600 group-hover:text-purple-400 transition-colors" />
              </div>
              <div className="flex items-center justify-between text-xs group cursor-pointer">
                <span className="text-gray-400 group-hover:text-white transition-colors">
                  2. メンテナンスのお知らせ
                </span>
                <ArrowRight className="w-3 h-3 text-gray-600 group-hover:text-purple-400 transition-colors" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
