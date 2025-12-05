import type { Card, GachaPackWithAssets } from "@repo/types";
import { ArrowLeft, RefreshCcw, Sparkles } from "lucide-react";
import { useState } from "react";
import { PageLayout } from "@/components/app/page-layout";
import { cssAnimations } from "./animations";
import { PackExperience } from "./pack-experience";
import { PackInspecting } from "./pack-inspecting";
import { PackResults } from "./pack-results";

/**
 * PackExperienceが期待するアセット形式
 * file: 実際の画像URL
 * fallback: fileが読み込めない場合のフォールバック画像URL
 */
interface PackExperienceAssets {
  pack: { file: string; fallback: string };
  packBack: { file: string; fallback: string };
  cardBack: { file: string; fallback: string };
}

interface PackOpeningProps {
  cards: Card[];
  packData: GachaPackWithAssets;
  backImage?: string | null;
  packFrontUrl?: string | null;
  packBackUrl?: string | null;
  cardBackUrl?: string | null;
  onReset: () => void;
}

/**
 * デフォルトのプレースホルダー画像（CSSで生成されたデザインの代わりに使用）
 * 実際には透明な1x1画像などを使用することも可能
 */
const DEFAULT_PLACEHOLDER = "/assets/placeholder-pack.png";
const DEFAULT_CARD_BACK_PLACEHOLDER = "/assets/placeholder-card-back.png";

/**
 * アセットURLをPackExperience用の形式に変換
 */
function buildPackExperienceAssets(
  packFrontUrl: string | null | undefined,
  packBackUrl: string | null | undefined,
  cardBackUrl: string | null | undefined,
): PackExperienceAssets {
  return {
    pack: {
      file: packFrontUrl || DEFAULT_PLACEHOLDER,
      fallback: DEFAULT_PLACEHOLDER,
    },
    packBack: {
      file: packBackUrl || DEFAULT_PLACEHOLDER,
      fallback: DEFAULT_PLACEHOLDER,
    },
    cardBack: {
      file: cardBackUrl || DEFAULT_CARD_BACK_PLACEHOLDER,
      fallback: DEFAULT_CARD_BACK_PLACEHOLDER,
    },
  };
}

/**
 * パック開封メインコンポーネント
 * Three.js体験（パック選択→開封）+ 既存カードめくりUI + 結果表示
 */
export function PackOpening({
  cards,
  packData,
  backImage = null,
  packFrontUrl = null,
  packBackUrl = null,
  cardBackUrl = null,
  onReset,
}: PackOpeningProps) {
  const [gameState, setGameState] = useState<"experience" | "inspecting" | "results">("experience");

  // PackExperience用のアセット形式に変換
  const experienceAssets = buildPackExperienceAssets(packFrontUrl, packBackUrl, cardBackUrl);

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Three.js体験が完了したらカードめくりモードへ
  const handleCardsReady = () => {
    setGameState("inspecting");
    setCurrentCardIndex(0);
    setIsCardFlipped(false);
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
    e.stopPropagation();
    setGameState("results");
  };

  const resetGame = () => {
    setGameState("experience");
    setCurrentCardIndex(0);
    setIsCardFlipped(false);
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
      >
        {/* グローバルCSSアニメーションを注入 */}
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: CSSアニメーション定義のため必要 */}
        <style dangerouslySetInnerHTML={{ __html: cssAnimations }} />

        {/* ヘッダー（inspecting/results時のみ表示） */}
        {gameState !== "experience" && (
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
        )}

        {/* Three.js体験（パック選択→開封） */}
        {gameState === "experience" && (
          <div className="w-full h-screen">
            <PackExperience
              cards={cards}
              assets={experienceAssets}
              onCardsReady={handleCardsReady}
            />
          </div>
        )}

        {/* カードめくり・結果表示エリア */}
        {gameState !== "experience" && (
          <div className="relative w-full max-w-lg h-[600px] flex items-center justify-center perspective-[1200px]">
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
        )}
      </div>
    </PageLayout>
  );
}
