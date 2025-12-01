import { RefreshCw } from "lucide-react";
import React from "react";
import { PACK_TYPES } from "@/data/pack-types";

interface PackVisualProps {
  type: string;
  isHovered?: boolean;
  isSelected?: boolean;
  showBack?: boolean;
}

/**
 * パックの見た目を描画するコンポーネント
 */
export const PackVisual = React.memo<PackVisualProps>(
  ({ type, isHovered = false, isSelected = false, showBack = false }) => {
    const packData = PACK_TYPES.find((p) => p.id === type) || PACK_TYPES[0];
    const hasImage = !!packData.image;

    const texts = {
      subTitle: packData.subTitle || "Trading Card Game",
      contentsInfo: packData.contentsInfo || "1パック / 5枚入り",
      backTitle: packData.backTitle || "PACK INFO",
      featureTitle: packData.featureTitle || "Pickup Feature",
    };

    return (
      <div
        className={`relative w-64 h-96 transition-all duration-500 transform-style-3d ${
          showBack ? "rotate-y-180" : ""
        }`}
      >
        {/* 表面 */}
        <div
          className={`absolute inset-0 w-full h-full rounded-xl shadow-2xl backface-hidden
          ${!hasImage ? `bg-gradient-to-br ${packData.colorFrom} ${packData.colorTo}` : "bg-zinc-800"}
          flex flex-col items-center justify-between overflow-hidden
          transition-transform duration-300
          ${isHovered ? "brightness-110" : ""}
        `}
          style={{
            boxShadow: isSelected
              ? "0 0 40px rgba(255, 255, 255, 0.4)"
              : "0 20px 30px rgba(0,0,0,0.5)",
            zIndex: 2,
          }}
        >
          {/* --- 画像表示モード --- */}
          {hasImage && (
            <img
              src={packData.image}
              alt={packData.name}
              className="absolute inset-0 w-full h-full object-cover z-0"
            />
          )}

          {/* --- CSS生成モード --- */}
          {!hasImage && (
            <>
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
            </>
          )}

          {/* --- 共通エフェクト --- */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none mix-blend-overlay z-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none z-20" />
        </div>

        {/* 裏面 */}
        <div
          className="absolute inset-0 w-full h-full rounded-xl shadow-xl backface-hidden rotate-y-180 bg-zinc-800 border-2 border-zinc-700 flex flex-col items-center justify-center p-8 text-center"
          style={{ zIndex: 1 }}
        >
          <div className="text-zinc-500 mb-4">
            <RefreshCw className="w-10 h-10 mx-auto" />
          </div>
          <h4 className="text-white font-bold mb-2">{texts.backTitle}</h4>
          <p className="text-zinc-400 text-sm leading-relaxed mb-4">{packData.description}</p>
          <div className="w-full p-3 bg-zinc-900/50 rounded-lg border border-zinc-700">
            <p className="text-xs text-zinc-500 uppercase mb-1">{texts.featureTitle}</p>
            <p className="text-yellow-500 font-bold">{packData.rareRate}</p>
          </div>
          <div className="mt-6 w-full h-1 bg-zinc-700 rounded-full overflow-hidden">
            <div className={`h-full w-2/3 ${packData.accentColor}`} />
          </div>
        </div>
      </div>
    );
  },
);

PackVisual.displayName = "PackVisual";
