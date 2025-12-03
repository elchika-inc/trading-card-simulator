export const ASSETS = {
  pack: {
    file: 'assets/pack.png',
    fallback: 'https://placehold.co/400x600/3b82f6/ffffff?text=Pack+Image'
  },
  packBack: {
    file: 'assets/pack-back.png',
    fallback: 'https://placehold.co/400x600/1e40af/ffffff?text=Pack+Back'
  },
  cardBack: {
    file: 'assets/card-back.png',
    fallback: 'https://placehold.co/300x420/1e293b/64748b?text=Card+Back'
  },
  cards: [
    { file: 'assets/card-1.png', fallback: 'https://placehold.co/300x420/ffffff/000000?text=Common+1' },
    { file: 'assets/card-2.png', fallback: 'https://placehold.co/300x420/ffffff/000000?text=Common+2' },
    { file: 'assets/card-3.png', fallback: 'https://placehold.co/300x420/ffffff/000000?text=Uncommon' },
    { file: 'assets/card-4.png', fallback: 'https://placehold.co/300x420/ffffff/000000?text=Rare' },
    { file: 'assets/card-5.png', fallback: 'https://placehold.co/300x420/fbbf24/000000?text=Super+Rare', isRare: true },
  ]
};

export interface CardAsset {
  file: string;
  fallback: string;
  isRare?: boolean;
}

export interface Assets {
  pack: { file: string; fallback: string };
  packBack: { file: string; fallback: string };
  cardBack: { file: string; fallback: string };
  cards: CardAsset[];
}

export const SoundEffects = {
  playRip: () => console.log("Sound:ビリッ"),
  playFlip: () => console.log("Sound:シュッ"),
  playRare: () => console.log("Sound:キラキラ"),
  playSelect: () => console.log("Sound:ポチッ")
};
