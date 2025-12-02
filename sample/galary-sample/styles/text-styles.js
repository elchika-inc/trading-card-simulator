// ==========================================
// Text Style Definitions
// ==========================================

/**
 * テキスト（名前）スタイルの定義
 * isHoveringフラグを受け取り、アニメーションの再生状態を制御
 */
export const getTextStyle = (styleType, pos, isHovering) => {
  const base = {
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    backgroundSize: '200% auto',
    transition: 'all 0.1s ease-out',
  };
  const dx = (pos.x - 50) / 50;
  const dy = (pos.y - 50) / 50;
  const playState = isHovering ? 'running' : 'paused';

  switch (styleType) {
    // Metal
    case 'gold': return { ...base, backgroundPosition: `${pos.x}% ${pos.y}%`, backgroundImage: 'linear-gradient(to bottom, #cfc09f 22%, #634f2c 24%, #cfc09f 26%, #cfc09f 27%, #ffecb3 40%, #3a2c0f 78%)', color: 'transparent', textShadow: `${-dx * 2}px ${-dy * 2 + 1}px 0 #8b7d52`, filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))' };
    case 'silver': return { ...base, backgroundPosition: `${pos.x}% ${pos.y}%`, backgroundImage: 'linear-gradient(to bottom, #eee 0%, #333 50%, #eee 100%)', color: 'transparent', textShadow: `${-dx}px ${-dy + 1}px 0 #fff`, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))' };
    case 'steel': return { ...base, backgroundImage: 'linear-gradient(180deg, #5c6375, #9ca3af, #374151)', color: 'transparent', textShadow: `1px 1px 2px rgba(0,0,0,0.8)` };

    // Light / Energy
    case 'neon': return { ...base, color: '#fff', textShadow: `${-dx * 2}px ${-dy * 2}px 5px #0ff, ${-dx * 4}px ${-dy * 4}px 10px #0ff, 0 0 20px #0ff, 0 0 40px #0ff` };
    case 'neon-pink': return { ...base, color: '#fff', textShadow: `${-dx * 2}px ${-dy * 2}px 5px #f0f, ${-dx * 4}px ${-dy * 4}px 10px #f0f, 0 0 20px #f0f, 0 0 40px #f0f` };
    case 'plasma': return { ...base, backgroundImage: 'linear-gradient(45deg, #f0f, #0ff)', color: 'transparent', filter: `drop-shadow(0 0 5px rgba(255,255,255,0.8))`, textShadow: '0 0 10px #f0f' };

    // Nature / Elements
    case 'fire': return { ...base, backgroundPosition: `${pos.x}% ${100 - pos.y}%`, backgroundImage: 'linear-gradient(0deg, #f00 0%, #ff0 50%, #fff 100%)', color: 'transparent', filter: `drop-shadow(${dx * 2}px ${dy * 2}px 4px rgba(255, 100, 0, 0.8))` };
    case 'ice': return { ...base, backgroundImage: 'linear-gradient(to bottom, #fff, #a5f3fc, #0891b2)', color: 'transparent', textShadow: '0 0 10px #22d3ee', filter: 'brightness(1.2)' };
    case 'emerald': return { ...base, backgroundImage: 'linear-gradient(135deg, #a7f3d0, #059669, #064e3b)', color: 'transparent', textShadow: '0 1px 2px #065f46' };

    // Special
    case 'holo': return { ...base, backgroundPosition: `${100 - pos.x}% center`, backgroundImage: 'linear-gradient(115deg, transparent 0%, #ff0000 25%, #00ff00 50%, #0000ff 75%, transparent 100%)', color: 'transparent', backgroundColor: '#fff', backgroundBlendMode: 'overlay' };
    case 'glitch': return { ...base, color: '#fff', textShadow: `${dx * 4}px 0 #f00, ${-dx * 4}px 0 #0ff`, letterSpacing: '2px' };
    case 'retro': return { ...base, backgroundImage: 'linear-gradient(to bottom, #f0abfc, #8b5cf6, #fca5a5)', color: 'transparent', textShadow: '2px 2px 0px #4c1d95', letterSpacing: '1px' };
    case 'comic': return { ...base, color: '#fbbf24', WebkitTextStroke: '2px #000', textShadow: '3px 3px 0 #ef4444', fontWeight: '900', letterSpacing: '1px' };
    case 'outline': return { ...base, color: 'transparent', WebkitTextStroke: '1px #fff', textShadow: `${-dx * 4}px ${-dy * 4}px 5px rgba(255,255,255,0.5)` };
    case '3d-pop': return { ...base, color: '#fff', textShadow: `1px 1px 0 #000, 2px 2px 0 #000, 3px 3px 0 #000, 4px 4px 0 #000, ${-dx * 10}px ${-dy * 10}px 10px rgba(0,0,0,0.5)` };
    case 'matrix-text': return { ...base, color: '#0f0', fontFamily: 'monospace', textShadow: '0 0 5px #0f0', letterSpacing: '1px' };
    case 'magma-text': return { ...base, backgroundImage: 'linear-gradient(0deg, #500 0%, #d00 50%, #fb0 100%)', color: 'transparent', filter: 'drop-shadow(0 0 4px #f00)', WebkitTextStroke: '0.5px #500' };
    case 'glass': return { ...base, color: 'rgba(255,255,255,0.2)', textShadow: '0 0 10px rgba(255,255,255,0.5)', backdropFilter: 'blur(2px)', WebkitTextStroke: '1px rgba(255,255,255,0.4)' };

    // New Text Styles (Phase 5 & 6)
    case 'toxic': return { ...base, backgroundImage: 'linear-gradient(180deg, #aaff00, #5500ff)', color: 'transparent', textShadow: '0 2px 5px #5500ff', filter: 'contrast(1.5)' };
    case 'deep-space': return { ...base, backgroundImage: 'linear-gradient(45deg, #000044, #440088)', color: 'transparent', textShadow: '0 0 2px #aaa', WebkitTextStroke: '0.5px #88ccff' };
    case 'runic': return { ...base, color: '#ffd700', textShadow: '0 0 5px #ffaa00, 0 0 10px #ff4400', fontFamily: 'serif', letterSpacing: '2px' };
    case 'ice-shard': return { ...base, backgroundImage: 'linear-gradient(to bottom, #e0f7fa, #006064)', color: 'transparent', textShadow: '1px 1px 2px rgba(255,255,255,0.8)', WebkitTextStroke: '0.5px #00bcd4' };
    case 'blueprint-text': return { ...base, color: '#fff', fontFamily: 'monospace', textShadow: '1px 1px 0 rgba(0,0,0,0.5)', WebkitTextStroke: '0.5px #fff' };
    case 'vapor': return { ...base, backgroundImage: 'linear-gradient(to right, #ff00cc, #3333ff)', color: 'transparent', textShadow: '2px 2px 0px rgba(0,255,255,0.5)', fontStyle: 'italic' };

    // New Text Styles (Phase 7: Ethereal)
    case 'glitch-pro': return { ...base, color: '#fff', textShadow: `${dx*5}px 0 #f00, ${-dx*5}px 0 #00f, 0 ${dy*5}px #0f0`, letterSpacing: '3px' };
    case 'liquid-chrome': return { ...base, backgroundImage: 'linear-gradient(to bottom, #ccc, #fff, #888, #ccc)', color: 'transparent', filter: 'contrast(2)', transform: `scaleY(${1 + Math.abs(dy)*0.2})` };
    case 'ghost-fade': return { ...base, color: 'rgba(255,255,255,0.5)', textShadow: '0 0 20px rgba(255,255,255,0.8)', filter: 'blur(0.5px)' };
    case 'prism-shard': return { ...base, backgroundImage: 'linear-gradient(45deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f)', color: 'transparent', textShadow: '1px 1px 0 rgba(255,255,255,0.3)' };

    // Animated Text Styles (Phase 8)
    case 'animated-glitch': return { ...base, color: '#fff', textShadow: `${dx*5}px 0 #f00, ${-dx*5}px 0 #00f, 0 ${dy*5}px #0f0`, letterSpacing: '3px', animation: `textShine 0.2s infinite ${playState}` };
    case 'breathing-glow': return { ...base, color: '#fff', animation: `breathingText 2s ease-in-out infinite ${playState}` };

    // New Text Styles (Phase 10: Cute)
    case 'cotton-candy': return { ...base, backgroundImage: 'linear-gradient(to right, #ff9a9e, #fecfef, #a18cd1)', color: 'transparent', textShadow: '1px 1px 2px rgba(255,255,255,0.5)', WebkitTextStroke: '0.5px rgba(255,255,255,0.8)' };
    case 'bubblegum': return { ...base, color: '#ff69b4', textShadow: '2px 2px 0px #00ffff, -2px -2px 0px #ffff00', fontWeight: 'bold', letterSpacing: '1px' };

    // New Text Styles (Phase 11: Cool)
    case 'frostbite': return { ...base, backgroundImage: 'linear-gradient(to bottom, #e0f7fa, #80deea, #26c6da)', color: 'transparent', textShadow: '0 0 10px rgba(200,240,255,0.8)', WebkitTextStroke: '0.5px #00bcd4', filter: 'brightness(1.2)' };
    case 'cyberpunk': return { ...base, color: '#0ff', textShadow: `${dx*3}px ${dy*3}px 0px #f0f, ${-dx*3}px ${-dy*3}px 0px #ff0`, fontFamily: 'monospace', letterSpacing: '2px', animation: `textShine 0.1s infinite ${playState}` };

    // New Text Styles (Phase 12: Dark)
    case 'shadow-whispers': return { ...base, backgroundImage: 'linear-gradient(to bottom, #333, #000)', color: 'transparent', textShadow: '0 0 5px rgba(255,0,0,0.3)', WebkitTextStroke: '0.5px rgba(100,0,0,0.5)' };
    case 'void-script': return { ...base, color: '#000', textShadow: '0 0 2px #0ff', backgroundColor: '#000022', backgroundClip: 'text', fontFamily: 'monospace', letterSpacing: '1px', animation: `glitchAnim 0.5s infinite ${playState}` };

    default: return { color: '#f1f5f9', textShadow: `${-dx}px ${-dy + 2}px 4px rgba(0,0,0,0.5)` };
  }
};
