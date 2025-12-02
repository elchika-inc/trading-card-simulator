import type { Card } from "@repo/types";
import { ArrowLeft, RefreshCcw, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { PageLayout } from "@/components/app/page-layout";
import { cssAnimations } from "./animations";
import { clamp } from "./constants";
import { PackIdle } from "./pack-idle";
import { PackInspecting } from "./pack-inspecting";
import { PackResults } from "./pack-results";

interface PackOpeningProps {
  cards: Card[];
  packType: string;
  backImage?: string | null;
  onReset: () => void;
}

/**
 * パック開封メインコンポーネント
 */
export function PackOpening({ cards, packType, backImage = null, onReset }: PackOpeningProps) {
  const [gameState, setGameState] = useState<
    "idle" | "tearing" | "opening" | "inspecting" | "results"
  >("idle");
  const [tearProgress, setTearProgress] = useState(0);

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const packRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);

  const handleStart = (clientX: number) => {
    if (gameState !== "idle") return;
    isDragging.current = true;
    startX.current = clientX;
  };

  const handleMove = (clientX: number) => {
    if (!isDragging.current || gameState !== "idle") return;

    const sensitivity = 1.5;
    const delta = (clientX - startX.current) * sensitivity;
    const packWidth = packRef.current ? packRef.current.offsetWidth : 300;

    const progress = clamp(delta / packWidth, 0, 1.1);

    setTearProgress(progress);

    if (progress >= 0.85) {
      finishTearing();
    }
  };

  const handleEnd = () => {
    isDragging.current = false;
    if (tearProgress < 0.85) {
      const interval = setInterval(() => {
        setTearProgress((prev) => {
          if (prev <= 0.05) {
            clearInterval(interval);
            return 0;
          }
          return prev * 0.8;
        });
      }, 16);
    }
  };

  const onMouseDown = (e: React.MouseEvent) => handleStart(e.clientX);
  const onMouseMove = (e: React.MouseEvent) => handleMove(e.clientX);
  const onMouseUp = handleEnd;
  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) handleStart(touch.clientX);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) handleMove(touch.clientX);
  };
  const onTouchEnd = handleEnd;

  const finishTearing = () => {
    isDragging.current = false;
    setGameState("opening");

    setTimeout(() => {
      setGameState("inspecting");
      setCurrentCardIndex(0);
      setIsCardFlipped(false);
    }, 1500);
  };

  const handleCardClick = () => {
    if (gameState !== "inspecting" || isTransitioning) return;

    if (!isCardFlipped) {
      setIsCardFlipped(true);
    } else {
      nextCard();
    }
  };

  const nextCard = () => {
    setIsTransitioning(true);

    setTimeout(() => {
      if (currentCardIndex >= cards.length - 1) {
        setGameState("results");
      } else {
        setCurrentCardIndex((prev) => prev + 1);
        setIsCardFlipped(false);
      }
      setIsTransitioning(false);
    }, 300);
  };

  // スキップして結果一覧へ飛ぶ
  const handleSkipToResults = (e: React.MouseEvent) => {
    e.stopPropagation(); // カードクリックイベントの伝播を防止
    setGameState("results");
  };

  const resetGame = () => {
    setGameState("idle");
    setTearProgress(0);
    setCurrentCardIndex(0);
    setIsCardFlipped(false);
    isDragging.current = false;
  };

  const handleReset = () => {
    resetGame();
    onReset();
  };

  return (
    <PageLayout>
      <div
        role="application"
        aria-label="パック開封ゲーム"
        className="min-h-screen flex flex-col items-center justify-center select-none relative"
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchEnd={onTouchEnd}
      >
        {/* グローバルCSSアニメーションを注入 */}
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: CSSアニメーション定義のため必要 */}
        <style dangerouslySetInnerHTML={{ __html: cssAnimations }} />

        {/* 追加の背景エフェクト（パック開封時のフラッシュ） */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/20 rounded-full blur-[120px] transition-all duration-1000 ${
              gameState === "opening" ? "scale-150 bg-white/40" : "scale-100"
            }`}
          />
        </div>

        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50">
          {/* 左側: パック選択に戻るボタン */}
          <button
            onClick={handleReset}
            type="button"
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm"
            title="パック選択に戻る"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-bold">パック選択</span>
          </button>

          {/* 中央: タイトル */}
          <h1 className="absolute left-1/2 -translate-x-1/2 text-white text-xl font-bold tracking-wider opacity-80 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            PACK OPENER
          </h1>

          {/* 右側: リセットボタン */}
          <button
            onClick={handleReset}
            type="button"
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-sm"
            title="リセット"
          >
            <RefreshCcw className="w-5 h-5" />
          </button>
        </div>

        <div className="relative w-full max-w-lg h-[600px] flex items-center justify-center perspective-[1200px]">
          {/* パック表示 (未開封時) */}
          <PackIdle
            packRef={packRef}
            gameState={gameState}
            tearProgress={tearProgress}
            packType={packType}
            isDragging={isDragging}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
          />

          {/* 1枚ずつ確認モード */}
          <PackInspecting
            gameState={gameState}
            cards={cards}
            currentCardIndex={currentCardIndex}
            isCardFlipped={isCardFlipped}
            isTransitioning={isTransitioning}
            backImage={backImage}
            onCardClick={handleCardClick}
            onSkipToResults={handleSkipToResults}
          />

          {/* 結果一覧モード */}
          <PackResults gameState={gameState} cards={cards} onReset={handleReset} />
        </div>
      </div>
    </PageLayout>
  );
}
