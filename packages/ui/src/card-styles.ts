/**
 * カードのスタイル関数
 * ホログラムエフェクト、テキストスタイル、フレーム色を生成
 */

import {
  type CardRarity,
  DEFAULT_FRAME_COLORS,
  type FrameColor,
  type FrameColorPreset,
  type HoloType,
  type TextStyleType,
} from "@repo/types";
import type { CSSProperties } from "react";

/**
 * 座標位置
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * ホログラム（背景）スタイルの定義
 * isHoveringフラグを受け取り、アニメーションの再生状態を制御
 */
export const getHoloStyle = (type: HoloType, pos: Position, isHovering: boolean): CSSProperties => {
  const base: CSSProperties = {
    opacity: 0.5,
    mixBlendMode: "color-dodge",
    transition: "opacity 0.3s ease",
  };

  const bx = pos.x;
  const by = pos.y;
  const playState = isHovering ? "running" : "paused";

  switch (type) {
    // --- Basic / Classic ---
    case "basic":
      return {
        ...base,
        opacity: 0.25,
        mixBlendMode: "overlay",
        backgroundImage: `linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)`,
        backgroundSize: "200% 200%",
        backgroundPosition: `${bx}% ${by}%`,
      };
    case "vertical":
      return {
        ...base,
        opacity: 0.35,
        backgroundImage: `linear-gradient(90deg, rgba(255,0,0,0.2) 0%, rgba(0,255,0,0.2) 45%, rgba(0,0,255,0.2) 55%, rgba(255,0,0,0.2) 100%)`,
        backgroundSize: "200% 100%",
        backgroundPosition: `${bx}% center`,
      };
    case "diagonal":
      return {
        ...base,
        opacity: 0.4,
        backgroundImage: `linear-gradient(115deg, transparent 0%, rgba(255,0,0,0.3) 25%, rgba(0,255,0,0.2) 50%, rgba(0,0,255,0.3) 75%, transparent 100%)`,
        backgroundSize: "300% 300%",
        backgroundPosition: `${bx}% ${by}%`,
      };
    case "sparkle":
      return {
        ...base,
        opacity: 0.45,
        filter: "brightness(1.2)",
        backgroundImage: `radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, transparent 10%), radial-gradient(circle at center, rgba(255,255,255,0.6) 0%, transparent 5%), linear-gradient(125deg, rgba(255,0,0,0.2), rgba(0,255,0,0.2), rgba(0,0,255,0.2))`,
        backgroundSize: "10% 10%, 6% 6%, 200% 200%",
        backgroundPosition: `${bx / 2}% ${by / 2}%, ${bx}% ${by}%, ${bx}% ${by}%`,
      };

    // --- Abstract / Texture ---
    case "ghost":
      return {
        ...base,
        mixBlendMode: "hard-light",
        opacity: 0.5,
        backgroundImage: `repeating-radial-gradient(circle at ${bx}% ${by}%, rgba(255,255,255,0.15) 0px, transparent 5px, transparent 20px, rgba(200,200,255,0.1) 25px, transparent 40px)`,
      };
    case "rainbow":
      return {
        ...base,
        opacity: 0.5,
        filter: "saturate(1.5)",
        backgroundImage: `radial-gradient(circle at ${bx}% ${by}%, transparent 20%, rgba(255,255,255,0.2) 30%, transparent 40%), conic-gradient(from ${bx * 3.6}deg at 50% 50%, rgba(255,0,0,0.2), rgba(255,165,0,0.2), rgba(255,255,0,0.2), rgba(0,128,0,0.2), rgba(0,0,255,0.2), rgba(75,0,130,0.2), rgba(238,130,238,0.2), rgba(255,0,0,0.2))`,
        backgroundSize: "150% 150%, cover",
      };
    case "checker":
      return {
        ...base,
        opacity: 0.3,
        mixBlendMode: "overlay",
        backgroundImage: `linear-gradient(45deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.2) 75%, rgba(255,255,255,0.2)), linear-gradient(45deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.2) 75%, rgba(255,255,255,0.2)), linear-gradient(to right, rgba(255,0,0,0.2), rgba(0,0,255,0.2))`,
        backgroundPosition: `0 0, 10px 10px, ${bx}% center`,
        backgroundSize: "20px 20px, 20px 20px, 200% 200%",
      };

    // --- Animated / Dynamic ---
    case "animated-galaxy":
      return {
        ...base,
        opacity: 0.7,
        mixBlendMode: "screen",
        backgroundImage: `
          radial-gradient(circle, white 2px, transparent 2.5px),
          radial-gradient(circle, white 1px, transparent 1.5px),
          conic-gradient(from 0deg, #000033, #330066, #660099, #330066, #000033)
        `,
        backgroundSize: "100px 100px, 50px 50px, 100% 100%",
        animation: `holoRotate 20s linear infinite ${playState}`,
        filter: "blur(0.5px)",
      };
    case "animated-rain":
      return {
        ...base,
        opacity: 0.6,
        mixBlendMode: "screen",
        backgroundImage: `linear-gradient(to bottom, rgba(0,255,0,0) 0%, rgba(0,255,0,0.8) 50%, rgba(0,255,0,0) 100%)`,
        backgroundSize: "2px 20px",
        animation: `rainFall 0.5s linear infinite ${playState}`,
      };
    case "animated-shimmer":
      return {
        ...base,
        opacity: 0.5,
        mixBlendMode: "color-dodge",
        backgroundImage: `linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.8) 50%, transparent 80%)`,
        backgroundSize: "200% 200%",
        animation: `holoSpin 3s linear infinite ${playState}`,
      };

    // --- Fire / Heat ---
    case "blaze":
      return {
        ...base,
        opacity: 0.7,
        mixBlendMode: "hard-light",
        backgroundImage: `linear-gradient(0deg, rgba(255,0,0,0.8) 0%, rgba(255,100,0,0.6) 40%, rgba(255,200,0,0.4) 70%, transparent 100%), repeating-linear-gradient(45deg, transparent 0, transparent 10px, rgba(255,50,0,0.2) 15px, transparent 20px)`,
        filter: "contrast(1.5) brightness(1.2)",
        backgroundSize: "100% 150%, 200% 200%",
        backgroundPosition: `center bottom, ${bx}% ${by}%`,
      };
    case "ember":
      return {
        ...base,
        opacity: 0.6,
        mixBlendMode: "color-dodge",
        backgroundImage: `radial-gradient(circle at ${bx}% ${by}%, rgba(255,100,50,0.8), transparent 40%), repeating-radial-gradient(circle at 50% 50%, rgba(50,0,0,0.5) 0, rgba(100,20,0,0.3) 5px, transparent 10px)`,
        filter: "contrast(1.2) sepia(0.5)",
      };
    case "phoenix":
      return {
        ...base,
        opacity: 0.6,
        mixBlendMode: "overlay",
        backgroundImage: `conic-gradient(from ${bx * 2}deg at 50% 100%, rgba(255,0,0,0), rgba(255,100,0,0.5), rgba(255,200,0,0.8), rgba(255,100,0,0.5), rgba(255,0,0,0)), radial-gradient(circle at ${bx}% ${by}%, rgba(255,255,200,0.5), transparent 50%)`,
        filter: "contrast(1.3)",
      };

    // --- Cute / Kawaii ---
    case "hearts":
      return {
        ...base,
        opacity: 0.6,
        mixBlendMode: "overlay",
        backgroundImage: `radial-gradient(circle at ${bx}% ${by}%, rgba(255,100,150,0.5), transparent 40%), url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 3.5c-1.5-2-4.5-2-6.5 0s-2 4.5 0 6.5l6.5 6.5 6.5-6.5c2-2 2-4.5 0-6.5s-5-2-6.5 0z' fill='rgba(255,150,180,0.4)'/%3E%3C/svg%3E")`,
        backgroundSize: "150% 150%, 30px 30px",
        backgroundPosition: `${bx}% ${by}%, 0 0`,
        filter: "contrast(1.2)",
      };
    case "bubbles":
      return {
        ...base,
        opacity: 0.5,
        mixBlendMode: "soft-light",
        backgroundImage: `radial-gradient(circle at ${bx}% ${by}%, rgba(150,255,255,0.6), transparent 50%), radial-gradient(circle at ${100 - bx}% ${100 - by}%, rgba(255,150,255,0.6), transparent 50%), repeating-radial-gradient(circle at center, rgba(255,255,255,0.2) 0, transparent 10px, rgba(255,255,255,0.1) 20px)`,
        backgroundSize: "150% 150%, 150% 150%, 100px 100px",
        filter: "blur(2px)",
      };
    case "sparkle-dust":
      return {
        ...base,
        opacity: 0.7,
        mixBlendMode: "color-dodge",
        backgroundImage: `radial-gradient(circle at ${bx}% ${by}%, rgba(255,255,200,0.8), transparent 30%), url("data:image/svg+xml,%3Csvg width='10' height='10' viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='5' cy='5' r='2' fill='rgba(255,255,200,0.6)'/%3E%3C/svg%3E")`,
        backgroundSize: "100% 100%, 15px 15px",
        backgroundPosition: `center, ${bx / 2}% ${by / 2}%`,
        filter: "contrast(1.5)",
        animation: `holoSpin 10s linear infinite ${playState}`,
      };
    case "candy-swirl":
      return {
        ...base,
        opacity: 0.6,
        mixBlendMode: "overlay",
        backgroundImage: `conic-gradient(from ${bx * 3}deg at 50% 50%, #ff9a9e, #fad0c4, #ffecd2, #a18cd1, #fbc2eb, #ff9a9e), radial-gradient(circle at ${bx}% ${by}%, rgba(255,255,255,0.5), transparent 40%)`,
        backgroundSize: "100% 100%, 150% 150%",
        filter: "contrast(1.2) hue-rotate(-10deg)",
      };

    // --- Cool / Cyber ---
    case "frozen":
      return {
        ...base,
        opacity: 0.6,
        mixBlendMode: "hard-light",
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0 L25 10 L35 15 L25 20 L20 30 L15 20 L5 15 L15 10 Z' fill='rgba(200,240,255,0.4)'/%3E%3C/svg%3E"), linear-gradient(to bottom, rgba(200,240,255,0.2), rgba(0,100,200,0.4))`,
        backgroundSize: "80px 80px, cover",
        backgroundPosition: `${bx / 2}% ${by / 2}%, center`,
        filter: "contrast(1.3) brightness(1.2)",
      };
    case "neon-grid":
      return {
        ...base,
        opacity: 0.5,
        mixBlendMode: "screen",
        backgroundImage: `linear-gradient(rgba(0,255,255,0.5) 2px, transparent 2px), linear-gradient(90deg, rgba(255,0,255,0.5) 2px, transparent 2px)`,
        backgroundSize: "40px 40px",
        backgroundPosition: `${bx}% ${by}%`,
        filter: "drop-shadow(0 0 5px rgba(0,255,255,0.8))",
      };
    case "stealth":
      return {
        ...base,
        opacity: 0.3,
        mixBlendMode: "overlay",
        backgroundImage: `repeating-linear-gradient(45deg, rgba(50,50,50,0.5) 0, rgba(50,50,50,0.5) 10px, transparent 10px, transparent 20px), repeating-linear-gradient(-45deg, rgba(30,30,30,0.5) 0, rgba(30,30,30,0.5) 5px, transparent 5px, transparent 15px)`,
        backgroundSize: "200% 200%",
        backgroundPosition: `${bx / 4}% ${by / 4}%`,
        filter: "grayscale(1) contrast(0.8)",
      };
    case "dark-matter":
      return {
        ...base,
        opacity: 0.6,
        mixBlendMode: "hard-light",
        backgroundImage: `radial-gradient(circle at ${bx}% ${by}%, rgba(50,0,100,0.8), transparent 50%), repeating-conic-gradient(from ${bx * 2}deg, rgba(0,0,0,0.5) 0deg, rgba(20,0,40,0.5) 30deg, transparent 60deg)`,
        filter: "contrast(1.5) hue-rotate(240deg)",
        animation: `holoSpin 20s linear infinite ${playState}`,
      };

    // --- Dark / Evil ---
    case "abyssal":
      return {
        ...base,
        opacity: 0.7,
        mixBlendMode: "multiply",
        backgroundImage: `radial-gradient(circle at ${bx}% ${by}%, rgba(0,20,50,0.9), rgba(0,0,0,0.8) 70%), repeating-radial-gradient(circle at center, transparent 0, rgba(0,50,0,0.2) 20px, transparent 40px)`,
        filter: "brightness(0.8) contrast(1.5)",
      };
    case "shadow-warp":
      return {
        ...base,
        opacity: 0.6,
        mixBlendMode: "exclusion",
        backgroundImage: `repeating-conic-gradient(from ${bx}deg at ${by}% ${bx}%, #000 0deg, #200 15deg, #002 30deg, #000 45deg)`,
        filter: "invert(1) hue-rotate(180deg)",
        animation: `warpSpeed 2s linear infinite ${playState}`,
      };
    case "eclipsed":
      return {
        ...base,
        opacity: 0.8,
        mixBlendMode: "hard-light",
        backgroundImage: `radial-gradient(circle at ${bx}% ${by}%, #000 30%, rgba(50,0,100,0.5) 50%, transparent 70%)`,
        boxShadow: `inset 0 0 50px #000`,
        filter: "contrast(1.5)",
      };
    case "corrupted":
      return {
        ...base,
        opacity: 0.5,
        mixBlendMode: "difference",
        backgroundImage: `linear-gradient(90deg, rgba(255,0,0,0.5), transparent), repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,255,0,0.5) 3px)`,
        backgroundSize: "100% 100%, 100% 5px",
        filter: "contrast(2)",
        animation: `glitchAnim 0.2s steps(5) infinite ${playState}`,
      };

    // --- Abstract / Texture (Additional) ---
    case "scales":
      return {
        ...base,
        opacity: 0.5,
        mixBlendMode: "soft-light",
        backgroundImage: `radial-gradient(circle at 50% 0, rgba(255,255,255,0.3) 20%, transparent 30%), radial-gradient(circle at 50% 0, rgba(255,255,255,0.3) 20%, transparent 30%)`,
        backgroundSize: "40px 40px",
        backgroundPosition: `0 0, 20px 20px`,
      };
    case "glitter":
      return {
        ...base,
        opacity: 0.7,
        mixBlendMode: "color-dodge",
        backgroundImage: `conic-gradient(from ${bx * 5}deg, red, yellow, lime, aqua, blue, magenta, red)`,
        backgroundSize: "5% 5%",
        filter: "contrast(2) brightness(1.5)",
      };
    case "cracked":
      return {
        ...base,
        opacity: 0.45,
        filter: "contrast(1.3)",
        backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,0.3) 0, rgba(255,255,255,0.1) 2px, transparent 3px, transparent 15px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.2) 0, rgba(255,255,255,0.1) 2px, transparent 3px, transparent 20px), linear-gradient(135deg, rgba(255,0,0,0.2), rgba(0,255,0,0.2), rgba(0,0,255,0.2))`,
        backgroundSize: "200% 200%",
        backgroundPosition: `${bx}% ${by}%`,
      };
    case "hexagon":
      return {
        ...base,
        opacity: 0.4,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='40' viewBox='0 0 24 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40c5.523 0 10-4.477 10-10V10c0-5.523-4.477-10-10-10s-10 4.477-10 10v20c0 5.523 4.477 10 10 10zM12 20c5.523 0 10-4.477 10-10V0H2v10c0 5.523 4.477 10 10 10zM12 40c5.523 0 10-4.477 10-10V20H2v10c0 5.523 4.477 10 10 10z' fill='%23ffffff' fill-opacity='0.15' fill-rule='evenodd'/%3E%3C/svg%3E"), linear-gradient(180deg, rgba(255,255,0,0.1), rgba(0,255,255,0.1))`,
        backgroundPosition: `${bx / 4}% ${by / 4}%, center`,
        backgroundSize: "auto, 200% 200%",
      };
    case "oil":
      return {
        ...base,
        opacity: 0.5,
        filter: "blur(2px) contrast(1.5)",
        backgroundImage: `radial-gradient(circle at ${bx}% ${by}%, rgba(255,0,150,0.3), transparent 40%), radial-gradient(circle at ${100 - bx}% ${100 - by}%, rgba(0,255,200,0.3), transparent 40%), linear-gradient(45deg, rgba(255,255,0,0.1), rgba(0,0,255,0.1))`,
        backgroundSize: "150% 150%",
      };
    case "wireframe":
      return {
        ...base,
        opacity: 0.4,
        mixBlendMode: "screen",
        backgroundImage: `linear-gradient(rgba(0,255,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,0,0.3) 1px, transparent 1px), radial-gradient(circle at ${bx}% ${by}%, rgba(0,255,0,0.3), transparent 50%)`,
        backgroundSize: "30px 30px, 30px 30px, 200% 200%",
        backgroundPosition: `center, center, center`,
      };

    // --- Metal / Material (Additional) ---
    case "gold":
      return {
        ...base,
        opacity: 0.6,
        mixBlendMode: "soft-light",
        filter: "brightness(1.1) contrast(1.2)",
        backgroundImage: `linear-gradient(135deg, rgba(255,215,0,0.2) 0%, rgba(255,223,0,0.6) 25%, rgba(255,255,255,0.8) 50%, rgba(218,165,32,0.6) 75%, rgba(184,134,11,0.2) 100%)`,
        backgroundSize: "200% 200%",
        backgroundPosition: `${bx}% ${by}%`,
      };
    case "silver":
      return {
        ...base,
        opacity: 0.6,
        filter: "grayscale(1) brightness(1.2)",
        backgroundImage: `linear-gradient(135deg, rgba(192,192,192,0.2) 0%, rgba(220,220,220,0.5) 25%, rgba(255,255,255,0.8) 50%, rgba(169,169,169,0.5) 75%, rgba(128,128,128,0.2) 100%)`,
        backgroundSize: "200% 200%",
        backgroundPosition: `${bx}% ${by}%`,
      };
    case "brushed":
      return {
        ...base,
        opacity: 0.4,
        mixBlendMode: "overlay",
        filter: "contrast(1.1)",
        backgroundImage: `repeating-linear-gradient(90deg, transparent 0, transparent 1px, rgba(255,255,255,0.1) 1px, rgba(255,255,255,0.1) 2px), linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)`,
        backgroundSize: "100% 100%, 200% 200%",
        backgroundPosition: `0 0, ${bx}% ${by}%`,
      };
    case "carbon":
      return {
        ...base,
        opacity: 0.5,
        mixBlendMode: "overlay",
        filter: "brightness(1.5)",
        backgroundImage: `linear-gradient(45deg, rgba(0,0,0,0.5) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.5) 75%, rgba(0,0,0,0.5)), linear-gradient(45deg, rgba(0,0,0,0.5) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.5) 75%, rgba(0,0,0,0.5))`,
        backgroundColor: "rgba(50,50,50,0.3)",
        backgroundPosition: "0 0, 10px 10px",
        backgroundSize: "20px 20px",
      };

    // --- Special / Elements (Additional) ---
    case "magma":
      return {
        ...base,
        opacity: 0.6,
        mixBlendMode: "color-dodge",
        backgroundImage: `radial-gradient(circle at ${bx}% ${by}%, rgba(255,255,0,0.6) 0%, rgba(255,0,0,0.4) 30%, transparent 70%), repeating-linear-gradient(0deg, transparent 0, transparent 10px, rgba(255,0,0,0.1) 10px, rgba(255,0,0,0.1) 20px)`,
        filter: "contrast(1.5) saturate(2)",
      };
    case "cosmic":
      return {
        ...base,
        opacity: 0.7,
        mixBlendMode: "screen",
        backgroundImage: `radial-gradient(white 1px, transparent 1px), radial-gradient(white 1px, transparent 1px)`,
        backgroundSize: "50px 50px, 30px 30px",
        backgroundPosition: `${bx / 2}px ${by / 2}px, ${bx}px ${by}px`,
        backgroundColor: "rgba(20,0,50,0.3)",
      };
    case "circuit":
      return {
        ...base,
        opacity: 0.4,
        mixBlendMode: "screen",
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10 h80 v80 h-80 Z' fill='none' stroke='rgba(0,255,255,0.3)' stroke-width='1'/%3E%3Cpath d='M30 10 v30 h30 v-30' fill='none' stroke='rgba(0,255,255,0.3)' stroke-width='1'/%3E%3Ccircle cx='30' cy='40' r='2' fill='rgba(0,255,255,0.5)'/%3E%3C/svg%3E"), linear-gradient(to bottom, rgba(0,255,255,0.1), transparent)`,
        backgroundSize: "100px 100px, cover",
        backgroundPosition: `${bx}% ${by}%, center`,
      };
    case "waves":
      return {
        ...base,
        opacity: 0.5,
        mixBlendMode: "overlay",
        backgroundImage: `repeating-radial-gradient(circle at ${bx}% ${100}%, transparent 0, transparent 10px, rgba(0,200,255,0.2) 15px, transparent 20px)`,
      };
    case "crystal":
      return {
        ...base,
        opacity: 0.5,
        mixBlendMode: "hard-light",
        backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%, rgba(255,255,255,0.4) 100%), linear-gradient(45deg, rgba(255,255,255,0) 40%, rgba(200,255,255,0.4) 50%, rgba(255,255,255,0) 60%)`,
        backgroundSize: "200% 200%",
        backgroundPosition: `${bx}% ${by}%`,
      };
    case "nebula":
      return {
        ...base,
        opacity: 0.6,
        mixBlendMode: "screen",
        backgroundImage: `radial-gradient(circle at ${bx}% ${by}%, rgba(255,0,255,0.4), transparent 60%), radial-gradient(circle at ${100 - bx}% ${100 - by}%, rgba(0,255,255,0.4), transparent 60%)`,
        filter: "blur(10px)",
      };
    case "matrix":
      return {
        ...base,
        opacity: 0.5,
        mixBlendMode: "screen",
        backgroundImage: `linear-gradient(0deg, rgba(0,255,0,0) 0%, rgba(0,255,0,0.5) 50%, rgba(0,255,0,0) 100%), repeating-linear-gradient(90deg, transparent 0, transparent 20px, rgba(0,255,0,0.2) 20px, rgba(0,255,0,0.2) 22px)`,
        backgroundSize: "100% 100%, 100% 100%",
        backgroundPosition: `0 ${by}%, center`,
      };
    case "vortex":
      return {
        ...base,
        opacity: 0.45,
        mixBlendMode: "hard-light",
        backgroundImage: `repeating-conic-gradient(from ${bx * 3.6}deg, rgba(255,255,255,0.1) 0deg, rgba(255,255,255,0.1) 10deg, transparent 10deg, transparent 20deg)`,
        filter: "blur(1px)",
      };
    case "laser":
      return {
        ...base,
        opacity: 0.6,
        mixBlendMode: "screen",
        backgroundImage: `linear-gradient(45deg, transparent 48%, rgba(255,0,0,0.8) 50%, transparent 52%), linear-gradient(-45deg, transparent 48%, rgba(0,0,255,0.8) 50%, transparent 52%), linear-gradient(90deg, transparent 48%, rgba(0,255,0,0.8) 50%, transparent 52%)`,
        backgroundSize: "200% 200%, 200% 200%, 200% 200%",
        backgroundPosition: `${bx}% ${by}%, ${100 - bx}% ${100 - by}%, ${bx}% center`,
      };
    case "sequins":
      return {
        ...base,
        opacity: 0.7,
        mixBlendMode: "color-dodge",
        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.8) 20%, transparent 25%)`,
        backgroundSize: "10px 10px",
        backgroundPosition: `${bx / 2}% ${by / 2}%`,
      };
    case "marble":
      return {
        ...base,
        opacity: 0.5,
        mixBlendMode: "overlay",
        backgroundImage: `radial-gradient(circle at ${bx}% ${by}%, rgba(255,255,255,0.8), transparent 60%), radial-gradient(circle at ${100 - bx}% ${100 - by}%, rgba(0,0,0,0.5), transparent 60%)`,
        filter: "contrast(1.5) blur(30px)",
      };
    case "plasmatic":
      return {
        ...base,
        opacity: 0.6,
        mixBlendMode: "color-dodge",
        backgroundImage: `radial-gradient(circle at ${bx}% ${by}%, rgba(100,200,255,0.5), transparent 40%), radial-gradient(circle at ${by}% ${bx}%, rgba(255,100,200,0.5), transparent 40%)`,
        filter: `hue-rotate(${bx}deg) blur(5px)`,
      };

    // --- Complex / New Patterns ---
    case "kaleidoscope":
      return {
        ...base,
        opacity: 0.6,
        mixBlendMode: "hard-light",
        backgroundImage: `conic-gradient(from ${bx * 5}deg at 50% 50%, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00), radial-gradient(circle at ${bx}% ${by}%, transparent 20%, #000 60%)`,
        backgroundSize: "100% 100%, 150% 150%",
        filter: "contrast(1.5) hue-rotate(90deg)",
      };
    case "aurora":
      return {
        ...base,
        opacity: 0.7,
        mixBlendMode: "screen",
        backgroundImage: `linear-gradient(120deg, rgba(0,255,150,0) 30%, rgba(0,255,150,0.4) 50%, rgba(0,255,150,0) 70%), linear-gradient(60deg, rgba(0,100,255,0) 20%, rgba(0,100,255,0.4) 50%, rgba(0,100,255,0) 80%), linear-gradient(180deg, rgba(150,0,255,0) 10%, rgba(150,0,255,0.4) 50%, rgba(150,0,255,0) 90%)`,
        backgroundSize: "200% 200%",
        backgroundPosition: `${bx}% ${by}%, ${by}% ${bx}%, center`,
        filter: "blur(8px) contrast(1.2)",
      };
    case "damascus":
      return {
        ...base,
        opacity: 0.45,
        mixBlendMode: "overlay",
        backgroundImage: `repeating-radial-gradient(circle at ${bx}% ${by}%, #888 0, #888 2px, transparent 3px, transparent 8px, #888 9px), repeating-linear-gradient(45deg, #aaa 0, transparent 2px, transparent 6px, #aaa 8px)`,
        filter: "contrast(1.5) grayscale(1)",
      };
    case "quantum":
      return {
        ...base,
        opacity: 0.6,
        mixBlendMode: "color-dodge",
        backgroundImage: `radial-gradient(circle at ${bx}% ${by}%, rgba(100,255,255,0.8) 0%, transparent 10%), repeating-linear-gradient(0deg, transparent 0, transparent 49px, rgba(0,255,255,0.2) 50px), repeating-linear-gradient(90deg, transparent 0, transparent 49px, rgba(0,255,255,0.2) 50px)`,
        backgroundSize: "100% 100%, 50px 50px, 50px 50px",
        filter: "drop-shadow(0 0 5px cyan)",
      };
    case "bio":
      return {
        ...base,
        opacity: 0.6,
        mixBlendMode: "screen",
        backgroundImage: `radial-gradient(circle at ${bx}% ${by}%, rgba(0,255,0,0.6), transparent 50%), repeating-radial-gradient(circle at 50% 50%, transparent 0, transparent 10px, rgba(50,200,50,0.2) 15px, transparent 20px)`,
        backgroundSize: "150% 150%, 50px 50px",
        filter: "contrast(1.5)",
      };
    case "hyperspeed":
      return {
        ...base,
        opacity: 0.5,
        mixBlendMode: "overlay",
        backgroundImage: `repeating-conic-gradient(from ${bx}deg at 50% 50%, rgba(255,255,255,0.1) 0deg, transparent 2deg, transparent 10deg)`,
        filter: "blur(1px)",
      };

    // --- Advanced / Artistic ---
    case "stained-glass":
      return {
        ...base,
        opacity: 0.6,
        mixBlendMode: "hard-light",
        backgroundImage: `conic-gradient(from ${bx * 2}deg at 50% 50%, rgba(255,0,0,0.4) 0deg, rgba(255,255,0,0.4) 60deg, rgba(0,255,0,0.4) 120deg, rgba(0,255,255,0.4) 180deg, rgba(0,0,255,0.4) 240deg, rgba(255,0,255,0.4) 300deg, rgba(255,0,0,0.4) 360deg), repeating-linear-gradient(45deg, transparent 0, transparent 20px, rgba(0,0,0,0.5) 21px)`,
        filter: "contrast(1.2)",
      };
    case "caustics":
      return {
        ...base,
        opacity: 0.6,
        mixBlendMode: "overlay",
        backgroundImage: `repeating-radial-gradient(circle at ${bx}% ${by}%, transparent 0, rgba(200,255,255,0.4) 2px, transparent 10px), repeating-radial-gradient(circle at ${100 - bx}% ${100 - by}%, transparent 0, rgba(200,255,255,0.4) 2px, transparent 15px)`,
        filter: "blur(1px) contrast(1.5)",
      };
    case "runes":
      return {
        ...base,
        opacity: 0.6,
        mixBlendMode: "screen",
        backgroundImage: `repeating-conic-gradient(from ${bx}deg, transparent 0deg, rgba(255,200,100,0.4) 2deg, transparent 10deg), radial-gradient(circle, transparent 30%, rgba(255,100,0,0.2) 70%)`,
        filter: "drop-shadow(0 0 2px gold)",
      };
    case "blueprint":
      return {
        ...base,
        opacity: 0.8,
        mixBlendMode: "screen",
        backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
        backgroundSize: "20px 20px",
        backgroundColor: "rgba(0,50,150,0.4)",
      };
    case "inferno":
      return {
        ...base,
        opacity: 0.7,
        mixBlendMode: "color-dodge",
        backgroundImage: `radial-gradient(circle at ${bx}% 100%, rgba(255,50,0,0.8), transparent 60%), repeating-linear-gradient(0deg, transparent 0, transparent 5px, rgba(255,100,0,0.2) 10px)`,
        filter: "contrast(2) blur(1px)",
      };
    case "enchanted":
      return {
        ...base,
        opacity: 0.6,
        mixBlendMode: "overlay",
        backgroundImage: `radial-gradient(circle, rgba(255,255,200,0.8) 1px, transparent 3px), radial-gradient(circle, rgba(200,255,200,0.6) 2px, transparent 10px)`,
        backgroundSize: "30px 30px, 90px 90px",
        backgroundPosition: `${bx}% ${by}%, ${by}% ${bx}%`,
        filter: "drop-shadow(0 0 2px gold)",
      };

    // --- Complex / Ethereal ---
    case "moire":
      return {
        ...base,
        opacity: 0.5,
        mixBlendMode: "difference",
        backgroundImage: `repeating-radial-gradient(circle at ${bx}% ${by}%, white 0, white 2px, transparent 4px), repeating-radial-gradient(circle at ${100 - bx}% ${100 - by}%, white 0, white 2px, transparent 4px)`,
        filter: "contrast(2)",
      };
    case "liquid-metal":
      return {
        ...base,
        opacity: 0.7,
        mixBlendMode: "hard-light",
        backgroundImage: `repeating-linear-gradient(${bx}deg, rgba(200,200,200,0.5) 0, rgba(255,255,255,0.8) 10%, rgba(200,200,200,0.5) 20%), radial-gradient(circle at ${bx}% ${by}%, rgba(255,255,255,0.9), transparent 50%)`,
        filter: "blur(2px) contrast(2)",
      };
    case "cyber-glitch":
      return {
        ...base,
        opacity: 0.6,
        mixBlendMode: "hard-light",
        backgroundImage: `repeating-linear-gradient(90deg, transparent 0, transparent 2px, rgba(0,255,0,0.5) 2px, rgba(0,255,0,0.5) 4px), repeating-linear-gradient(0deg, transparent 0, transparent 4px, rgba(0,0,0,0.2) 4px, rgba(0,0,0,0.2) 5px)`,
        backgroundSize: "100% 100%, 100% 100%",
        filter: "contrast(2) hue-rotate(90deg)",
      };
    case "nebula-storm":
      return {
        ...base,
        opacity: 0.6,
        mixBlendMode: "color-dodge",
        backgroundImage: `radial-gradient(circle at ${bx}% ${by}%, rgba(200,0,255,0.5), transparent 50%), radial-gradient(circle at ${100 - bx}% ${100 - by}%, rgba(0,200,255,0.5), transparent 50%), radial-gradient(circle at center, rgba(255,255,0,0.2), transparent 50%)`,
        filter: "blur(5px) contrast(1.2)",
      };
    case "prismatic-shards":
      return {
        ...base,
        opacity: 0.6,
        mixBlendMode: "soft-light",
        backgroundImage: `conic-gradient(from ${bx}deg at ${by}% ${bx}%, rgba(255,0,0,0.4), rgba(255,255,0,0.4), rgba(0,255,0,0.4), rgba(0,255,255,0.4), rgba(0,0,255,0.4), rgba(255,0,255,0.4))`,
        filter: "contrast(1.5)",
      };
    case "phantom-grid":
      return {
        ...base,
        opacity: 0.5,
        mixBlendMode: "exclusion",
        backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
        backgroundPosition: `${bx / 2}% ${by / 2}%`,
        filter: "invert(1)",
      };

    // --- Fire / Heat (Additional) ---
    case "hellfire":
      return {
        ...base,
        opacity: 0.7,
        mixBlendMode: "color-dodge",
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,100,255,0.5) 50%, rgba(200,255,255,0.8) 100%), repeating-linear-gradient(0deg, transparent 0, transparent 5px, rgba(0,50,255,0.3) 7px, transparent 10px)`,
        filter: "hue-rotate(-20deg) contrast(1.5)",
      };
    default:
      return { ...base, opacity: 0 };
  }
};

/**
 * テキスト（名前）スタイルの定義
 * isHoveringフラグを受け取り、アニメーションの再生状態を制御
 */
export const getTextStyle = (
  styleType: TextStyleType,
  pos: Position,
  isHovering: boolean,
): CSSProperties => {
  const base: CSSProperties = {
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    backgroundSize: "200% auto",
    transition: "all 0.1s ease-out",
  };
  const dx = (pos.x - 50) / 50;
  const dy = (pos.y - 50) / 50;
  const playState = isHovering ? "running" : "paused";

  switch (styleType) {
    // Metal
    case "gold":
      return {
        ...base,
        backgroundPosition: `${pos.x}% ${pos.y}%`,
        backgroundImage:
          "linear-gradient(to bottom, #cfc09f 22%, #634f2c 24%, #cfc09f 26%, #cfc09f 27%, #ffecb3 40%, #3a2c0f 78%)",
        color: "transparent",
        textShadow: `${-dx * 2}px ${-dy * 2 + 1}px 0 #8b7d52`,
        filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.5))",
      };
    case "silver":
      return {
        ...base,
        backgroundPosition: `${pos.x}% ${pos.y}%`,
        backgroundImage: "linear-gradient(to bottom, #eee 0%, #333 50%, #eee 100%)",
        color: "transparent",
        textShadow: `${-dx}px ${-dy + 1}px 0 #fff`,
        filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.8))",
      };

    // Light / Energy
    case "neon":
      return {
        ...base,
        color: "#fff",
        textShadow: `${-dx * 2}px ${-dy * 2}px 5px #0ff, ${-dx * 4}px ${-dy * 4}px 10px #0ff, 0 0 20px #0ff, 0 0 40px #0ff`,
      };
    case "neon-pink":
      return {
        ...base,
        color: "#fff",
        textShadow: `${-dx * 2}px ${-dy * 2}px 5px #f0f, ${-dx * 4}px ${-dy * 4}px 10px #f0f, 0 0 20px #f0f, 0 0 40px #f0f`,
      };

    // Nature / Elements
    case "fire":
      return {
        ...base,
        backgroundPosition: `${pos.x}% ${100 - pos.y}%`,
        backgroundImage: "linear-gradient(0deg, #f00 0%, #ff0 50%, #fff 100%)",
        color: "transparent",
        filter: `drop-shadow(${dx * 2}px ${dy * 2}px 4px rgba(255, 100, 0, 0.8))`,
      };
    case "ice":
      return {
        ...base,
        backgroundImage: "linear-gradient(to bottom, #fff, #a5f3fc, #0891b2)",
        color: "transparent",
        textShadow: "0 0 10px #22d3ee",
        filter: "brightness(1.2)",
      };

    // Special
    case "holo":
      return {
        ...base,
        backgroundPosition: `${100 - pos.x}% center`,
        backgroundImage:
          "linear-gradient(115deg, transparent 0%, #ff0000 25%, #00ff00 50%, #0000ff 75%, transparent 100%)",
        color: "transparent",
        backgroundColor: "#fff",
        backgroundBlendMode: "overlay",
      };
    case "glitch":
      return {
        ...base,
        color: "#fff",
        textShadow: `${dx * 4}px 0 #f00, ${-dx * 4}px 0 #0ff`,
        letterSpacing: "2px",
      };

    // Cute
    case "cotton-candy":
      return {
        ...base,
        backgroundImage: "linear-gradient(to right, #ff9a9e, #fecfef, #a18cd1)",
        color: "transparent",
        textShadow: "1px 1px 2px rgba(255,255,255,0.5)",
        WebkitTextStroke: "0.5px rgba(255,255,255,0.8)",
      };
    case "bubblegum":
      return {
        ...base,
        color: "#ff69b4",
        textShadow: "2px 2px 0px #00ffff, -2px -2px 0px #ffff00",
        fontWeight: "bold",
        letterSpacing: "1px",
      };

    // Cool
    case "frostbite":
      return {
        ...base,
        backgroundImage: "linear-gradient(to bottom, #e0f7fa, #80deea, #26c6da)",
        color: "transparent",
        textShadow: "0 0 10px rgba(200,240,255,0.8)",
        WebkitTextStroke: "0.5px #00bcd4",
        filter: "brightness(1.2)",
      };
    case "cyberpunk":
      return {
        ...base,
        color: "#0ff",
        textShadow: `${dx * 3}px ${dy * 3}px 0px #f0f, ${-dx * 3}px ${-dy * 3}px 0px #ff0`,
        fontFamily: "monospace",
        letterSpacing: "2px",
        animation: `textShine 0.1s infinite ${playState}`,
      };

    // Dark
    case "shadow-whispers":
      return {
        ...base,
        backgroundImage: "linear-gradient(to bottom, #333, #000)",
        color: "transparent",
        textShadow: "0 0 5px rgba(255,0,0,0.3)",
        WebkitTextStroke: "0.5px rgba(100,0,0,0.5)",
      };
    case "void-script":
      return {
        ...base,
        color: "#000",
        textShadow: "0 0 2px #0ff",
        backgroundColor: "#000022",
        backgroundClip: "text",
        fontFamily: "monospace",
        letterSpacing: "1px",
        animation: `glitchAnim 0.5s infinite ${playState}`,
      };

    // Animated
    case "breathing-glow":
      return {
        ...base,
        color: "#fff",
        animation: `breathingText 2s ease-in-out infinite ${playState}`,
      };
    default:
      return {
        color: "#f1f5f9",
        textShadow: `${-dx}px ${-dy + 2}px 4px rgba(0,0,0,0.5)`,
      };
  }
};

