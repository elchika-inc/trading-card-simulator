import type { Card, CardCreateRequest, CardUpdateRequest } from "@repo/types";
import { Plus } from "lucide-react";
import { useState } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { type CardFormData, CardFormModal } from "@/components/admin/card-form-modal";
import { CardList } from "@/components/admin/card-list";
import { Button } from "@/components/ui/button";

/**
 * カード管理ページ
 */
export function CardsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingCard, setEditingCard] = useState<Card | null>(null);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleOpenCreateModal = () => {
    setModalMode("create");
    setEditingCard(null);
    setModalOpen(true);
  };

  const handleEditCard = (card: Card) => {
    setModalMode("edit");
    setEditingCard(card);
    setModalOpen(true);
  };

  const handleSubmit = async (data: CardFormData) => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8787";

    // packAssignments を API 用の形式に変換
    const packAssignments =
      data.packAssignments.length > 0
        ? data.packAssignments.map((a) => ({
            packId: a.packId,
            weight: a.weight,
            isPickup: a.isPickup ?? false,
          }))
        : undefined;

    if (modalMode === "create") {
      const request: CardCreateRequest = {
        name: data.name,
        holoType: data.holoType,
        textStyle: data.textStyle,
        imageId: data.imageId,
        description: data.description,
        iconName: data.iconName,
        rarity: data.rarity,
        packAssignments,
      };

      const response = await fetch(`${apiUrl}/api/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`カード作成に失敗しました: ${errorText}`);
      }
    } else if (editingCard) {
      const request: CardUpdateRequest = {
        name: data.name,
        holoType: data.holoType,
        textStyle: data.textStyle,
        imageId: data.imageId,
        description: data.description,
        iconName: data.iconName,
        rarity: data.rarity,
        packAssignments,
      };

      const response = await fetch(`${apiUrl}/api/cards/${editingCard.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`カード更新に失敗しました: ${errorText}`);
      }
    }

    handleRefresh();
  };

  return (
    <AdminLayout
      title="カード管理"
      description="カードの作成と一覧表示"
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
      <CardList refreshTrigger={refreshTrigger} onEditCard={handleEditCard} />

      {/* カード作成・編集モーダル */}
      <CardFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        initialData={editingCard ?? undefined}
        onSubmit={handleSubmit}
      />
    </AdminLayout>
  );
}
