import type { PackCard } from './pack-types'
import { DefaultCardVisual } from './card-visual'

interface StreamingCardsBackgroundProps {
	cards: PackCard[]
	CardComponent?: React.ComponentType<{ card: PackCard }>
}

/**
 * 背景でカードを流すコンポーネント
 */
export function StreamingCardsBackground({
	cards,
	CardComponent = DefaultCardVisual,
}: StreamingCardsBackgroundProps) {
	const scrollCards = [...cards, ...cards, ...cards, ...cards]

	return (
		<div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
			{/* 1段目 */}
			<div className="absolute top-[10%] left-0 flex gap-8 animate-[marquee_20s_linear_infinite] opacity-30 blur-[1px]">
				{scrollCards.map((card, i) => (
					<div key={`row1-${i}`} className="transform rotate-6 scale-90">
						<CardComponent card={card} />
					</div>
				))}
			</div>

			{/* 2段目 */}
			<div className="absolute top-[40%] left-0 flex gap-8 animate-[marquee-reverse_25s_linear_infinite] opacity-20 blur-[2px]">
				{scrollCards.map((card, i) => (
					<div key={`row2-${i}`} className="transform -rotate-6 scale-75">
						<CardComponent card={card} />
					</div>
				))}
			</div>

			{/* 3段目 */}
			<div className="absolute top-[70%] left-0 flex gap-8 animate-[marquee_30s_linear_infinite] opacity-10 blur-[3px]">
				{scrollCards.map((card, i) => (
					<div key={`row3-${i}`} className="transform rotate-3 scale-50">
						<CardComponent card={card} />
					</div>
				))}
			</div>

			<div className="absolute inset-0 bg-black/40" />
		</div>
	)
}
