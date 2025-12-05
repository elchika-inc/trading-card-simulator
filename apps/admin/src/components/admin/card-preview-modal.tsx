import type { Card } from "@repo/types";
import { HoloCard } from "@repo/ui/holo-card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CardPreviewModalProps {
  card: Card | null;
  imageUrl?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * カードプレビューモーダル
 * フルサイズのホロカードを表示
 */
export function CardPreviewModal({ card, imageUrl, open, onOpenChange }: CardPreviewModalProps) {
  if (!card) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-zinc-900 border-zinc-700">
        <DialogHeader>
          <DialogTitle className="text-white">{card.name}</DialogTitle>
        </DialogHeader>

        <div className="flex justify-center py-4">
          <div className="w-64 h-96">
            <HoloCard card={card} showCount={false} imageUrl={imageUrl} className="w-full h-full" />
          </div>
        </div>

        <div className="text-sm text-white/60 space-y-1">
          <div>レアリティ: {card.rarity}</div>
          <div>ホロタイプ: {card.holoType}</div>
          <div>テキストスタイル: {card.textStyle}</div>
          {card.description && <div className="mt-2">{card.description}</div>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
