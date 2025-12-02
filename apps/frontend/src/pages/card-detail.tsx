import type { Card } from "@repo/types";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { HoloCard } from "@/components/app/holo-card";
import { PageLayout } from "@/components/app/page-layout";
import { apiClient } from "@/lib/api-client";
import { cssKeyframes } from "@/lib/keyframes";

/**
 * カード詳細ページ
 * /cards/:cardId
 */
export function CardDetail() {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCard = async () => {
      if (!cardId) {
        setError("カードIDが指定されていません");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiClient.api.cards[":id"].$get({
          param: { id: cardId },
        });
        const data = await response.json();

        if ("card" in data) {
          setCard(data.card);
        } else {
          setError("カードが見つかりません");
        }
      } catch (err) {
        console.error("Error fetching card:", err);
        setError("カードの取得中にエラーが発生しました");
      } finally {
        setLoading(false);
      }
    };

    fetchCard();
  }, [cardId]);

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-400">カードを読み込み中...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !card) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-red-400">{error || "カードが見つかりません"}</p>
            <button
              type="button"
              onClick={() => navigate("/gallery")}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              ギャラリーに戻る
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen py-16 px-4">
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: CSSアニメーション定義のため必要 */}
        <style dangerouslySetInnerHTML={{ __html: cssKeyframes }} />

        <div className="max-w-4xl mx-auto">
          {/* ヘッダー */}
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors bg-black/30 px-4 py-2 rounded-full backdrop-blur-md border border-white/10"
              type="button"
            >
              <ArrowLeft size={20} />
              <span className="text-sm font-bold">戻る</span>
            </button>
          </div>

          {/* カード表示エリア */}
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12">
            {/* カード */}
            <div className="flex-shrink-0">
              <HoloCard card={card} className="w-[320px] h-[480px] sm:w-[400px] sm:h-[600px]" />
            </div>

            {/* カード情報 */}
            <div className="flex-1 space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-purple-200 to-pink-200 mb-2">
                  {card.name}
                </h1>
                <p className="text-gray-400 text-sm">{card.type}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
                    説明
                  </h3>
                  <p className="text-gray-300">{card.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
                      レアリティ
                    </h3>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                        card.rarity === "hot"
                          ? "bg-red-500/20 text-red-400"
                          : card.rarity === "cute"
                            ? "bg-pink-500/20 text-pink-400"
                            : card.rarity === "cool"
                              ? "bg-blue-500/20 text-blue-400"
                              : card.rarity === "dark"
                                ? "bg-purple-500/20 text-purple-400"
                                : "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {card.rarity.toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
                      所持数
                    </h3>
                    <span className="text-2xl font-bold text-yellow-400">{card.count}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
                      ホロタイプ
                    </h3>
                    <span className="text-gray-300">{card.holoType}</span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
                      テキストスタイル
                    </h3>
                    <span className="text-gray-300">{card.textStyle}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
