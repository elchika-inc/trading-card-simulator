import { ChevronLeft, ChevronRight, Coins, Home, Layers } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CoinDisplay } from "@/components/app/pack-select/coin-display";
import { PackVisual } from "@/components/app/pack-select/pack-visual";
import { PageLayout } from "@/components/app/page-layout";
import { useUser } from "@/contexts/user-context";
import { PACK_TYPES } from "@/data/pack-types";

/**
 * パック一覧・選択ページ
 * /packs
 */
export function PackList() {
  const navigate = useNavigate();
  const { coins } = useUser();
  const [activeIndex, setActiveIndex] = useState(1);

  const prevPack = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : PACK_TYPES.length - 1));
  };

  const nextPack = () => {
    setActiveIndex((prev) => (prev < PACK_TYPES.length - 1 ? prev + 1 : 0));
  };

  const handlePackSelect = (packId: string) => {
    navigate(`/packs/${packId}`);
  };

  return (
    <PageLayout>
      <CoinDisplay amount={coins} />

      <div className="min-h-screen flex flex-col items-center justify-center select-none relative">
        {/* トップページに戻るボタン */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-start items-center z-20">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors bg-black/30 px-4 py-2 rounded-full backdrop-blur-md border border-white/10"
            type="button"
          >
            <Home size={20} />
            <span className="text-sm font-bold">トップに戻る</span>
          </button>
        </div>

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
            const offset = index - activeIndex;
            const isActive = offset === 0;
            const canAfford = coins >= pack.price;

            const translateX = offset * 240;
            const translateZ = Math.abs(offset) * -200;
            const rotateY = offset * -45;
            const zIndex = 100 - Math.abs(offset);

            return (
              // biome-ignore lint/a11y/useSemanticElements: 3D変換のためdiv要素を使用
              <div
                key={pack.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  if (isActive) {
                    handlePackSelect(pack.id);
                  } else {
                    setActiveIndex(index);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (isActive) {
                      handlePackSelect(pack.id);
                    } else {
                      setActiveIndex(index);
                    }
                  }
                }}
                className="absolute top-1/2 left-1/2 transform-style-3d cursor-pointer transition-all duration-500 ease-out"
                style={{
                  width: "16rem",
                  height: "24rem",
                  marginTop: "-12rem",
                  marginLeft: "-8rem",
                  zIndex: zIndex,
                  transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg)`,
                }}
              >
                <div className="relative group transform-style-3d">
                  {isActive && (
                    <div
                      className={`absolute inset-0 -inset-y-4 opacity-50 blur-2xl rounded-full bg-gradient-to-t ${pack.colorFrom} ${pack.colorTo} animate-pulse`}
                    />
                  )}

                  <PackVisual type={pack.id} isHovered={isActive} isSelected={isActive} />

                  <div
                    className="absolute inset-0 bg-black transition-opacity duration-500 rounded-xl z-50 pointer-events-none"
                    style={{ opacity: isActive ? 0 : 0.6 }}
                  />

                  <div className="absolute top-full left-0 right-0 h-full transform scale-y-[-1] opacity-30 pointer-events-none reflection-mask mt-2">
                    <PackVisual type={pack.id} isHovered={false} isSelected={false} />
                    <div
                      className="absolute inset-0 bg-black transition-opacity duration-500 rounded-xl z-50"
                      style={{ opacity: isActive ? 0 : 0.6 }}
                    />
                  </div>
                </div>

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
    </PageLayout>
  );
}