/**
 * フレーム色プリセットのカラー定義
 * 各プリセットに対応するCSS色値を定義
 */
export const FRAME_COLOR_VALUES: Record<
  FrameColorPreset,
  { normal: string; hover: string; gradient?: string }
> = {
  default: { normal: "#1f2937", hover: "#6b7280" }, // gray-800, gray-500
  gold: {
    normal: "#b8860b",
    hover: "#ffd700",
    gradient: "linear-gradient(135deg, #b8860b 0%, #ffd700 50%, #b8860b 100%)",
  },
  silver: {
    normal: "#708090",
    hover: "#c0c0c0",
    gradient: "linear-gradient(135deg, #708090 0%, #c0c0c0 50%, #708090 100%)",
  },
  bronze: {
    normal: "#8b4513",
    hover: "#cd7f32",
    gradient: "linear-gradient(135deg, #8b4513 0%, #cd7f32 50%, #8b4513 100%)",
  },
  platinum: {
    normal: "#a0a0a0",
    hover: "#e5e5e5",
    gradient: "linear-gradient(135deg, #a0a0a0 0%, #e5e5e5 50%, #a0a0a0 100%)",
  },
  red: { normal: "#991b1b", hover: "#ef4444" }, // red-800, red-500
  blue: { normal: "#1e40af", hover: "#3b82f6" }, // blue-800, blue-500
  green: { normal: "#166534", hover: "#22c55e" }, // green-800, green-500
  purple: { normal: "#6b21a8", hover: "#a855f7" }, // purple-800, purple-500
  pink: { normal: "#9d174d", hover: "#ec4899" }, // pink-800, pink-500
  orange: { normal: "#9a3412", hover: "#f97316" }, // orange-800, orange-500
  black: { normal: "#000000", hover: "#374151" }, // black, gray-700
  white: { normal: "#d1d5db", hover: "#ffffff" }, // gray-300, white
  rainbow: {
    normal: "transparent",
    hover: "transparent",
    gradient:
      "linear-gradient(135deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)",
  },
  custom: { normal: "#1f2937", hover: "#6b7280" }, // フォールバック
};

