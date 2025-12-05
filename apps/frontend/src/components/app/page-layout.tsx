import type { BackgroundPresetId } from "@repo/types";
import { GradientBackground } from "@repo/ui/gradient-background";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * 共通ページレイアウトコンポーネント
 * APIから背景設定を取得し、共通のGradientBackgroundを適用
 */
export function PageLayout({ children, className = "" }: PageLayoutProps) {
  const [preset, setPreset] = useState<BackgroundPresetId>("purple-cosmos");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8787";
        const response = await fetch(`${apiUrl}/api/settings`);
        if (response.ok) {
          const data = await response.json();
          setPreset(data.settings.backgroundPresetId);
        }
      } catch {
        // 設定取得に失敗してもデフォルトで動作
      }
    };
    fetchSettings();
  }, []);

  return (
    <GradientBackground
      preset={preset}
      className={`font-sans selection:bg-purple-500 selection:text-white ${className}`}
    >
      {children}
    </GradientBackground>
  );
}
