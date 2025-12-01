import type { Card } from "@repo/types";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Coins,
  Layers,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { PACK_TYPES } from "@/data/pack-types";
import { HoloCard } from "../holo-card";
import { PackOpening } from "../pack-opening";
import { CardDetailModal } from "./card-detail-modal";
import { CardSlideshow } from "./card-slideshow";
import { CoinDisplay } from "./coin-display";
import { PackVisual } from "./pack-visual";

type ViewType = "select-type" | "preview" | "pack-opening";

/**
 * パック選択・開封メインコンポーネント
 */
export function PackSelect() {
  const [view, setView] = useState<ViewType>("select-type");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isRotating, setIsRotating] = useState(false);
  const [myCoins, setMyCoins] = useState(500);

  // モーダル用のステート
  const [selectedCardForModal, setSelectedCardForModal] = useState<Card | null>(null);

  // カルーセル用状態: 初期は真ん中の要素(index: 1)を選択
  const [activeIndex, setActiveIndex] = useState(1);

  // パック選択時の処理
  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
    setIsRotating(false);
    setView("preview");
  };

  // カルーセル操作: 前へ
  const prevPack = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : PACK_TYPES.length - 1));
  };

  // カルーセル操作: 次へ
  const nextPack = () => {
    setActiveIndex((prev) => (prev < PACK_TYPES.length - 1 ? prev + 1 : 0));
  };

  // 開封演出へ & コイン消費
  const handleOpenPack = () => {
    const pack = PACK_TYPES.find((p) => p.id === selectedType);
    if (!pack) return;

    if (myCoins >= pack.price) {
      setMyCoins((prev) => prev - pack.price);
      setView("pack-opening");
    } else {
      alert("コインが足りません！");
    }
  };

  const reset = () => {
    setView("select-type");
    setSelectedType(null);
    setIsRotating(false);
  };

  const backToTypeSelect = () => {
    setView("select-type");
    setIsRotating(false);
  };

  return (
    <>
      {/* 常時表示するコイン残高 */}
      <CoinDisplay amount={myCoins} />

      {/* カード詳細モーダル */}
      {selectedCardForModal && (
        <CardDetailModal
          card={selectedCardForModal}
          onClose={() => setSelectedCardForModal(null)}
          CardComponent={HoloCard}
        />
      )}

      {/* ---------------------------------------------------------------------------
          View 1: 3Dカルーセル選択画面 (Cover Flow / Flip 3D style)
         --------------------------------------------------------------------------- */}
      {view === "select-type" && (
        <div className="min-h-screen bg-zinc-900 text-white flex flex-col items-center justify-center font-sans select-none overflow-hidden relative">
          {/* 背景の装飾 */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-900 to-black z-0" />

          <header
            className="absolute top-12 left-0 right-0 text-center space-y-3 z-20"
            style={{ animation: "fadeIn 0.5s ease-out" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 text-xs font-medium border border-zinc-700">
              <Layers size={14} />
              <span>Expansion Set Vol.1</span>
            </div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              パックを選択
            </h1>
            <p className="text-zinc-500 text-sm">左右にスワイプまたはクリックして選択</p>
          </header>

          {/* 3D Carousel Area */}
          <div className="relative w-full h-[600px] flex items-center justify-center perspective-container z-10">
            {PACK_TYPES.map((pack, index) => {
              // 現在のアクティブ要素との距離
              const offset = index - activeIndex;
              const isActive = offset === 0;
              const canAfford = myCoins >= pack.price;

              // 3D変換の計算
              const translateX = offset * 240;
              const translateZ = Math.abs(offset) * -200;
              const rotateY = offset * -45;
              const zIndex = 100 - Math.abs(offset);

              return (
                <div
                  key={pack.id}
                  onClick={() => {
                    if (isActive) {
                      handleTypeSelect(pack.id);
                    } else {
                      setActiveIndex(index);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (isActive) {
                        handleTypeSelect(pack.id);
                      } else {
                        setActiveIndex(index);
                      }
                    }
                  }}
                  className="absolute top-1/2 left-1/2 transform-style-3d cursor-pointer transition-all duration-500 ease-out"
                  style={{
                    width: "16rem", // w-64
                    height: "24rem", // h-96
                    marginTop: "-12rem", // height/2
                    marginLeft: "-8rem", // width/2
                    zIndex: zIndex,
                    transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg)`,
                  }}
                >
                  {/* パック本体 */}
                  <div className="relative group transform-style-3d">
                    {/* 光る背景エフェクト (アクティブ時のみ) */}
                    {isActive && (
                      <div
                        className={`absolute inset-0 -inset-y-4 opacity-50 blur-2xl rounded-full bg-gradient-to-t ${pack.colorFrom} ${pack.colorTo} animate-pulse`}
                      />
                    )}

                    <PackVisual type={pack.id} isHovered={isActive} isSelected={isActive} />

                    {/* 非アクティブ時の暗転用オーバーレイ */}
                    <div
                      className="absolute inset-0 bg-black transition-opacity duration-500 rounded-xl z-50 pointer-events-none"
                      style={{ opacity: isActive ? 0 : 0.6 }}
                    />

                    {/* 鏡面反射 (Reflection) */}
                    <div className="absolute top-full left-0 right-0 h-full transform scale-y-[-1] opacity-30 pointer-events-none reflection-mask mt-2">
                      <PackVisual type={pack.id} isHovered={false} isSelected={false} />
                      {/* 反射にも暗転を適用 */}
                      <div
                        className="absolute inset-0 bg-black transition-opacity duration-500 rounded-xl z-50"
                        style={{ opacity: isActive ? 0 : 0.6 }}
                      />
                    </div>
                  </div>

                  {/* 情報オーバーレイ (アクティブ時のみ表示) */}
                  <div
                    className={`absolute -bottom-24 left-1/2 -translate-x-1/2 w-80 text-center transition-all duration-300 ${
                      isActive
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4 pointer-events-none"
                    }`}
                  >
                    <div className="flex justify-center mb-2">
                      <div
                        className={`inline-flex items-center gap-1 px-4 py-1.5 rounded-full ${
                          canAfford
                            ? "bg-zinc-800 text-yellow-400 border-zinc-700"
                            : "bg-red-900/50 text-red-400 border-red-800"
                        } border shadow-lg`}
                      >
                        <Coins size={16} className={canAfford ? "fill-yellow-400/20" : ""} />
                        <span className="font-bold font-mono text-lg">{pack.price}</span>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-400">{pack.description}</p>

                    <div className="mt-4">
                      <span className="text-xs font-bold bg-white text-black px-4 py-1.5 rounded-full hover:bg-gray-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                        詳細を見る
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="absolute bottom-10 flex gap-8 z-20">
            <button
              onClick={prevPack}
              className="p-4 rounded-full bg-zinc-800/50 hover:bg-zinc-700 text-white border border-zinc-600 backdrop-blur-sm transition-all hover:scale-110 active:scale-95"
              type="button"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextPack}
              className="p-4 rounded-full bg-zinc-800/50 hover:bg-zinc-700 text-white border border-zinc-600 backdrop-blur-sm transition-all hover:scale-110 active:scale-95"
              type="button"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------------
          View 2: 単体パック確認 & 開封 (Preview)
         --------------------------------------------------------------------------- */}
      {view === "preview" &&
        (() => {
          const currentPackData = PACK_TYPES.find((p) => p.id === selectedType);
          if (!currentPackData) return null;

          const canAfford = myCoins >= currentPackData.price;

          return (
            <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center relative overflow-hidden font-sans">
              {/* 背景装飾 */}
              <div
                className={`absolute inset-0 bg-gradient-to-b ${currentPackData.colorFrom} to-zinc-950 opacity-20 z-0`}
              />

              {/* ヘッダー */}
              <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
                <button
                  onClick={backToTypeSelect}
                  className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors bg-black/30 px-4 py-2 rounded-full backdrop-blur-md border border-white/10"
                  type="button"
                >
                  <ArrowLeft size={20} />
                  <span className="text-sm font-bold">他のパックを選ぶ</span>
                </button>
              </div>

              {/* メインエリア (Flex Layoutに変更) */}
              <div
                className="flex flex-col items-center z-10 w-full max-w-6xl px-4"
                style={{ animation: "fadeIn 0.5s ease-out" }}
              >
                {/* タイトル & コイン判定 */}
                <div className="mb-6 text-center">
                  <h2 className="text-3xl font-bold text-white mb-2 text-shadow-lg drop-shadow-md">
                    {currentPackData.name}
                  </h2>
                  {canAfford ? (
                    <p className="text-zinc-200 text-sm drop-shadow-md">
                      このパックを開封しますか？
                    </p>
                  ) : (
                    <p className="text-red-400 text-sm font-bold drop-shadow-md">
                      コインが足りません！
                    </p>
                  )}
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-20">
                  {/* 左側: 注目カードスライドショー (Featured Cards) */}
                  <div>
                    <CardSlideshow
                      cards={currentPackData.featuredCards || []}
                      CardComponent={HoloCard}
                      onCardClick={(card) => setSelectedCardForModal(card)}
                    />
                  </div>

                  {/* 右側: パック本体 */}
                  <div
                    className="cursor-pointer perspective-container group"
                    onClick={() => setIsRotating(!isRotating)}
                    onKeyDown={(e) => e.key === "Enter" && setIsRotating(!isRotating)}
                  >
                    <PackVisual
                      type={selectedType}
                      isSelected={true}
                      showBack={isRotating}
                      isHovered={false}
                    />
                    {/* 簡易的な反射 */}
                    <div
                      className={`absolute top-full left-0 right-0 h-20 transform scale-y-[-1] opacity-20 pointer-events-none reflection-mask transition-opacity duration-300 ${
                        isRotating ? "opacity-5" : "opacity-20"
                      }`}
                    >
                      <PackVisual
                        type={selectedType}
                        isSelected={false}
                        showBack={false}
                        isHovered={false}
                      />
                    </div>

                    <div className="mt-8 text-center text-xs text-zinc-400 flex items-center justify-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full px-3 py-1 backdrop-blur-sm border border-white/10">
                      <RefreshCw size={12} />
                      <span>タップして裏面を確認</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-4 mt-10">
                  {/* 開封ボタン */}
                  <button
                    onClick={handleOpenPack}
                    disabled={!canAfford}
                    className={`
                          h-16 px-12 rounded-full font-black tracking-widest text-lg flex items-center gap-3 transition-all z-20
                          ${
                            canAfford
                              ? "bg-white text-black hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                              : "bg-zinc-800 text-zinc-500 cursor-not-allowed grayscale"
                          }
                        `}
                    type="button"
                  >
                    {canAfford ? (
                      <>
                        <Sparkles size={24} className="text-yellow-500 fill-yellow-500" />
                        <span>開封する</span>
                      </>
                    ) : (
                      <span>コイン不足</span>
                    )}

                    <div
                      className={`ml-2 px-3 py-1 rounded-full text-sm font-mono flex items-center gap-1 border
                          ${
                            canAfford
                              ? "bg-black/10 border-black/10"
                              : "bg-red-900/30 border-red-900/50 text-red-500"
                          }
                        `}
                    >
                      <Coins
                        size={14}
                        className={canAfford ? "text-yellow-600 fill-yellow-600" : ""}
                      />
                      {currentPackData.price}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      {/* ---------------------------------------------------------------------------
          View 3: パック開封画面
         --------------------------------------------------------------------------- */}
      {view === "pack-opening" &&
        (() => {
          const currentPackData = PACK_TYPES.find((p) => p.id === selectedType);
          if (!currentPackData) return null;

          return (
            <PackOpening
              cards={currentPackData.featuredCards}
              packImage={currentPackData.image || ""}
              backImage={null}
              onReset={reset}
            />
          );
        })()}
    </>
  );
}
