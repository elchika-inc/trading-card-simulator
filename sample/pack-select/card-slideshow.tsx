import { useState, useEffect } from 'react'
import { Star, Info } from 'lucide-react'
import type { PackCard } from './pack-types'
import { DefaultCardVisual } from './card-visual'

interface CardSlideshowProps {
	cards: PackCard[]
	onCardClick?: (card: PackCard) => void
	CardComponent?: React.ComponentType<{ card: PackCard }>
}

/**
 * 注目カードのスライドショーコンポーネント
 */
export function CardSlideshow({
	cards,
	onCardClick,
	CardComponent = DefaultCardVisual,
}: CardSlideshowProps) {
	const [currentIndex, setCurrentIndex] = useState(0)

	// 自動スライド
	useEffect(() => {
		if (!cards || cards.length === 0) return
		const interval = setInterval(() => {
			setCurrentIndex((prev) => (prev + 1) % cards.length)
		}, 3000)
		return () => clearInterval(interval)
	}, [cards])

	if (!cards || cards.length === 0) return null

	const currentCard = cards[currentIndex]

	return (
		<div
			className="flex flex-col items-center bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-2xl animate-[fadeIn_0.5s_ease-out] cursor-pointer hover:bg-black/50 transition-colors group relative"
			onClick={() => onCardClick && onCardClick(currentCard)}
			onKeyDown={(e) => e.key === 'Enter' && onCardClick && onCardClick(currentCard)}
		>
			<div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
				<div className="bg-white/20 p-1 rounded-full text-white">
					<Info size={16} />
				</div>
			</div>

			<div className="flex items-center gap-2 mb-4 text-zinc-300">
				<Star size={16} className="text-yellow-500 fill-yellow-500" />
				<span className="text-sm font-bold tracking-wider uppercase">
					Featured Cards
				</span>
			</div>

			<div className="relative w-48 h-64 flex items-center justify-center mb-4 perspective-container">
				<div
					key={currentCard.id}
					className="animate-[slideUp_0.5s_ease-out]"
				>
					<div className="transform scale-125 origin-center transition-transform duration-300 group-hover:scale-[1.3]">
						<CardComponent card={currentCard} />
					</div>
				</div>
			</div>

			<div className="text-center">
				<div className="text-lg font-bold text-white mb-1 group-hover:text-yellow-300 transition-colors">
					{currentCard.name}
				</div>
				<div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full">
					<span
						className={`text-xs font-bold ${
							currentCard.rarity === 'SR' ? 'text-yellow-400' : 'text-zinc-300'
						}`}
					>
						Rarity: {currentCard.rarity}
					</span>
				</div>
			</div>

			<div className="flex gap-1.5 mt-6">
				{cards.map((_, idx) => (
					<div
						key={`${cards[idx]?.id}-${idx}`}
						className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
							idx === currentIndex ? 'bg-white w-4' : 'bg-white/30'
						}`}
					/>
				))}
			</div>
		</div>
	)
}
