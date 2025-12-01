/**
 * カードのスタイル関数
 * ホログラムエフェクトとテキストスタイルを生成
 */

import type { HoloType, } from "@repo/types";
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
export const getHoloStyle = (
	type: HoloType,
	pos: Position,
	isHovering: boolean,
): CSSProperties => {
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

