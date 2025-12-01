/**
 * パック開封関連の定数とユーティリティ関数
 */

/**
 * 指定範囲内の値を正規化
 */
export const clamp = (val: number, min: number, max: number): number =>
  Math.min(Math.max(val, min), max);

/**
 * フォールバック用のグラデーション
 */
export const FALLBACK_GRADIENT = "linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)";

/**
 * カード1枚ずつ確認モード用のサイズ
 */
export const INSPECT_CARD_SIZE = "w-[240px] h-[336px] sm:w-[280px] sm:h-[440px]";
