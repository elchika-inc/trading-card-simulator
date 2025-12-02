import { ChevronsRight, Hand } from "lucide-react";
import type React from "react";
import { PACK_TYPES } from "@/data/pack-types";

interface PackIdleProps {
  packRef: React.RefObject<HTMLDivElement>;
  gameState: string;
  tearProgress: number;
  packType: string;
  isDragging: React.MutableRefObject<boolean>;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
}

/**
 * パックのコンテンツ部分（画像 or CSS生成）
 */
function PackContent({ packType, className }: { packType: string; className?: string }) {
  const packData = PACK_TYPES.find((p) => p.id === packType) ?? PACK_TYPES[0];
  if (!packData) return null;

  const hasImage = !!packData.image;

  const texts = {
    subTitle: packData.subTitle ?? "Trading Card Game",
    contentsInfo: packData.contentsInfo ?? "1パック / 5枚入り",
  };

  if (hasImage) {
    return (
      <div className={`w-full h-full bg-slate-800 relative ${className}`}>
        <img
          src={packData.image ?? undefined}
          alt={packData.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/30 pointer-events-none mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/60 pointer-events-none" />
      </div>
    );
  }

  // CSS生成モード（PackVisualと同様）
  return (
    <div
      className={`w-full h-full relative bg-gradient-to-br ${packData?.colorFrom ?? ""} ${packData?.colorTo ?? ""} flex flex-col items-center justify-between overflow-hidden ${className ?? ""}`}
    >
      <div className="absolute inset-0 border-t-4 border-b-4 border-gray-200/50 pointer-events-none z-10" />
      <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-gray-300 to-gray-100 opacity-50 z-10" />

      <div className="mt-6 text-white/90 text-sm font-bold tracking-widest uppercase text-center border-b border-white/30 pb-1 z-10 relative px-4">
        {texts.subTitle}
      </div>

      <div className="flex flex-col items-center justify-center flex-1 w-full relative z-10">
        <div className="text-9xl filter drop-shadow-xl transform transition-transform duration-500">
          {packData.icon}
        </div>
        <h3 className="text-white text-3xl font-black text-center mt-4 leading-tight drop-shadow-md px-2">
          {packData.name}
        </h3>
      </div>

      <div className="w-full relative z-10 pb-6 px-6">
        <div className="bg-black/20 rounded-full px-3 py-1">
          <p className="text-white/80 text-xs text-center font-medium">
            {texts.contentsInfo}
          </p>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-gray-300 to-gray-100 opacity-50 z-10" />
      <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-multiply z-0" />

      {/* 共通エフェクト */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none mix-blend-overlay z-20" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none z-20" />
    </div>
  );
}

/**
 * 未開封パック表示コンポーネント
 */
export function PackIdle({
  packRef,
  gameState,
  tearProgress,
  packType,
  isDragging,
  onMouseDown,
  onMouseMove,
  onTouchStart,
  onTouchMove,
}: PackIdleProps) {
  if (!(gameState === "idle" || gameState === "tearing" || gameState === "opening")) {
    return null;
  }

  return (
    <div
      ref={packRef}
      className={`
        relative w-[280px] h-[440px] transition-transform duration-300 ease-out
        ${gameState === "opening" ? "scale-110 opacity-0 duration-1000" : "scale-100 opacity-100"}
        ${tearProgress > 0 ? "scale-[1.02]" : ""}
      `}
      style={{
        transformStyle: "preserve-3d",
        transform: `rotateY(${tearProgress * 10}deg) rotateX(${tearProgress * -5}deg)`,
      }}
    >
      <div
        className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl z-10"
        style={{
          clipPath:
            "polygon(0% 0%, 0% 70px, 10% 60px, 20% 70px, 30% 60px, 40% 70px, 50% 60px, 60% 70px, 70% 60px, 80% 70px, 90% 60px, 100% 70px, 100% 100%, 0% 100%)",
        }}
      >
        <PackContent packType={packType} />
      </div>

      <div
        className="absolute top-0 left-0 right-0 h-[85px] z-20 origin-top-right overflow-hidden rounded-t-2xl"
        style={{
          transform: `
            translateX(${tearProgress * 200}%)
            rotate(${tearProgress * 45}deg)
            translateY(${tearProgress * -50}px)
          `,
          opacity: 1 - tearProgress ** 3,
          transition: isDragging.current ? "none" : "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div className="w-full h-[440px] relative -top-[0px]">
          <PackContent packType={packType} />
        </div>

        {gameState === "idle" && tearProgress < 0.1 && (
          <div className="absolute bottom-4 left-0 right-0 h-[2px] border-b-2 border-dashed border-white/60 opacity-80 z-50 pointer-events-none">
            <div className="absolute inset-0 h-full w-[30%] bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer-fast" />
          </div>
        )}
      </div>

      <div
        className="absolute top-[65px] left-0 h-[20px] bg-white blur-lg transition-all duration-75"
        style={{
          width: `${tearProgress * 150}%`,
          opacity: tearProgress > 0 && tearProgress < 1 ? 0.6 : 0,
          transform: "rotate(-5deg)",
        }}
      />

      <div
        role="button"
        tabIndex={0}
        aria-label="パックを引いて開封する"
        className="absolute top-0 left-0 right-0 h-[120px] z-50 cursor-grab active:cursor-grabbing touch-none flex items-center justify-center"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            // キーボード操作でドラッグ開始をシミュレート
            onMouseDown({ clientX: 0 } as React.MouseEvent);
          }
        }}
      >
        {gameState === "idle" && tearProgress < 0.1 && (
          <div className="absolute top-[35px] w-full flex items-center justify-center pointer-events-none opacity-90">
            <div className="relative w-[60%] h-12 flex items-center justify-center">
              <div className="absolute left-4 flex gap-1 animate-slide-fade">
                <ChevronsRight className="w-8 h-8 text-yellow-300 drop-shadow-md" />
              </div>

              <div className="absolute left-0 animate-swipe-hand">
                <Hand className="w-10 h-10 text-white fill-white/20 drop-shadow-lg rotate-12" />
              </div>
            </div>
          </div>
        )}
      </div>

      {gameState === "opening" && (
        <div className="absolute top-0 left-0 right-0 h-[2px] z-40">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-white blur-[40px] animate-flash" />
        </div>
      )}
    </div>
  );
}
