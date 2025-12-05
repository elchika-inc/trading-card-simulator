import type { PackGroup } from "@repo/types";
import { Layers, Package } from "lucide-react";
import { useState } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { GachaPackManager } from "@/components/admin/gacha-pack-manager";
import { GroupFormModal } from "@/components/admin/group-form-modal";
import { GroupList } from "@/components/admin/group-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * ガチャ管理ページ（統合）
 * グループとパックをタブ切り替えで管理
 */
export function GachaManagementPage() {
  const [activeTab, setActiveTab] = useState("groups");

  // グループモーダル用の状態
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<PackGroup | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateGroup = () => {
    setEditingGroup(null);
    setModalOpen(true);
  };

  const handleEditGroup = (group: PackGroup) => {
    setEditingGroup(group);
    setModalOpen(true);
  };

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <AdminLayout title="ガチャ管理" description="グループとパックを管理します">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            グループ
          </TabsTrigger>
          <TabsTrigger value="packs" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            パック
          </TabsTrigger>
        </TabsList>

        <TabsContent value="groups">
          <div className="max-w-4xl mx-auto">
            <GroupList
              onCreateGroup={handleCreateGroup}
              onEditGroup={handleEditGroup}
              refreshTrigger={refreshTrigger}
            />
          </div>
        </TabsContent>

        <TabsContent value="packs">
          <GachaPackManager />
        </TabsContent>
      </Tabs>

      <GroupFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        editingGroup={editingGroup}
        onSuccess={handleSuccess}
      />
    </AdminLayout>
  );
}
