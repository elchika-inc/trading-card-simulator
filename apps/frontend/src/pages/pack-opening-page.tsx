import { useNavigate, useParams } from "react-router-dom";
import { PackOpening } from "@/components/app/pack-opening";
import { PACK_TYPES } from "@/data/pack-types";

/**
 * パック開封演出ページ
 * /packs/:packId/open
 */
export function PackOpeningPage() {
  const { packId } = useParams<{ packId: string }>();
  const navigate = useNavigate();

  const packData = PACK_TYPES.find((p) => p.id === packId);

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
      cards={packData.featuredCards}
      packImage={packData.image || ""}
      backImage={null}
      onReset={handleReset}
    />
  );
}
