import type { ReactNode } from "react";

interface CardBackPreviewProps {
  /** カード背面の画像URL */
  imageUrl?: string;
  /** サイズクラス（Tailwind） */
  className?: string;
  /** 子要素（オーバーレイ用） */
  children?: ReactNode;
}

/**
 * カード背面プレビューコンポーネント
 * 画像がない場合はCSSフォールバックを表示
 */
export function CardBackPreview({
  imageUrl,
  className = "w-40 h-56",
  children,
}: CardBackPreviewProps) {
  return (
    <div
      className={`relative rounded-xl overflow-hidden shadow-lg border-2 border-slate-600 ${className}`}
    >
      {imageUrl ? (
        <img src={imageUrl} alt="Card Back" className="w-full h-full object-cover" />
      ) : (
        /* CSSフォールバック: グラデーション + パターン */
        <div className="w-full h-full bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 relative">
          <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.05)_10px,rgba(255,255,255,0.05)_20px)]" />
          <div className="absolute inset-3 border-2 border-slate-600/50 rounded-lg" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-white/10" />
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
