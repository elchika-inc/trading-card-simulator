import { ChevronsRight, Hand } from "lucide-react";
import type React from "react";
import { FALLBACK_GRADIENT } from "./constants";

interface PackIdleProps {
  packRef: React.RefObject<HTMLDivElement>;
  gameState: string;
  tearProgress: number;
  packImage: string;
  isDragging: React.MutableRefObject<boolean>;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
}

/**
 * 未開封パック表示コンポーネント
 */
export function PackIdle({
  packRef,
  gameState,
  tearProgress,
  packImage,
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
        <div className="w-full h-full bg-slate-800 relative">
          <img
            src={packImage}
            alt="Pack Main"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <div className="absolute inset-0 -z-10" style={{ background: FALLBACK_GRADIENT }} />
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/30 pointer-events-none mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/60 pointer-events-none" />
        </div>
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
          <img
            src={packImage}
            alt="Pack Top"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <div className="absolute inset-0 -z-10" style={{ background: FALLBACK_GRADIENT }} />
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/40 pointer-events-none mix-blend-overlay" />
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
        className="absolute top-0 left-0 right-0 h-[120px] z-50 cursor-grab active:cursor-grabbing touch-none flex items-center justify-center"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
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
