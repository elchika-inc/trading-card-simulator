import type { GachaPackWithAssets } from "@repo/types";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PackOpening } from "@/components/app/pack-opening";
import { getActiveAssetUrl, getGachaPack } from "@/lib/api-client";

/**
 * パック開封演出ページ
 * /packs/:packId/open
 */
export function PackOpeningPage() {
  const { packId } = useParams<{ packId: string }>();
  const navigate = useNavigate();
  const [packData, setPackData] = useState<GachaPackWithAssets | null>(null);
  const [cardBackUrl, setCardBackUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // パックデータとアセットを取得
  useEffect(() => {
    const loadData = async () => {
      if (!packId) return;

      setLoading(true);

      // パックデータとカード裏面画像を並列で取得
      // パック画像はパックごとに異なるため、packData.frontImageUrl / backImageUrl を使用
      const [pack, cardBack] = await Promise.all([
        getGachaPack(packId),
        getActiveAssetUrl("card-back", { format: "auto" }),
      ]);

      setPackData(pack);
      setCardBackUrl(cardBack);

      setLoading(false);
    };

    loadData();
  }, [packId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!packData) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
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
    );
  }

  const handleReset = () => {
    navigate("/packs");
  };

  return (
    <PackOpening
      cards={packData.featuredCards || []}
      packData={packData}
      backImage={cardBackUrl}
      packFrontUrl={packData.frontImageUrl}
      packBackUrl={packData.backImageUrl}
      cardBackUrl={cardBackUrl}
      onReset={handleReset}
    />
  );
}
