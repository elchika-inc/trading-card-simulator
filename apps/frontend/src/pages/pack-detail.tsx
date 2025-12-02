import type { Card } from "@repo/types";
import { ArrowLeft, Coins, RefreshCw, Sparkles } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { HoloCard } from "@/components/app/holo-card";
import { CardDetailModal } from "@/components/app/pack-select/card-detail-modal";
import { CardSlideshow } from "@/components/app/pack-select/card-slideshow";
import { CoinDisplay } from "@/components/app/pack-select/coin-display";
import { PackVisual } from "@/components/app/pack-select/pack-visual";
import { PageLayout } from "@/components/app/page-layout";
import { useUser } from "@/contexts/user-context";
import { PACK_TYPES } from "@/data/pack-types";

/**
 * パック詳細・プレビューページ
 * /packs/:packId
 */
export function PackDetail() {
  const { packId } = useParams<{ packId: string }>();
  const navigate = useNavigate();
  const { coins, deductCoins, canAfford } = useUser();
  const [isRotating, setIsRotating] = useState(false);
  const [selectedCardForModal, setSelectedCardForModal] = useState<Card | null>(null);

  const packData = PACK_TYPES.find((p) => p.id === packId);

  if (!packData) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-red-400">パックが見つかりません</p>
            <button
              type="button"
              onClick={() => navigate("/packs")}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              パック一覧に戻る
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  const affordable = canAfford(packData.price);

  const handleOpenPack = () => {
    if (deductCoins(packData.price)) {
      navigate(`/packs/${packId}/open`);
    } else {
      alert("コインが足りません！");
    }
  };

  return (
    <PageLayout>
      <CoinDisplay amount={coins} />

      {selectedCardForModal && (
        <CardDetailModal
          card={selectedCardForModal}
          onClose={() => setSelectedCardForModal(null)}
          CardComponent={HoloCard}
        />
      )}

      <div className="min-h-screen flex flex-col items-center justify-center relative">
        {/* ヘッダー */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
          <button
            onClick={() => navigate("/packs")}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors bg-black/30 px-4 py-2 rounded-full backdrop-blur-md border border-white/10"
            type="button"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-bold">他のパックを選ぶ</span>
          </button>
        </div>

        {/* メインエリア */}
        <div
          className="flex flex-col items-center z-10 w-full max-w-6xl px-4"
          style={{ animation: "fadeIn 0.5s ease-out" }}
        >
          {/* タイトル & コイン判定 */}
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-bold text-white mb-2 text-shadow-lg drop-shadow-md">
              {packData.name}
            </h2>
            {affordable ? (
              <p className="text-zinc-200 text-sm drop-shadow-md">このパックを開封しますか？</p>
            ) : (
              <p className="text-red-400 text-sm font-bold drop-shadow-md">コインが足りません！</p>
            )}
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-20">
            {/* 左側: 注目カードスライドショー */}
            <div>
              <CardSlideshow
                cards={packData.featuredCards || []}
                CardComponent={HoloCard}
                onCardClick={(card) => setSelectedCardForModal(card)}
              />
            </div>

            {/* 右側: パック本体 */}
            {/* biome-ignore lint/a11y/useSemanticElements: 3D変換のためdiv要素を使用 */}
            <div
              role="button"
              tabIndex={0}
              className="cursor-pointer perspective-container group"
              onClick={() => setIsRotating(!isRotating)}
              onKeyDown={(e) => e.key === "Enter" && setIsRotating(!isRotating)}
            >
              <PackVisual
                type={packData.id}
                isSelected={true}
                showBack={isRotating}
                isHovered={false}
              />
              <div
                className={`absolute top-full left-0 right-0 h-20 transform scale-y-[-1] opacity-20 pointer-events-none reflection-mask transition-opacity duration-300 ${
                  isRotating ? "opacity-5" : "opacity-20"
                }`}
              >
                <PackVisual
                  type={packData.id}
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
              disabled={!affordable}
              className={`
                h-16 px-12 rounded-full font-black tracking-widest text-lg flex items-center gap-3 transition-all z-20
                ${
                  affordable
                    ? "bg-white text-black hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                    : "bg-zinc-800 text-zinc-500 cursor-not-allowed grayscale"
                }
              `}
              type="button"
            >
              {affordable ? (
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
                    affordable
                      ? "bg-black/10 border-black/10"
                      : "bg-red-900/30 border-red-900/50 text-red-500"
                  }
                `}
              >
                <Coins size={14} className={affordable ? "text-yellow-600 fill-yellow-600" : ""} />
                {packData.price}
              </div>
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
