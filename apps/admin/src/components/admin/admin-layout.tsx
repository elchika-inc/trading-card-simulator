import type { BackgroundPresetId } from "@repo/types";
import { GradientBackground } from "@repo/ui/gradient-background";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  headerActions?: ReactNode;
  showBackButton?: boolean;
  backTo?: string;
}

/**
 * Admin共通レイアウトコンポーネント
 * frontendと同じ背景を使用し、設定APIから背景プリセットを取得
 */
export function AdminLayout({
  children,
  title,
  description,
  headerActions,
  showBackButton = true,
  backTo = "/",
}: AdminLayoutProps) {
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
    <GradientBackground preset={preset}>
      {/* ヘッダー */}
      {(title || headerActions) && (
        <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {showBackButton && (
                  <Link to={backTo}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white/70 hover:text-white hover:bg-white/10"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      戻る
                    </Button>
                  </Link>
                )}
                <div>
                  {title && <h1 className="text-xl font-bold text-white">{title}</h1>}
                  {description && <p className="text-sm text-white/60">{description}</p>}
                </div>
              </div>
              {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
            </div>
          </div>
        </header>
      )}

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </GradientBackground>
  );
}
