import { ArrowRight } from "lucide-react";

interface MenuButtonProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

/**
 * メニューボタンコンポーネント
 */
export function MenuButton({ title, subtitle, icon, active = false, onClick }: MenuButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full overflow-hidden rounded-2xl p-[1px] transition-all hover:scale-[1.02] active:scale-[0.98]"
    >
      {/* ボーダーグラデーション */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${
          active
            ? "from-yellow-400 via-pink-500 to-cyan-500 animate-pulse"
            : "from-white/10 to-white/5 group-hover:from-purple-500 group-hover:to-cyan-500"
        } transition-all duration-500`}
      />

      {/* ボタン本体 */}
      <div
        className={`relative flex items-center gap-6 h-24 px-6 rounded-2xl bg-gradient-to-r ${
          active ? "from-purple-900/90 to-indigo-900/90" : "from-gray-900/90 to-black/90"
        } backdrop-blur-xl transition-all`}
      >
        {/* アイコンエリア */}
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br ${
            active
              ? "from-yellow-400 to-orange-500 shadow-[0_0_20px_rgba(234,179,8,0.4)]"
              : "from-gray-700 to-gray-800 group-hover:from-purple-500 group-hover:to-cyan-500"
          } text-white shadow-lg transition-all duration-300 group-hover:rotate-12`}
        >
          {icon}
        </div>

        {/* テキストエリア */}
        <div className="flex-grow text-left">
          <h3
            className={`font-orbitron font-bold text-lg tracking-wider ${
              active ? "text-white" : "text-gray-200 group-hover:text-white"
            } flex items-center gap-2`}
          >
            {title.split(" - ")[0]}
            <span className="text-[10px] opacity-60 font-normal">{title.split(" - ")[1]}</span>
          </h3>
          <p
            className={`text-xs ${
              active ? "text-purple-200" : "text-gray-500 group-hover:text-gray-300"
            } transition-colors`}
          >
            {subtitle}
          </p>
        </div>

        {/* 右端の矢印 */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center border ${
            active
              ? "border-white/20 bg-white/10"
              : "border-white/5 bg-white/5 group-hover:border-purple-500/50"
          } transition-all group-hover:translate-x-1`}
        >
          <ArrowRight
            className={`w-4 h-4 ${active ? "text-white" : "text-gray-600 group-hover:text-white"}`}
          />
        </div>

        {/* ホバー時の光沢エフェクト */}
        <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform skew-x-12 transition-all duration-700 group-hover:left-[100%]" />
      </div>
    </button>
  );
}
