import type { News } from "@repo/types";
import { Edit2, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface NewsListProps {
  refreshTrigger: number;
  onEditNews: (news: News) => void;
}

/**
 * News一覧コンポーネント
 */
export function NewsList({ refreshTrigger, onEditNews }: NewsListProps) {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8787";

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/api/news/admin`);
      if (!response.ok) {
        throw new Error("News一覧の取得に失敗しました");
      }
      const data = await response.json();
      setNewsList(data.newsList || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleDelete = async (newsId: string) => {
    if (!confirm("このNewsを削除しますか？")) return;

    try {
      const response = await fetch(`${apiUrl}/api/news/${newsId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("削除に失敗しました");
      }
      fetchNews();
    } catch (err) {
      alert(err instanceof Error ? err.message : "削除エラー");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{error}</p>
        <Button onClick={fetchNews} variant="outline">
          再試行
        </Button>
      </div>
    );
  }

  if (newsList.length === 0) {
    return (
      <div className="text-center py-12 text-white/60">
        <p>Newsがありません</p>
        <p className="text-sm mt-2">「新規作成」ボタンからNewsを追加してください</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {newsList.map((news) => (
        <div key={news.id} className="bg-white/10 border border-white/20 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant="outline"
                  className="bg-purple-600/20 border-purple-400 text-purple-300"
                >
                  {news.badgeText}
                </Badge>
                {!news.isActive && (
                  <Badge variant="outline" className="bg-gray-600/20 border-gray-400 text-gray-300">
                    非公開
                  </Badge>
                )}
                <span className="text-white/40 text-sm">順序: {news.sortOrder}</span>
              </div>
              <h3 className="text-lg font-semibold text-white">{news.title}</h3>
              {news.subtitle && <p className="text-white/60 mt-1">{news.subtitle}</p>}
              <div className="flex gap-4 mt-2 text-sm text-white/40">
                <span>カード数: {news.cardIds.length}</span>
                <span>パック数: {news.packIds.length}</span>
                {news.bannerAssetId && <span>バナー: あり</span>}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="bg-blue-600/20 border-blue-400 hover:bg-blue-600/40"
                onClick={() => onEditNews(news)}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="bg-red-600/20 border-red-400 hover:bg-red-600/40"
                onClick={() => handleDelete(news.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
