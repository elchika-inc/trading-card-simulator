import React from 'react';
import { X, ImageIcon, Code, Check } from 'lucide-react';

/**
 * 設定モーダルコンポーネント
 */
export const SettingsModal = ({
  showSettings,
  onClose,
  tempPackUrl,
  setTempPackUrl,
  tempBackUrl,
  setTempBackUrl,
  tempCardsJson,
  setTempCardsJson,
  jsonError,
  onSave
}) => {
  if (!showSettings) return null;

  return (
    <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white text-lg font-bold">設定</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-slate-400 text-sm mb-2">パック画像のURL</label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={tempPackUrl}
                onChange={(e) => setTempPackUrl(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="https://..."
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-sm mb-2">カード裏面画像のURL (空欄でデフォルト)</label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={tempBackUrl}
                onChange={(e) => setTempBackUrl(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="https://..."
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-sm mb-2 flex items-center gap-2">
              <Code className="w-4 h-4" />
              カードデータ (JSON形式)
            </label>
            <textarea
              value={tempCardsJson}
              onChange={(e) => setTempCardsJson(e.target.value)}
              className="w-full h-40 bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-300 font-mono focus:outline-none focus:border-blue-500 transition-colors resize-y"
              spellCheck="false"
            />
            {jsonError && (
              <p className="text-red-400 text-xs mt-2">Error: {jsonError}</p>
            )}
            <p className="text-xs text-slate-500 mt-2">
              ※ <code>image</code>フィールドに表面画像のURLを指定します。
            </p>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={onSave}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              保存して適用
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
