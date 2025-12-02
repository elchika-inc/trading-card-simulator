import type { ReactNode } from "react";
import { ParticleBackground } from "./particle-background";

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * 共通ページレイアウトコンポーネント
 * 全ページに共通の紫グラデーション背景とパーティクルエフェクトを適用
 */
export function PageLayout({ children, className = "" }: PageLayoutProps) {
  return (
    <div
      className={`relative min-h-screen bg-[#0f0c29] text-white overflow-hidden font-sans selection:bg-purple-500 selection:text-white ${className}`}
    >
      {/* 背景エフェクト */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] animate-gradient-bg bg-[length:400%_400%]" />
        <ParticleBackground />
      </div>

      {/* メインコンテンツ */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
