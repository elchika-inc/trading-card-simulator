import type { BackgroundPresetId, Card, GachaPackWithAssets, NewsWithDetails } from "@repo/types";
import { BACKGROUND_PRESETS } from "@repo/ui/background-presets";
import { HoloCard } from "@repo/ui/holo-card";
import { PackVisual } from "@repo/ui/pack-visual";
import { ParticleBackground } from "@repo/ui/particle-background";
import { ArrowRight, ChevronLeft, ChevronRight, Layers, Sparkles, Trophy } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getActiveNewsWithDetails, getImageUrl } from "@/lib/api-client";
import { MenuButton } from "./menu-button";

// カルーセルアイテムの型定義
type CarouselItem = { type: "card"; data: Card } | { type: "pack"; data: GachaPackWithAssets };

/**
 * ランディングページコンポーネント
 * News APIからデータを取得してカルーセル表示
 */
export function Landing() {
  const navigate = useNavigate();

  // News関連の状態
  const [newsList, setNewsList] = useState<NewsWithDetails[]>([]);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(true);

  // 背景設定
  const [preset, setPreset] = useState<BackgroundPresetId>("purple-cosmos");

  // 現在のNews
  const currentNews = newsList[currentNewsIndex];

  // カードとパックを統合したカルーセルアイテム配列
  const carouselItems: CarouselItem[] = useMemo(() => {
    if (!currentNews) return [];

    const items: CarouselItem[] = [];

    // カードを追加
    for (const card of currentNews.cards) {
      items.push({ type: "card", data: card });
    }

    // パックを追加
    for (const pack of currentNews.packs) {
      items.push({ type: "pack", data: pack });
    }

    return items;
  }, [currentNews]);

  const currentItem = carouselItems[currentItemIndex];

  // 設定とNewsを取得
  const fetchData = useCallback(async () => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8787";

    try {
      // 設定を取得
      const settingsRes = await fetch(`${apiUrl}/api/settings`);
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setPreset(data.settings.backgroundPresetId);
      }
    } catch {
      // 設定取得に失敗してもデフォルトで動作
    }

    try {
      // News一覧を取得（カード詳細含む）
      const news = await getActiveNewsWithDetails();
      setNewsList(news);
    } catch {
      // News取得に失敗しても空配列で動作
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 画像の事前読み込み
  useEffect(() => {
    if (newsList.length === 0) return;

    newsList.forEach((news) => {
      // カード画像の事前読み込み
      news.cards.forEach((card) => {
        if (card.image) {
          const img = new Image();
          img.src = getImageUrl(card.image, { format: "webp" });
        }
      });
      // パック画像の事前読み込み
      news.packs.forEach((pack) => {
        if (pack.frontImageUrl) {
          const frontImg = new Image();
          frontImg.src = pack.frontImageUrl;
        }
        if (pack.backImageUrl) {
          const backImg = new Image();
          backImg.src = pack.backImageUrl;
        }
      });
    });
  }, [newsList]);

  // 自動スライドショー（アイテム切り替え）
  useEffect(() => {
    if (!isAutoPlay || carouselItems.length === 0) return;

    const interval = setInterval(() => {
      if (!transitioning) {
        setDirection(1);
        setTransitioning(true);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlay, transitioning, carouselItems.length]);

  // アニメーション制御
  useEffect(() => {
    if (transitioning && carouselItems.length > 0) {
      const timer = setTimeout(() => {
        setCurrentItemIndex(
          (prev) => (prev + direction + carouselItems.length) % carouselItems.length,
        );
        setTransitioning(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [transitioning, direction, carouselItems.length]);

  // News切り替え時にアイテムインデックスをリセット
  // biome-ignore lint/correctness/useExhaustiveDependencies: currentNewsIndex変更時のみ実行
  useEffect(() => {
    setCurrentItemIndex(0);
    setTransitioning(false);
  }, [currentNewsIndex]);

  const nextItem = () => {
    if (transitioning || carouselItems.length === 0) return;
    setDirection(1);
    setIsAutoPlay(false);
    setTransitioning(true);
  };

  const prevItem = () => {
    if (transitioning || carouselItems.length === 0) return;
    setDirection(-1);
    setIsAutoPlay(false);
    setTransitioning(true);
  };

  const goToItem = (index: number) => {
    if (transitioning || currentItemIndex === index) return;
    setDirection(index > currentItemIndex ? 1 : -1);
    setIsAutoPlay(false);
    setTransitioning(true);
  };

  const nextNews = () => {
    if (newsList.length <= 1) return;
    setCurrentNewsIndex((prev) => (prev + 1) % newsList.length);
  };

  const prevNews = () => {
    if (newsList.length <= 1) return;
    setCurrentNewsIndex((prev) => (prev - 1 + newsList.length) % newsList.length);
  };

  const backgroundColors = BACKGROUND_PRESETS[preset].colors;

  // ローディング中の表示
  if (loading) {
    return (
      <div
        className="relative min-h-screen text-white overflow-hidden flex items-center justify-center"
        style={{ backgroundColor: backgroundColors.from }}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
      </div>
    );
  }

  // Newsがない場合
  if (newsList.length === 0) {
    return (
      <div
        className="relative min-h-screen text-white overflow-hidden"
        style={{ backgroundColor: backgroundColors.from }}
      >
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 animate-gradient-bg bg-[length:400%_400%]"
            style={{
              background: `linear-gradient(to bottom right, ${backgroundColors.from}, ${backgroundColors.via}, ${backgroundColors.to})`,
              backgroundSize: "400% 400%",
            }}
          />
          <ParticleBackground />
        </div>
        <main className="relative z-20 flex-grow flex flex-col items-center justify-center gap-12 p-6 min-h-screen">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Trading Card Simulator</h1>
            <p className="text-white/60">カードを集めて最強のデッキを作ろう！</p>
          </div>
          <div className="flex flex-col gap-6 w-full max-w-md">
            <MenuButton
              title="召喚 - SUMMON"
              subtitle="新たな力を手に入れろ"
              icon={<Sparkles className="w-8 h-8" />}
              active
              onClick={() => navigate("/groups")}
            />
            <MenuButton
              title="ギャラリー - GALLERY"
              subtitle="獲得したカードを確認"
              icon={<Layers className="w-8 h-8" />}
              onClick={() => navigate("/gallery")}
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen text-white overflow-hidden font-sans selection:bg-purple-500 selection:text-white"
      style={{ backgroundColor: backgroundColors.from }}
    >
      {/* 背景エフェクト */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 animate-gradient-bg bg-[length:400%_400%]"
          style={{
            background: `linear-gradient(to bottom right, ${backgroundColors.from}, ${backgroundColors.via}, ${backgroundColors.to})`,
            backgroundSize: "400% 400%",
          }}
        />
        <ParticleBackground />
      </div>

      {/* メインコンテンツ */}
      <main className="relative z-20 flex-grow flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-32 p-6 min-h-screen">
        {/* 左側：カードカルーセルエリア */}
        <div className="flex flex-col items-center perspective-1000 w-full max-w-[400px] lg:max-w-none">
          {/* Newsセレクター（複数Newsがある場合） */}
          {newsList.length > 1 && (
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={prevNews}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                type="button"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-white/60">
                News {currentNewsIndex + 1} / {newsList.length}
              </span>
              <button
                onClick={nextNews}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                type="button"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* カルーセルコンテナ */}
          <div className="relative w-full flex flex-col items-center">
            <div className="mb-6 text-center lg:hidden">
              <span className="px-3 py-1 rounded-full bg-purple-900/50 border border-purple-500/50 text-purple-300 text-xs font-bold tracking-wider mb-2 inline-block shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                {currentNews?.badgeText || "PICK UP"}
              </span>
              <h2 className="text-2xl font-bold text-white drop-shadow-lg h-8">
                {currentItem?.type === "card"
                  ? currentItem.data.name
                  : currentItem?.data.name || ""}
              </h2>
            </div>

            {/* カード・パック表示エリア (左右ボタン付き) */}
            <div className="flex items-center justify-center gap-4 sm:gap-8 w-full z-10">
              {/* 前へボタン */}
              <button
                onClick={prevItem}
                className="p-2 rounded-full bg-white/5 hover:bg-white/20 hover:scale-110 transition-all border border-white/10 z-20 disabled:opacity-30 disabled:cursor-not-allowed"
                disabled={transitioning || carouselItems.length <= 1}
                type="button"
              >
                <ChevronLeft className="w-6 h-6 text-gray-300" />
              </button>

              {/* カード・パック配置コンテナ */}
              <div className="relative w-[300px] h-[420px]">
                <div className="w-full h-full animate-float">
                  {carouselItems.map((item, idx) => {
                    const isCurrent = idx === currentItemIndex;
                    const prevIndex =
                      (currentItemIndex - direction + carouselItems.length) % carouselItems.length;
                    const isPrev = idx === prevIndex;

                    const shouldHide = !transitioning && !isCurrent;
                    const shouldHideInTransition = transitioning && !isCurrent && !isPrev;

                    let animClass = "";
                    if (shouldHide || shouldHideInTransition) {
                      animClass = "opacity-0 pointer-events-none";
                    } else if (transitioning) {
                      if (isCurrent) {
                        animClass =
                          direction === 1 ? "card-anim-enter-right" : "card-anim-enter-left";
                      } else if (isPrev) {
                        animClass =
                          direction === 1 ? "card-anim-exit-left" : "card-anim-exit-right";
                      }
                    } else if (isCurrent) {
                      animClass = "opacity-100 z-10";
                    }

                    const itemKey =
                      item.type === "card" ? `card-${item.data.id}` : `pack-${item.data.id}`;

                    return (
                      <div
                        key={itemKey}
                        className={`absolute top-0 left-0 w-full h-full ${animClass}`}
                      >
                        {item.type === "card" ? (
                          <HoloCard
                            card={item.data}
                            imageUrl={getImageUrl(item.data.image, { format: "webp" })}
                            className="w-full h-full"
                            showCount={false}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <PackVisual
                              frontImageUrl={item.data.frontImageUrl}
                              backImageUrl={item.data.backImageUrl}
                              icon={item.data.icon}
                              name={item.data.name}
                              className="w-[260px] h-[364px]"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 次へボタン */}
              <button
                onClick={nextItem}
                className="p-2 rounded-full bg-white/5 hover:bg-white/20 hover:scale-110 transition-all border border-white/10 z-20 disabled:opacity-30 disabled:cursor-not-allowed"
                disabled={transitioning || carouselItems.length <= 1}
                type="button"
              >
                <ChevronRight className="w-6 h-6 text-gray-300" />
              </button>
            </div>

            {/* インジケーター */}
            {carouselItems.length > 1 && (
              <div className="flex gap-2 mt-8 z-20">
                {carouselItems.map((item, idx) => {
                  const itemKey =
                    item.type === "card" ? `ind-card-${item.data.id}` : `ind-pack-${item.data.id}`;
                  const itemName = item.type === "card" ? item.data.name : item.data.name;
                  return (
                    <button
                      key={itemKey}
                      onClick={() => goToItem(idx)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        idx === currentItemIndex
                          ? "w-8 bg-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.5)]"
                          : "w-2 bg-white/20 hover:bg-white/40"
                      }`}
                      disabled={transitioning}
                      type="button"
                      aria-label={`${itemName}を表示`}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* News情報表示（デスクトップ） */}
          <div className="hidden lg:block mt-8 text-center max-w-sm fade-in-up">
            <span className="px-3 py-1 rounded-full bg-purple-900/50 border border-purple-500/50 text-purple-300 text-xs font-bold tracking-wider mb-2 inline-block shadow-[0_0_10px_rgba(168,85,247,0.3)]">
              {currentNews?.badgeText || "NEW ARRIVAL"}
            </span>
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
              {currentNews?.title || "Trading Card Simulator"}
            </h2>
            <p className="text-gray-400 text-sm font-light">
              {currentNews?.subtitle || `${currentItem?.data.name || ""} などを手に入れよう！`}
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
            onClick={() => navigate("/groups")}
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
