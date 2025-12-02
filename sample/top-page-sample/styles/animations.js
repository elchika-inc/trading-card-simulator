/**
 * CSSアニメーション定義とフォント設定
 */

export const cssStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Zen+Kaku+Gothic+New:wght@400;700&display=swap');

  body {
    font-family: 'Zen Kaku Gothic New', sans-serif;
  }
  .font-orbitron {
    font-family: 'Orbitron', sans-serif;
  }

  /* 浮遊アニメーション */
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
  }
  .animate-float {
    animation: float 6s ease-in-out infinite;
  }

  /* スライドショー切り替えアニメーション */
  @keyframes fadeOutLeft {
    from { opacity: 1; transform: translateX(0) scale(1) rotateY(0deg); }
    to { opacity: 0; transform: translateX(-60px) scale(0.8) rotateY(-10deg); }
  }
  @keyframes fadeInRight {
    from { opacity: 0; transform: translateX(60px) scale(0.8) rotateY(10deg); }
    to { opacity: 1; transform: translateX(0) scale(1) rotateY(0deg); }
  }
  @keyframes fadeOutRight {
    from { opacity: 1; transform: translateX(0) scale(1) rotateY(0deg); }
    to { opacity: 0; transform: translateX(60px) scale(0.8) rotateY(10deg); }
  }
  @keyframes fadeInLeft {
    from { opacity: 0; transform: translateX(-60px) scale(0.8) rotateY(-10deg); }
    to { opacity: 1; transform: translateX(0) scale(1) rotateY(0deg); }
  }

  /* イージングを調整してより自然に */
  .card-anim-enter-right { animation: fadeInRight 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
  .card-anim-exit-left { animation: fadeOutLeft 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
  .card-anim-enter-left { animation: fadeInLeft 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
  .card-anim-exit-right { animation: fadeOutRight 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
`;
