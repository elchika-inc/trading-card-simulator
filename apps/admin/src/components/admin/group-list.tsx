import type { GachaPack, PackGroup } from "@repo/types";
import { ChevronDown, ChevronUp, Edit2, Eye, EyeOff, Package, Plus, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8787";

interface GroupListProps {
  onEditGroup?: (group: PackGroup) => void;
  onCreateGroup?: () => void;
  refreshTrigger?: number;
}

interface GroupWithPacks extends PackGroup {
  packs: GachaPack[];
}

/**
 * パックグループ一覧コンポーネント（パック割当機能付き）
 */
export function GroupList({ onEditGroup, onCreateGroup, refreshTrigger }: GroupListProps) {
  const [groups, setGroups] = useState<GroupWithPacks[]>([]);
  const [allPacks, setAllPacks] = useState<GachaPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [assigning, setAssigning] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // グループ一覧と全パック一覧を並行取得
      const [groupsResponse, packsResponse] = await Promise.all([
        fetch(`${API_URL}/api/gacha/groups/all`),
        fetch(`${API_URL}/api/gacha/packs`),
      ]);

      if (!groupsResponse.ok) {
        throw new Error("Failed to fetch groups");
      }
      if (!packsResponse.ok) {
        throw new Error("Failed to fetch packs");
      }

      const groupsData = await groupsResponse.json();
      const packsData = await packsResponse.json();

      const fetchedGroups: PackGroup[] = groupsData.groups || [];
      const fetchedPacks: GachaPack[] = packsData.packs || [];

      setAllPacks(fetchedPacks);

      // 各グループにパックを紐付け
      const groupsWithPacks: GroupWithPacks[] = fetchedGroups.map((group) => ({
        ...group,
        packs: fetchedPacks.filter((pack) => pack.groupId === group.id),
      }));

      setGroups(groupsWithPacks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      fetchData();
    }
  }, [refreshTrigger, fetchData]);

  const handleDelete = async (group: PackGroup) => {
    if (
      !confirm(
        `「${group.name}」を削除しますか？\n\n※ このグループに属するパックは「未分類」になります。`,
      )
    ) {
      return;
    }

    setDeleting(group.id);

    try {
      const response = await fetch(`${API_URL}/api/gacha/groups/${group.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete group");
      }

      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete group");
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleActive = async (group: PackGroup) => {
    setToggling(group.id);

    try {
      const response = await fetch(`${API_URL}/api/gacha/groups/${group.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !group.isActive }),
      });

      if (!response.ok) {
        throw new Error("Failed to update group");
      }

      const data = await response.json();
      setGroups((prev) => prev.map((g) => (g.id === group.id ? { ...g, ...data.group } : g)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update group");
    } finally {
      setToggling(null);
    }
  };

  const toggleExpanded = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const handleAssignPack = async (packId: string, groupId: string) => {
    setAssigning(packId);

    try {
      const response = await fetch(`${API_URL}/api/gacha/packs/${packId}/group`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId }),
      });

      if (!response.ok) {
        throw new Error("Failed to assign pack");
      }

      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign pack");
    } finally {
      setAssigning(null);
    }
  };

  const handleRemovePack = async (packId: string) => {
    setAssigning(packId);

    try {
      const response = await fetch(`${API_URL}/api/gacha/packs/${packId}/group`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId: null }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove pack from group");
      }

      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove pack");
    } finally {
      setAssigning(null);
    }
  };

  // 未割り当てのパック
  const unassignedPacks = allPacks.filter((pack) => !pack.groupId);

  return (
    <Card className="bg-transparent border-none shadow-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">パックグループ一覧</CardTitle>
            <CardDescription className="text-white/60">
              パックをグループ化して管理（{groups.length}件）
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchData} variant="outline" size="sm">
              再読み込み
            </Button>
            {onCreateGroup && (
              <Button onClick={onCreateGroup} size="sm">
                <Plus className="w-4 h-4 mr-1" />
                新規作成
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading && <div className="text-sm text-white/60">読み込み中...</div>}

        {error && <div className="text-sm text-red-400">エラー: {error}</div>}

        {!loading && !error && groups.length === 0 && (
          <div className="text-sm text-white/60">グループがありません。新規作成してください。</div>
        )}

        {!loading && !error && groups.length > 0 && (
          <div className="space-y-3">
            {groups.map((group) => {
              const isExpanded = expandedGroups.has(group.id);

              return (
                <div
                  key={group.id}
                  className={`border rounded-lg transition-all ${
                    group.isActive
                      ? "border-white/30 bg-white/10"
                      : "border-white/10 bg-white/5 opacity-60"
                  }`}
                >
                  {/* グループヘッダー */}
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{group.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">{group.name}</span>
                            {group.isActive ? (
                              <Badge
                                variant="outline"
                                className="text-green-400 border-green-400/50"
                              >
                                公開中
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-gray-400 border-gray-400/50">
                                非公開
                              </Badge>
                            )}
                            <Badge variant="secondary" className="text-xs">
                              {group.packs.length}パック
                            </Badge>
                          </div>
                          {group.description && (
                            <p className="text-sm text-white/60 mt-1">{group.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleExpanded(group.id)}
                          title={isExpanded ? "折りたたむ" : "パックを表示"}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleActive(group)}
                          disabled={toggling === group.id}
                          title={group.isActive ? "非公開にする" : "公開する"}
                        >
                          {toggling === group.id ? (
                            "..."
                          ) : group.isActive ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>

                        {onEditGroup && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onEditGroup(group)}
                            title="編集"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(group)}
                          disabled={deleting === group.id}
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                          title="削除"
                        >
                          {deleting === group.id ? "..." : <Trash2 className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    {/* グラデーションプレビュー */}
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs text-white/40">カラー:</span>
                      <div
                        className={`h-4 w-24 rounded bg-gradient-to-r ${group.colorFrom} ${group.colorTo}`}
                      />
                    </div>
                  </div>

                  {/* パック一覧（展開時） */}
                  {isExpanded && (
                    <div className="border-t border-white/10 p-4 bg-black/20">
                      <div className="text-sm text-white/60 mb-3 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        所属パック
                      </div>

                      {/* 現在のパック */}
                      {group.packs.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {group.packs.map((pack) => (
                            <div
                              key={pack.id}
                              className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-sm"
                            >
                              <span>{pack.icon}</span>
                              <span className="text-white">{pack.name}</span>
                              <button
                                onClick={() => handleRemovePack(pack.id)}
                                disabled={assigning === pack.id}
                                className="text-white/40 hover:text-red-400 transition-colors"
                                title="グループから外す"
                                type="button"
                              >
                                {assigning === pack.id ? "..." : <X className="w-3 h-3" />}
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-white/40 mb-4">パックがありません</p>
                      )}

                      {/* 未割り当てパックから追加 */}
                      {unassignedPacks.length > 0 && (
                        <div>
                          <div className="text-xs text-white/40 mb-2">未割り当てパックを追加:</div>
                          <div className="flex flex-wrap gap-2">
                            {unassignedPacks.map((pack) => (
                              <button
                                key={pack.id}
                                onClick={() => handleAssignPack(pack.id, group.id)}
                                disabled={assigning === pack.id}
                                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/15 border border-dashed border-white/20 rounded-full text-sm transition-colors"
                                type="button"
                              >
                                <Plus className="w-3 h-3 text-white/40" />
                                <span>{pack.icon}</span>
                                <span className="text-white/60">{pack.name}</span>
                                {assigning === pack.id && (
                                  <span className="text-white/40">...</span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 未割り当てパック一覧 */}
        {!loading && !error && unassignedPacks.length > 0 && (
          <div className="mt-6 p-4 border border-dashed border-white/20 rounded-lg bg-white/5">
            <div className="text-sm text-white/60 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" />
              未割り当てパック（{unassignedPacks.length}件）
            </div>
            <div className="flex flex-wrap gap-2">
              {unassignedPacks.map((pack) => (
                <div
                  key={pack.id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-sm"
                >
                  <span>{pack.icon}</span>
                  <span className="text-white">{pack.name}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-white/40 mt-3">
              ※ 上記グループを展開して「+」ボタンでパックを追加できます
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
