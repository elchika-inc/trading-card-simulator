/**
 * パックタイプの型定義
 */
export interface PackCard {
	id: string
	name: string
	icon: string
	color: string
	rarity: 'SR' | 'R' | 'UC' | 'C'
	image: string | null
	description: string
}

export interface PackType {
	id: string
	name: string
	subTitle?: string
	description: string
	contentsInfo: string
	colorFrom: string
	colorTo: string
	accentColor: string
	icon: string
	rareRate: string
	price: number
	image: string | null
	featuredCards: PackCard[]
	backTitle?: string
	featureTitle?: string
}

/**
 * パックの種類データ
 */
export const PACK_TYPES: PackType[] = [
	{
		id: 'dragon-flame',
		name: 'エンシェント・フレイム',
		subTitle: 'Legendary Series',
		description: '伝説の炎竜が封印されたパック',
		contentsInfo: '1パック / 5枚入り',
		colorFrom: 'from-red-500',
		colorTo: 'to-orange-600',
		accentColor: 'bg-red-600',
		icon: '🔥',
		rareRate: 'SR確率UP',
		price: 150,
		image: null,
		featuredCards: [
			{
				id: 'df-1',
				name: '炎竜王',
				icon: '🐉',
				color: 'bg-red-800',
				rarity: 'SR',
				image: null,
				description: '全てを焼き尽くす最強の竜。',
			},
			{
				id: 'df-2',
				name: 'フレア',
				icon: '🔥',
				color: 'bg-orange-600',
				rarity: 'R',
				image: null,
				description: '燃え盛る炎の精霊。',
			},
			{
				id: 'df-3',
				name: '騎士',
				icon: '⚔️',
				color: 'bg-red-600',
				rarity: 'R',
				image: null,
				description: '竜を狩る熟練の戦士。',
			},
			{
				id: 'df-4',
				name: '火山',
				icon: '🌋',
				color: 'bg-orange-800',
				rarity: 'UC',
				image: null,
				description: 'マグマが噴出する大地。',
			},
			{
				id: 'df-5',
				name: '卵',
				icon: '🥚',
				color: 'bg-yellow-700',
				rarity: 'C',
				image: null,
				description: '謎に包まれた竜の卵。',
			},
		],
	},
	{
		id: 'ocean-depths',
		name: 'アビス・ブルー',
		description: '深海の守護神が眠るパック',
		contentsInfo: '1パック / 5枚入り',
		colorFrom: 'from-blue-500',
		colorTo: 'to-cyan-600',
		accentColor: 'bg-blue-600',
		icon: '💧',
		rareRate: '水タイプ強化',
		price: 150,
		image: null,
		featuredCards: [
			{
				id: 'od-1',
				name: '海神',
				icon: '🔱',
				color: 'bg-blue-900',
				rarity: 'SR',
				image: null,
				description: '深海を統べる絶対的な神。',
			},
			{
				id: 'od-2',
				name: '人魚',
				icon: '🧜‍♀️',
				color: 'bg-cyan-600',
				rarity: 'R',
				image: null,
				description: '美しい歌声で船を惑わす。',
			},
			{
				id: 'od-3',
				name: 'クジラ',
				icon: '🐋',
				color: 'bg-blue-700',
				rarity: 'R',
				image: null,
				description: '海を回遊する巨大生物。',
			},
			{
				id: 'od-4',
				name: '波',
				icon: '🌊',
				color: 'bg-cyan-800',
				rarity: 'UC',
				image: null,
				description: '荒れ狂う大波。',
			},
			{
				id: 'od-5',
				name: '貝',
				icon: '🐚',
				color: 'bg-teal-700',
				rarity: 'C',
				image: null,
				description: '硬い殻に守られた真珠。',
			},
		],
	},
	{
		id: 'thunder-spark',
		name: 'ボルテージ・スパーク',
		subTitle: 'High Voltage',
		description: '雷鳴とともに現れる幻のポケモン',
		contentsInfo: '1パック / 10枚入り',
		colorFrom: 'from-yellow-400',
		colorTo: 'to-yellow-600',
		accentColor: 'bg-yellow-500',
		icon: '⚡',
		rareRate: 'グッズ排出UP',
		featureTitle: 'ボーナス',
		price: 300,
		image: null,
		featuredCards: [
			{
				id: 'ts-1',
				name: '雷獣',
				icon: '🐯',
				color: 'bg-yellow-700',
				rarity: 'SR',
				image: null,
				description: '稲妻のような速さで駆ける獣。',
			},
			{
				id: 'ts-2',
				name: 'ボルト',
				icon: '⚡️',
				color: 'bg-yellow-600',
				rarity: 'R',
				image: null,
				description: '高圧電流を操る。',
			},
			{
				id: 'ts-3',
				name: '電池',
				icon: '🔋',
				color: 'bg-amber-600',
				rarity: 'R',
				image: null,
				description: 'エネルギーを蓄える装置。',
			},
			{
				id: 'ts-4',
				name: '雲',
				icon: '☁️',
				color: 'bg-gray-600',
				rarity: 'UC',
				image: null,
				description: '雷を呼ぶ黒雲。',
			},
			{
				id: 'ts-5',
				name: '火花',
				icon: '✨',
				color: 'bg-yellow-500',
				rarity: 'C',
				image: null,
				description: 'パチパチとはじける光。',
			},
		],
	},
]
