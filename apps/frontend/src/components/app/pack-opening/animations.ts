/**
 * パック開封用のCSSアニメーション定義
 */

export const cssAnimations = `
  .perspective-[1200px] { perspective: 1200px; }
  .transform-style-3d { transform-style: preserve-3d; }
  .backface-hidden { backface-visibility: hidden; }
  .rotate-y-0 { transform: rotateY(0deg); }
  .rotate-y-180 { transform: rotateY(180deg); }

  @keyframes flash {
    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
    50% { opacity: 1; transform: translate(-50%, -50%) scale(2); }
    100% { opacity: 0; transform: translate(-50%, -50%) scale(3); }
  }
  @keyframes shimmer {
    0% { transform: translateX(-100%) rotate(45deg); opacity: 0; }
    50% { opacity: 0.5; }
    100% { transform: translateX(100%) rotate(45deg); opacity: 0; }
  }
  .animate-flash { animation: flash 1.5s ease-out forwards; }
  .animate-shimmer { animation: shimmer 2s infinite linear; }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }

  @keyframes dealCard {
    from { opacity: 0; transform: translateX(0) translateY(100px) rotate(0); }
    to { opacity: 1; }
  }
  .animate-deal-card { animation-name: dealCard; animation-duration: 0.6s; animation-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1); }

  /* 結果一覧用アニメーション */
  @keyframes resultCard {
    from { opacity: 0; transform: translateY(50px) scale(0.9); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  .animate-result-card { animation-name: resultCard; animation-duration: 0.5s; animation-timing-function: ease-out; }

  @keyframes shimmerFast {
    0% { transform: translateX(-100%); opacity: 0; }
    50% { opacity: 1; }
    100% { transform: translateX(300%); opacity: 0; }
  }
  .animate-shimmer-fast { animation: shimmerFast 1.5s infinite ease-out; }

  @keyframes swipeHand {
    0% { transform: translateX(0) rotate(12deg); opacity: 0; }
    10% { opacity: 1; }
    70% { transform: translateX(100px) rotate(5deg); opacity: 1; }
    100% { transform: translateX(120px) rotate(0deg); opacity: 0; }
  }
  .animate-swipe-hand { animation: swipeHand 2s infinite cubic-bezier(0.2, 0.8, 0.2, 1); }

  @keyframes slideFade {
    0% { transform: translateX(0); opacity: 0; }
    20% { opacity: 1; }
    80% { transform: translateX(20px); opacity: 1; }
    100% { transform: translateX(30px); opacity: 0; }
  }
  .animate-slide-fade { animation: slideFade 2s infinite ease-out; animation-delay: 0.2s; }
`;
