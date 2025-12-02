import { Coins } from 'lucide-react'

interface CoinDisplayProps {
	amount: number
}

/**
 * コイン残高表示コンポーネント
 */
export function CoinDisplay({ amount }: CoinDisplayProps) {
	return (
		<div className="flex items-center gap-2 bg-zinc-800/80 backdrop-blur-md px-4 py-2 rounded-full border border-yellow-500/30 shadow-lg z-50 fixed top-4 right-4 animate-[fadeIn_0.5s_ease-out]">
			<div className="relative">
				<Coins className="text-yellow-400 w-5 h-5 fill-yellow-500/20" />
				<div className="absolute inset-0 bg-yellow-400 blur-sm opacity-30 animate-pulse" />
			</div>
			<span className="text-yellow-100 font-bold font-mono tracking-wide text-lg">
				{amount.toLocaleString()}
			</span>
		</div>
	)
}
