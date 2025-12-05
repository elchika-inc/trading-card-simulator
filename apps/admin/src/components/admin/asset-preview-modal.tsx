import type { AssetMetadata, AssetType } from "@repo/types";
import { CardBackPreview } from "@repo/ui/card-back-preview";
import { HoloCard } from "@repo/ui/holo-card";
import { PackVisual } from "@repo/ui/pack-visual";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AssetPreviewModalProps {
  asset: AssetMetadata | null;
  assetType: AssetType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * アセットプレビューモーダル
 * フルサイズの画像を表示
 */
export function AssetPreviewModal({
  asset,
  assetType,
  open,
  onOpenChange,
}: AssetPreviewModalProps) {
  if (!asset) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-zinc-900 border-zinc-700">
        <DialogHeader>
          <DialogTitle className="text-white">{asset.originalName}</DialogTitle>
        </DialogHeader>

        <div className="flex justify-center py-4">
          {assetType === "card" ? (
            <div className="w-64 h-96">
              <HoloCard
                card={{
                  id: 0,
                  count: 1,
                  name: asset.originalName.replace(/\.[^/.]+$/, ""),
                  type: "",
                  holoType: "basic",
                  textStyle: "default",
                  image: "",
                  description: "",
                  iconName: "Sparkles",
                  rarity: "cool",
                }}
                showCount={false}
                imageUrl={asset.url}
                className="w-full h-full"
              />
            </div>
          ) : assetType === "card-back" ? (
            <CardBackPreview imageUrl={asset.url} className="w-64 h-[22rem]" />
          ) : assetType === "pack-front" || assetType === "pack-back" ? (
            <PackVisual frontImageUrl={asset.url} className="w-64 h-[22rem]" />
          ) : (
            <img
              src={asset.url}
              alt={asset.originalName}
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
          )}
        </div>

        <div className="text-sm text-white/60 space-y-1">
          <div>サイズ: {(asset.size / 1024).toFixed(1)} KB</div>
          <div>アップロード: {new Date(asset.uploadedAt).toLocaleString("ja-JP")}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
