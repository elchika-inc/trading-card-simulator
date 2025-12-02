// ==========================================
// CSS Animations (Keyframes)
// ==========================================

export const cssKeyframes = `
  @keyframes holoSpin {
    0% { background-position: 0% 0%; }
    100% { background-position: 200% 200%; }
  }
  @keyframes holoRotate {
    0% { transform: rotate(0deg) scale(1.5); }
    100% { transform: rotate(360deg) scale(1.5); }
  }
  @keyframes rainFall {
    0% { background-position: 0% 0%; }
    100% { background-position: 0% 200%; }
  }
  @keyframes radarSweep {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.4; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.1); }
  }
  @keyframes warpSpeed {
    0% { background-size: 100% 100%; opacity: 0.3; }
    50% { opacity: 0.8; }
    100% { background-size: 200% 200%; opacity: 0.3; }
  }
  @keyframes shootingStar {
    0% { background-position: 0% 0%; }
    100% { background-position: 200% 200%; }
  }
  @keyframes textShine {
    0% { background-position: 0% 50%; }
    100% { background-position: 100% 50%; }
  }
  @keyframes breathingText {
    0%, 100% { text-shadow: 0 0 10px rgba(255,255,255,0.5); }
    50% { text-shadow: 0 0 25px rgba(255,255,255,1), 0 0 10px rgba(255,255,255,0.5); }
  }
  @keyframes glitchAnim {
    0% { clip-path: inset(50% 0 30% 0); transform: translate(-5px,0); }
    20% { clip-path: inset(20% 0 60% 0); transform: translate(5px,0); }
    40% { clip-path: inset(40% 0 40% 0); transform: translate(-5px,0); }
    60% { clip-path: inset(80% 0 5% 0); transform: translate(5px,0); }
    80% { clip-path: inset(10% 0 70% 0); transform: translate(-5px,0); }
    100% { clip-path: inset(30% 0 50% 0); transform: translate(5px,0); }
  }
`;