/**
 * フレーム色のスタイルを取得
 * @param frameColor フレーム色設定（省略時はdefault）
 * @param rarity レアリティ（frameColorが未設定の場合にデフォルト色を決定）
 * @param isHovering ホバー状態
 * @returns CSSスタイルオブジェクト（borderColor, borderImage含む）
 */
export const getFrameStyle = (
  frameColor: FrameColor | undefined,
  rarity: CardRarity,
  isHovering: boolean,
): CSSProperties => {
  // フレーム色の決定
  let preset: FrameColorPreset;
  let customColor: string | undefined;

  if (frameColor) {
    preset = frameColor.preset;
    customColor = frameColor.customColor;
  } else {
    // フレーム色未設定の場合、レアリティのデフォルト色を使用
    preset = DEFAULT_FRAME_COLORS[rarity];
  }

  // カスタムカラーの場合
  if (preset === "custom" && customColor) {
    return {
      borderColor: isHovering ? lightenColor(customColor, 30) : customColor,
    };
  }

  const colorValue = FRAME_COLOR_VALUES[preset];

  // グラデーションの場合
  if (colorValue.gradient) {
    return {
      borderColor: "transparent",
      borderImage: `${colorValue.gradient} 1`,
      borderImageSlice: 1,
    };
  }

  // 通常色の場合
  return {
    borderColor: isHovering ? colorValue.hover : colorValue.normal,
  };
};

/**
 * 色を明るくするユーティリティ関数
 * @param hex HEXカラー
 * @param percent 明るくする割合（0-100）
 */
function lightenColor(hex: string, percent: number): string {
  // #を除去
  const cleanHex = hex.replace("#", "");

  // RGB値を取得
  const r = Number.parseInt(cleanHex.substring(0, 2), 16);
  const g = Number.parseInt(cleanHex.substring(2, 4), 16);
  const b = Number.parseInt(cleanHex.substring(4, 6), 16);

  // 明るくする
  const newR = Math.min(255, Math.floor(r + (255 - r) * (percent / 100)));
  const newG = Math.min(255, Math.floor(g + (255 - g) * (percent / 100)));
  const newB = Math.min(255, Math.floor(b + (255 - b) * (percent / 100)));

  // HEXに戻す
  return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
}
