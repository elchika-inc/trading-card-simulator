/**
 * ユーティリティ関数と定数定義
 */

/**
 * 指定範囲内の値を正規化
 */
export const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

/**
 * デフォルトのダミーデータ
 */
export const DEFAULT_PACK_IMAGE = "https://images.unsplash.com/photo-1620288627223-537a5db73524?q=80&w=1000&auto=format&fit=crop";
export const DEFAULT_BACK_IMAGE = null;
export const FALLBACK_GRADIENT = "linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)";

// 1枚ずつ見るモード用のサイズ (大きめ)
export const INSPECT_CARD_SIZE = "w-[240px] h-[336px] sm:w-[280px] sm:h-[440px]";
