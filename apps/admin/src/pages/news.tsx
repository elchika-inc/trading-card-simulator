import type { News, NewsCreateRequest, NewsUpdateRequest } from "@repo/types";
import { Plus } from "lucide-react";
import { useState } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { type NewsFormData, NewsFormModal } from "@/components/admin/news-form-modal";
import { NewsList } from "@/components/admin/news-list";
import { Button } from "@/components/ui/button";

/**
 * News管理ページ
 */
export function NewsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingNews, setEditingNews] = useState<News | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8787";

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleOpenCreateModal = () => {
    setModalMode("create");
    setEditingNews(null);
    setModalOpen(true);
  };

  const handleEditNews = (news: News) => {
    setModalMode("edit");
    setEditingNews(news);
    setModalOpen(true);
  };

  const handleSubmit = async (data: NewsFormData) => {
    if (modalMode === "create") {
      const request: NewsCreateRequest = {
        title: data.title,
        subtitle: data.subtitle,
        badgeText: data.badgeText,
        packId: data.packId,
        bannerAssetId: data.bannerAssetId,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
        cardIds: data.cardIds,
      };

      const response = await fetch(`${apiUrl}/api/news`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`News作成に失敗しました: ${errorText}`);
      }
    } else if (editingNews) {
      const request: NewsUpdateRequest = {
        title: data.title,
        subtitle: data.subtitle,
        badgeText: data.badgeText,
        packId: data.packId,
        bannerAssetId: data.bannerAssetId,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
        cardIds: data.cardIds,
      };

      const response = await fetch(`${apiUrl}/api/news/${editingNews.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`News更新に失敗しました: ${errorText}`);
      }
    }

    handleRefresh();
  };

  return (
    <AdminLayout
      title="News管理"
      description="ランディングページのカルーセルに表示されるNewsを管理します"
      headerActions={
        <Button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4" />
          新規作成
        </Button>
      }
    >
      <NewsList refreshTrigger={refreshTrigger} onEditNews={handleEditNews} />

      {/* News作成・編集モーダル */}
      <NewsFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        initialData={editingNews ?? undefined}
        onSubmit={handleSubmit}
      />
    </AdminLayout>
  );
}
