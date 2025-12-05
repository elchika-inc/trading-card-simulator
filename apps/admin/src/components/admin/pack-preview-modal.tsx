import type { AssetMetadata } from "@repo/types";
import { PackVisual } from "@repo/ui/pack-visual";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PackPair {
  packSetId: string;
  front: AssetMetadata | null;
  back: AssetMetadata | null;
  uploadedAt: string;
}

interface PackPreviewModalProps {
  pack: PackPair | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * パックプレビューモーダル
 * 表面・裏面をフルサイズで表示
 */
export function PackPreviewModal({ pack, open, onOpenChange }: PackPreviewModalProps) {
  if (!pack) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-zinc-900 border-zinc-700">
        <DialogHeader>
          <DialogTitle className="text-white">パックプレビュー</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-8 py-4">
          {/* 表面 */}
          <div className="space-y-2">
            <div className="text-sm text-white/60 text-center">表面</div>
            <div className="flex justify-center">
              <PackVisual frontImageUrl={pack.front?.url} className="w-48 h-[17rem]" />
            </div>
            {pack.front && (
              <div className="text-xs text-white/40 text-center truncate">
                {pack.front.originalName}
              </div>
            )}
          </div>

          {/* 裏面 */}
          <div className="space-y-2">
            <div className="text-sm text-white/60 text-center">裏面</div>
            <div className="flex justify-center">
              <PackVisual frontImageUrl={pack.back?.url} className="w-48 h-[17rem]" />
            </div>
            {pack.back && (
              <div className="text-xs text-white/40 text-center truncate">
                {pack.back.originalName}
              </div>
            )}
          </div>
        </div>

        <div className="text-sm text-white/60">
          アップロード: {new Date(pack.uploadedAt).toLocaleString("ja-JP")}
        </div>
      </DialogContent>
    </Dialog>
  );
}
