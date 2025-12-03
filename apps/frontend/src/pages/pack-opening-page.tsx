import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PackOpening } from "@/components/app/pack-opening";
import { PACK_TYPES } from "@/data/pack-types";
import { getActiveAssetUrl } from "@/lib/api-client";

interface PackAssets {
  pack: { file: string; fallback: string };
  packBack: { file: string; fallback: string };
  cardBack: { file: string; fallback: string };
}

const DEFAULT_ASSETS: PackAssets = {
  pack: {
    file: "/assets/packs/pack.png",
    fallback: "https://placehold.co/400x600/3b82f6/ffffff?text=Pack+Image",
  },
  packBack: {
    file: "/assets/packs/pack-back.png",
    fallback: "https://placehold.co/400x600/1e40af/ffffff?text=Pack+Back",
  },
  cardBack: {
    file: "/assets/card-back.png",
    fallback: "https://placehold.co/300x420/1e293b/64748b?text=Card+Back",
  },
};

/**
 * パック開封演出ページ
 * /packs/:packId/open
 */
export function PackOpeningPage() {
  const { packId } = useParams<{ packId: string }>();
  const navigate = useNavigate();
  const [assets, setAssets] = useState<PackAssets>(DEFAULT_ASSETS);
  const [assetsLoading, setAssetsLoading] = useState(true);

  const packData = PACK_TYPES.find((p) => p.id === packId);

  // アセット取得
  useEffect(() => {
    const loadAssets = async () => {
      setAssetsLoading(true);

      const [cardBackUrl, packFrontUrl, packBackUrl] = await Promise.all([
        getActiveAssetUrl("card-back", { format: "auto" }),
        getActiveAssetUrl("pack-front", { format: "auto" }),
        getActiveAssetUrl("pack-back", { format: "auto" }),
      ]);

      setAssets({
        pack: {
          file: packFrontUrl ?? DEFAULT_ASSETS.pack.file,
          fallback: DEFAULT_ASSETS.pack.fallback,
        },
        packBack: {
          file: packBackUrl ?? DEFAULT_ASSETS.packBack.file,
          fallback: DEFAULT_ASSETS.packBack.fallback,
        },
        cardBack: {
          file: cardBackUrl ?? DEFAULT_ASSETS.cardBack.file,
          fallback: DEFAULT_ASSETS.cardBack.fallback,
        },
      });

      setAssetsLoading(false);
    };

    loadAssets();
  }, []);

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

  // アセット読み込み中はローディング表示
  if (assetsLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">読み込み中...</p>
        </div>
      </div>
    );
  }

  const handleReset = () => {
    navigate("/packs");
  };

  return (
    <PackOpening
      cards={packData.featuredCards}
      packType={packData.id}
      backImage={assets.cardBack.file}
      assets={assets}
      onReset={handleReset}
    />
  );
}
