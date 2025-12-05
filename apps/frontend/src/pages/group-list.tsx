import type { PackGroup } from "@repo/types";
import { Home, Loader2, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CoinDisplay } from "@/components/app/pack-select/coin-display";
import { PageLayout } from "@/components/app/page-layout";
import { useUser } from "@/contexts/user-context";
import { getPackGroups } from "@/lib/api-client";

/**
 * グループ選択ページ
 * /groups
 */
export function GroupList() {
  const navigate = useNavigate();
  const { coins } = useUser();
  const [groups, setGroups] = useState<PackGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // グループ一覧を取得
  useEffect(() => {
    getPackGroups().then((data) => {
      setGroups(data);
      setLoading(false);
    });
  }, []);

  const handleGroupSelect = (groupId: string) => {
    navigate(`/groups/${groupId}`);
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
        </div>
      </PageLayout>
    );
  }

  if (groups.length === 0) {
    return (
      <PageLayout>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <Package className="w-16 h-16 text-zinc-600" />
          <p className="text-zinc-400">現在利用可能なパックグループがありません</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            type="button"
          >
            トップに戻る
          </button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <CoinDisplay amount={coins} />

      <div className="min-h-screen flex flex-col items-center select-none relative px-4 py-8">
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

        {/* ヘッダー */}
        <header className="mt-16 mb-12 text-center space-y-3">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
            シリーズを選択
          </h1>
          <p className="text-zinc-500 text-sm">パックシリーズを選んでください</p>
        </header>

        {/* グループ一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {groups.map((group, index) => (
            <button
              key={group.id}
              type="button"
              onClick={() => handleGroupSelect(group.id)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="relative group overflow-hidden rounded-2xl border border-white/10 transition-all duration-300 hover:scale-[1.02] hover:border-white/30 active:scale-[0.98]"
            >
              {/* グラデーション背景 */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${group.colorFrom} ${group.colorTo} opacity-20 group-hover:opacity-40 transition-opacity`}
              />

              {/* ホバー時のグロー効果 */}
              {hoveredIndex === index && (
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${group.colorFrom} ${group.colorTo} opacity-30 blur-xl`}
                />
              )}

              {/* コンテンツ */}
              <div className="relative p-8 flex flex-col items-center gap-4">
                <span className="text-5xl">{group.icon}</span>
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-bold text-white">{group.name}</h2>
                  {group.description && (
                    <p className="text-sm text-zinc-400">{group.description}</p>
                  )}
                </div>

                {/* 矢印 */}
                <div className="mt-2 text-white/60 group-hover:text-white transition-colors">
                  <svg
                    className="w-6 h-6 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* 全パック表示リンク */}
        <div className="mt-12">
          <button
            type="button"
            onClick={() => navigate("/packs")}
            className="text-zinc-400 hover:text-white transition-colors text-sm underline underline-offset-4"
          >
            すべてのパックを表示
          </button>
        </div>
      </div>
    </PageLayout>
  );
}
