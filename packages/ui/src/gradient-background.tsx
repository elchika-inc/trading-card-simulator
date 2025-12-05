import type { BackgroundPresetId } from "@repo/types";
import type { ReactNode } from "react";
import { BACKGROUND_PRESETS, DEFAULT_BACKGROUND_PRESET_ID } from "./background-presets";
import { ParticleBackground } from "./particle-background";

interface GradientBackgroundProps {
  children: ReactNode;
  /** 背景プリセットID */
  preset?: BackgroundPresetId;
  /** パーティクルエフェクトの表示を上書き（undefined時はプリセットに従う） */
  showParticles?: boolean;
  /** アニメーションの有効化を上書き（undefined時はプリセットに従う） */
  animate?: boolean;
  /** 追加のクラス名 */
  className?: string;
}

/**
 * グラデーション背景コンポーネント
 *
 * frontendとadminで共有する背景レイヤー
 * プリセットを指定することで背景のスタイルを切り替え可能
 */
export function GradientBackground({
  children,
  preset = DEFAULT_BACKGROUND_PRESET_ID,
  showParticles,
  animate,
  className = "",
}: GradientBackgroundProps) {
  const config = BACKGROUND_PRESETS[preset];

  // プロパティで上書き可能、なければプリセットの値を使用
  const shouldShowParticles = showParticles ?? config.showParticles;
  const shouldAnimate = animate ?? config.animate;

  // インラインスタイルでグラデーションを適用
  const gradientStyle = {
    background: `linear-gradient(to bottom right, ${config.colors.from}, ${config.colors.via}, ${config.colors.to})`,
    backgroundSize: shouldAnimate ? "400% 400%" : "100% 100%",
  };

  return (
    <div
      className={`relative min-h-screen text-white overflow-hidden ${className}`}
      style={{ backgroundColor: config.colors.from }}
    >
      {/* 背景エフェクト層 */}
      <div className="absolute inset-0 z-0">
        {/* グラデーション背景 */}
        <div
          className={`absolute inset-0 ${shouldAnimate ? "animate-gradient-bg" : ""}`}
          style={gradientStyle}
        />
        {/* パーティクルエフェクト */}
        {shouldShowParticles && <ParticleBackground />}
      </div>

      {/* コンテンツ層 */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
