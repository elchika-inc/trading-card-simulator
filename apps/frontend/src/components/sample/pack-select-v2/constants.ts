export const ASSETS = {
  pack: {
    file: "/assets/packs/pack.png",
    fallback: "https://placehold.co/400x600/3b82f6/ffffff?text=Pack+Image",
  },
  packBack: {
    file: "/assets/packs/pack-back.png",
    fallback: "https://placehold.co/400x600/1e40af/ffffff?text=Pack+Back",
  },
  cardBack: {
    file: "/assets/card-back.png",
    fallback: "https://placehold.co/300x420/1e293b/64748b?text=Card+Back",
  },
  cards: [
    {
      file: "/assets/cards/1-1-1.png",
      fallback: "https://placehold.co/300x420/ffffff/000000?text=Common+1",
    },
    {
      file: "/assets/cards/1-1-2.png",
      fallback: "https://placehold.co/300x420/ffffff/000000?text=Common+2",
    },
    {
      file: "/assets/cards/1-1-3.png",
      fallback: "https://placehold.co/300x420/ffffff/000000?text=Uncommon",
    },
    {
      file: "/assets/cards/1-2-1.png",
      fallback: "https://placehold.co/300x420/ffffff/000000?text=Rare",
    },
    {
      file: "/assets/cards/1-2-2.png",
      fallback: "https://placehold.co/300x420/fbbf24/000000?text=Super+Rare",
      isRare: true,
    },
  ],
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
  playSelect: () => console.log("Sound:ポチッ"),
};
