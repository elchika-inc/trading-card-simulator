import type { PackCard } from './pack-types'

interface DefaultCardVisualProps {
	card: PackCard
	className?: string
}

/**
 * デフォルトのカードデザインコンポーネント
 */
export function DefaultCardVisual({
	card,
	className = '',
}: DefaultCardVisualProps) {
	const hasImage = !!card.image

	return (
		<div
			className={`
      w-32 h-44 rounded-lg shadow-lg relative overflow-hidden flex flex-col items-center justify-between p-2 border-2 border-white/10
      ${!hasImage ? card.color : 'bg-zinc-800'}
      ${className}
    `}
		>
			{/* 画像がある場合 */}
			{hasImage && (
				<img
					src={card.image}
					alt={card.name}
					className="absolute inset-0 w-full h-full object-cover"
				/>
			)}

			{/* 画像がない場合 (CSSデザイン) */}
			{!hasImage && (
				<>
					<div className="absolute inset-0 bg-gradient-to-br from-white/20 to-black/30 pointer-events-none" />

					{/* Rarity */}
					<div className="w-full flex justify-end relative z-10">
						<span className="text-[10px] font-bold text-yellow-400 drop-shadow-md">
							{card.rarity}
						</span>
					</div>

					{/* Icon */}
					<div className="text-5xl filter drop-shadow-lg relative z-10">
						{card.icon}
					</div>

					{/* Name */}
					<div className="w-full bg-black/40 rounded px-1 py-1 text-center relative z-10 backdrop-blur-sm">
						<span className="text-[10px] font-bold text-white block truncate">
							{card.name}
						</span>
					</div>
				</>
			)}

			{/* 共通: ホログラム風エフェクト (SRのみ) */}
			{card.rarity === 'SR' && (
				<div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-50 animate-pulse pointer-events-none mix-blend-overlay" />
			)}
		</div>
	)
}
