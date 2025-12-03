/**
 * カードギャラリーページ
 * バックエンドからカードデータを取得して表示
 */

import type { Card } from "@repo/types";
import { HoloCard } from "@repo/ui/holo-card";
import { Home, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient, getImageUrl } from "@/lib/api-client";
import { cssKeyframes } from "@/lib/keyframes";
import { PageLayout } from "./page-layout";

export function CardGallery() {
  const navigate = useNavigate();
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // カードデータ取得
  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true);
        const response = await apiClient.api.cards.$get();
        const data = await response.json();

        if ("cards" in data) {
          setCards(data.cards);
        } else {
          setError("カードデータの取得に失敗しました");
        }
      } catch (err) {
        console.error("Error fetching cards:", err);
        setError("カードデータの取得中にエラーが発生しました");
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, []);

  // モーダルを閉じる処理
  const handleCloseModal = () => {
    setSelectedCard(null);
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-400">カードデータを読み込み中...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-red-400">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              再読み込み
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen py-16 px-4 relative">
        {/* グローバルCSSアニメーションを注入 */}
        <style dangerouslySetInnerHTML={{ __html: cssKeyframes }} />

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

        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 space-y-4">
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-purple-200 to-pink-200 pb-2">
              Holographic Card Gallery
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-base">
              Click on a card to inspect it in detail.
            </p>
            <div className="text-sm text-gray-500">Total Cards: {cards.length}</div>
          </div>

          {/* グリッドレイアウト */}
          <div className="flex flex-wrap justify-center gap-8 perspective-origin-center">
            {cards.map((card) => (
              <HoloCard
                key={card.id}
                card={card}
                imageUrl={getImageUrl(card.image, { format: "webp" })}
                onClick={() => setSelectedCard(card)}
                className="w-[260px] h-[400px]"
              />
            ))}
          </div>

          <div className="mt-20 text-center text-xs text-gray-700">
            <p>Powered by React, Hono RPC, Tailwind CSS & CSS Blend Modes.</p>
          </div>
        </div>

        {/* モーダルオーバーレイ */}
        {selectedCard && (
          <div
            role="button"
            tabIndex={0}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity duration-300"
            onClick={handleCloseModal}
            onKeyDown={(e) => {
              if (e.key === "Escape" || e.key === "Enter") {
                handleCloseModal();
              }
            }}
          >
            <div role="presentation" className="relative" onClick={(e) => e.stopPropagation()}>
              {/* 閉じるボタン */}
              <button
                type="button"
                onClick={handleCloseModal}
                className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={24} />
              </button>

              {/* 拡大表示されたカード */}
              <HoloCard
                card={selectedCard}
                imageUrl={getImageUrl(selectedCard.image, { format: "webp" })}
                className="w-[320px] h-[480px] sm:w-[400px] sm:h-[600px]"
              />
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
