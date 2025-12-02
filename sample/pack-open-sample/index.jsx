import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Settings, RefreshCcw } from 'lucide-react';
import { clamp, DEFAULT_PACK_IMAGE, DEFAULT_BACK_IMAGE } from './utils/constants';
import { DEFAULT_CARDS } from './data/default-cards';
import { cssAnimations } from './styles/animations';
import { SettingsModal } from './components/SettingsModal';
import { PackIdle } from './components/PackIdle';
import { PackInspecting } from './components/PackInspecting';
import { PackResults } from './components/PackResults';

// ==========================================
// Main Entry Point
// ==========================================

/**
 * メインエントリーポイント
 * カードパックオープニングアプリケーション
 */
export default function CardPackApp() {
  const [gameState, setGameState] = useState('idle');
  const [tearProgress, setTearProgress] = useState(0);

  const [packImage, setPackImage] = useState(DEFAULT_PACK_IMAGE);
  const [backImage, setBackImage] = useState(DEFAULT_BACK_IMAGE);
  const [cards, setCards] = useState(DEFAULT_CARDS);

  const [showSettings, setShowSettings] = useState(false);

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [tempPackUrl, setTempPackUrl] = useState(DEFAULT_PACK_IMAGE);
  const [tempBackUrl, setTempBackUrl] = useState('');
  const [tempCardsJson, setTempCardsJson] = useState('');
  const [jsonError, setJsonError] = useState(null);

  useEffect(() => {
    if (showSettings) {
      setTempPackUrl(packImage);
      setTempBackUrl(backImage || '');
      setTempCardsJson(JSON.stringify(cards, null, 2));
      setJsonError(null);
    }
  }, [showSettings, packImage, backImage, cards]);

  const packRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);

  const handleStart = (clientX) => {
    if (gameState !== 'idle') return;
    isDragging.current = true;
    startX.current = clientX;
  };

  const handleMove = (clientX) => {
    if (!isDragging.current || gameState !== 'idle') return;

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

  const onMouseDown = (e) => handleStart(e.clientX);
  const onMouseMove = (e) => handleMove(e.clientX);
  const onMouseUp = handleEnd;
  const onTouchStart = (e) => handleStart(e.touches[0].clientX);
  const onTouchMove = (e) => handleMove(e.touches[0].clientX);
  const onTouchEnd = handleEnd;

  const finishTearing = () => {
    isDragging.current = false;
    setGameState('opening');

    setTimeout(() => {
      setGameState('inspecting');
      setCurrentCardIndex(0);
      setIsCardFlipped(false);
    }, 1500);
  };

  const handleCardClick = () => {
    if (gameState !== 'inspecting' || isTransitioning) return;

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
        setGameState('results');
      } else {
        setCurrentCardIndex(prev => prev + 1);
        setIsCardFlipped(false);
      }
      setIsTransitioning(false);
    }, 300);
  };

  // スキップして結果一覧へ飛ぶ
  const handleSkipToResults = (e) => {
    e.stopPropagation(); // カードクリックイベントの伝播を防止
    setGameState('results');
  };

  const resetGame = () => {
    setGameState('idle');
    setTearProgress(0);
    setCurrentCardIndex(0);
    setIsCardFlipped(false);
    isDragging.current = false;
  };

  const handleSaveSettings = () => {
    try {
      const parsedCards = JSON.parse(tempCardsJson);
      if (!Array.isArray(parsedCards) || parsedCards.length === 0) {
        throw new Error("Card data must be an array with at least one card.");
      }

      setPackImage(tempPackUrl);
      setBackImage(tempBackUrl || null);
      setCards(parsedCards);
      setShowSettings(false);
    } catch (e) {
      setJsonError(e.message);
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-900 flex flex-col items-center justify-center overflow-hidden font-sans select-none relative"
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchEnd={onTouchEnd}
    >
      {/* グローバルCSSアニメーションを注入 */}
      <style dangerouslySetInnerHTML={{ __html: cssAnimations }} />

      {/* 背景エフェクト */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/20 rounded-full blur-[120px] transition-all duration-1000 ${gameState === 'opening' ? 'scale-150 bg-white/40' : 'scale-100'}`} />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      </div>

      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50">
        <h1 className="text-white text-xl font-bold tracking-wider opacity-80 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          PACK OPENER
        </h1>
        <div className="flex gap-4">
          <button
            onClick={resetGame}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-sm"
            title="Reset Pack"
          >
            <RefreshCcw className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-sm"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <SettingsModal
        showSettings={showSettings}
        onClose={() => setShowSettings(false)}
        tempPackUrl={tempPackUrl}
        setTempPackUrl={setTempPackUrl}
        tempBackUrl={tempBackUrl}
        setTempBackUrl={setTempBackUrl}
        tempCardsJson={tempCardsJson}
        setTempCardsJson={setTempCardsJson}
        jsonError={jsonError}
        onSave={handleSaveSettings}
      />

      <div className="relative w-full max-w-lg h-[600px] flex items-center justify-center perspective-[1200px]">
        {/* --- パック表示 (未開封時) --- */}
        <PackIdle
          packRef={packRef}
          gameState={gameState}
          tearProgress={tearProgress}
          packImage={packImage}
          isDragging={isDragging}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
        />

        {/* --- 1枚ずつ確認モード --- */}
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

        {/* --- 結果一覧モード (2行表示・全身表示) --- */}
        <PackResults
          gameState={gameState}
          cards={cards}
          onReset={resetGame}
        />
      </div>
    </div>
  );
}
