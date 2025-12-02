import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowLeft, RefreshCw, Layers, Coins, ChevronLeft, ChevronRight, Star, X, Info } from 'lucide-react';

/**
 * 設定データ: パックの種類
 */
const PACK_TYPES = [
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
      { id: 'df-1', name: '炎竜王', icon: '🐉', color: 'bg-red-800', rarity: 'SR', image: null, description: '全てを焼き尽くす最強の竜。' },
      { id: 'df-2', name: 'フレア', icon: '🔥', color: 'bg-orange-600', rarity: 'R', image: null, description: '燃え盛る炎の精霊。' },
      { id: 'df-3', name: '騎士', icon: '⚔️', color: 'bg-red-600', rarity: 'R', image: null, description: '竜を狩る熟練の戦士。' },
      { id: 'df-4', name: '火山', icon: '🌋', color: 'bg-orange-800', rarity: 'UC', image: null, description: 'マグマが噴出する大地。' },
      { id: 'df-5', name: '卵', icon: '🥚', color: 'bg-yellow-700', rarity: 'C', image: null, description: '謎に包まれた竜の卵。' },
    ]
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
      { id: 'od-1', name: '海神', icon: '🔱', color: 'bg-blue-900', rarity: 'SR', image: null, description: '深海を統べる絶対的な神。' },
      { id: 'od-2', name: '人魚', icon: '🧜‍♀️', color: 'bg-cyan-600', rarity: 'R', image: null, description: '美しい歌声で船を惑わす。' },
      { id: 'od-3', name: 'クジラ', icon: '🐋', color: 'bg-blue-700', rarity: 'R', image: null, description: '海を回遊する巨大生物。' },
      { id: 'od-4', name: '波', icon: '🌊', color: 'bg-cyan-800', rarity: 'UC', image: null, description: '荒れ狂う大波。' },
      { id: 'od-5', name: '貝', icon: '🐚', color: 'bg-teal-700', rarity: 'C', image: null, description: '硬い殻に守られた真珠。' },
    ]
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
      { id: 'ts-1', name: '雷獣', icon: '🐯', color: 'bg-yellow-700', rarity: 'SR', image: null, description: '稲妻のような速さで駆ける獣。' },
      { id: 'ts-2', name: 'ボルト', icon: '⚡️', color: 'bg-yellow-600', rarity: 'R', image: null, description: '高圧電流を操る。' },
      { id: 'ts-3', name: '電池', icon: '🔋', color: 'bg-amber-600', rarity: 'R', image: null, description: 'エネルギーを蓄える装置。' },
      { id: 'ts-4', name: '雲', icon: '☁️', color: 'bg-gray-600', rarity: 'UC', image: null, description: '雷を呼ぶ黒雲。' },
      { id: 'ts-5', name: '火花', icon: '✨', color: 'bg-yellow-500', rarity: 'C', image: null, description: 'パチパチとはじける光。' },
    ]
  }
];

// -----------------------------------------------------------------------------
// Component: DefaultCardVisual
// デフォルトのカードデザインコンポーネント
// -----------------------------------------------------------------------------
const DefaultCardVisual = ({ card, className = "" }) => {
  const hasImage = !!card.image;

  return (
    <div className={`
      w-32 h-44 rounded-lg shadow-lg relative overflow-hidden flex flex-col items-center justify-between p-2 border-2 border-white/10
      ${!hasImage ? card.color : 'bg-zinc-800'}
      ${className}
    `}>
      {/* 画像がある場合 */}
      {hasImage && (
        <img src={card.image} alt={card.name} className="absolute inset-0 w-full h-full object-cover" />
      )}

      {/* 画像がない場合 (CSSデザイン) */}
      {!hasImage && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-black/30 pointer-events-none" />
          
          {/* Rarity */}
          <div className="w-full flex justify-end relative z-10">
            <span className="text-[10px] font-bold text-yellow-400 drop-shadow-md">{card.rarity}</span>
          </div>

          {/* Icon */}
          <div className="text-5xl filter drop-shadow-lg relative z-10">{card.icon}</div>

          {/* Name */}
          <div className="w-full bg-black/40 rounded px-1 py-1 text-center relative z-10 backdrop-blur-sm">
            <span className="text-[10px] font-bold text-white block truncate">{card.name}</span>
          </div>
        </>
      )}

      {/* 共通: ホログラム風エフェクト (SRのみ) */}
      {card.rarity === 'SR' && (
         <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-50 animate-pulse pointer-events-none mix-blend-overlay" />
      )}
    </div>
  );
};

// -----------------------------------------------------------------------------
// Component: CardDetailModal (New)
// カードの詳細を表示するモーダル
// -----------------------------------------------------------------------------
const CardDetailModal = ({ card, onClose, CardComponent = DefaultCardVisual }) => {
  if (!card) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
      {/* 背景オーバーレイ */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* モーダルコンテンツ */}
      <div className="relative z-10 flex flex-col items-center max-w-md w-full animate-[zoomIn_0.3s_cubic-bezier(0.16,1,0.3,1)]">
        
        {/* 閉じるボタン */}
        <button 
          onClick={onClose}
          className="absolute -top-12 right-0 md:-right-12 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
        >
          <X size={24} />
        </button>

        {/* カード拡大表示 */}
        <div className="transform scale-150 mb-12 shadow-2xl">
          <CardComponent card={card} />
        </div>

        {/* 詳細情報 */}
        <div className="bg-zinc-900/90 border border-white/10 rounded-xl p-6 w-full text-center shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className={`text-sm font-bold px-2 py-0.5 rounded ${card.rarity === 'SR' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-zinc-700 text-zinc-300'}`}>
              {card.rarity}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">{card.name}</h3>
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-white/20 to-transparent mx-auto mb-4" />
          <p className="text-zinc-400 text-sm leading-relaxed">
            {card.description || "このカードに関する詳細情報はまだありません。"}
          </p>
        </div>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// Component: CardSlideshow
// 注目カードのスライドショーコンポーネント
// ★ クリックイベントを追加
// -----------------------------------------------------------------------------
const CardSlideshow = ({ cards, onCardClick, CardComponent = DefaultCardVisual }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 自動スライド
  useEffect(() => {
    if (!cards || cards.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 3000); 
    return () => clearInterval(interval);
  }, [cards]);

  if (!cards || cards.length === 0) return null;

  const currentCard = cards[currentIndex];

  return (
    <div 
      className="flex flex-col items-center bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-2xl animate-[fadeIn_0.5s_ease-out] cursor-pointer hover:bg-black/50 transition-colors group relative"
      onClick={() => onCardClick && onCardClick(currentCard)}
    >
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
         <div className="bg-white/20 p-1 rounded-full text-white"><Info size={16} /></div>
      </div>

      <div className="flex items-center gap-2 mb-4 text-zinc-300">
        <Star size={16} className="text-yellow-500 fill-yellow-500" />
        <span className="text-sm font-bold tracking-wider uppercase">Featured Cards</span>
      </div>

      <div className="relative w-48 h-64 flex items-center justify-center mb-4 perspective-container">
        <div key={currentCard.id} className="animate-[slideUp_0.5s_ease-out]">
          <div className="transform scale-125 origin-center transition-transform duration-300 group-hover:scale-[1.3]">
            <CardComponent card={currentCard} />
          </div>
        </div>
      </div>

      <div className="text-center">
        <div className="text-lg font-bold text-white mb-1 group-hover:text-yellow-300 transition-colors">{currentCard.name}</div>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full">
           <span className={`text-xs font-bold ${currentCard.rarity === 'SR' ? 'text-yellow-400' : 'text-zinc-300'}`}>
             Rarity: {currentCard.rarity}
           </span>
        </div>
      </div>

      <div className="flex gap-1.5 mt-6">
        {cards.map((_, idx) => (
          <div 
            key={idx} 
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-white w-4' : 'bg-white/30'}`} 
          />
        ))}
      </div>
    </div>
  );
};


// -----------------------------------------------------------------------------
// Component: StreamingCardsBackground
// 背景でカードを流すコンポーネント
// -----------------------------------------------------------------------------
const StreamingCardsBackground = ({ cards, CardComponent = DefaultCardVisual }) => {
  const scrollCards = [...cards, ...cards, ...cards, ...cards]; 

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
  );
};

// -----------------------------------------------------------------------------
// Component: PackVisual
// パックの見た目を描画するコンポーネント
// -----------------------------------------------------------------------------
const PackVisual = React.memo(({ type, isHovered, isSelected, showBack = false }) => {
  const packData = PACK_TYPES.find(p => p.id === type) || PACK_TYPES[0];
  const hasImage = !!packData.image;

  const texts = {
    subTitle: packData.subTitle || "Trading Card Game",
    contentsInfo: packData.contentsInfo || "1パック / 5枚入り",
    backTitle: packData.backTitle || "PACK INFO",
    featureTitle: packData.featureTitle || "Pickup Feature"
  };

  return (
    <div className={`relative w-64 h-96 transition-all duration-500 transform-style-3d ${showBack ? 'rotate-y-180' : ''}`}>
      {/* 表面 */}
      <div 
        className={`absolute inset-0 w-full h-full rounded-xl shadow-2xl backface-hidden
          ${!hasImage ? `bg-gradient-to-br ${packData.colorFrom} ${packData.colorTo}` : 'bg-zinc-800'}
          flex flex-col items-center justify-between overflow-hidden
          transition-transform duration-300
          ${isHovered ? 'brightness-110' : ''} 
        `}
        style={{
          boxShadow: isSelected ? '0 0 40px rgba(255, 255, 255, 0.4)' : '0 20px 30px rgba(0,0,0,0.5)',
          zIndex: 2,
        }}
      >
        {/* --- 画像表示モード --- */}
        {hasImage && (
          <img 
            src={packData.image} 
            alt={packData.name} 
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
        )}

        {/* --- CSS生成モード --- */}
        {!hasImage && (
          <>
            <div className="absolute inset-0 border-t-4 border-b-4 border-gray-200/50 pointer-events-none z-10" />
            <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-gray-300 to-gray-100 opacity-50 z-10" />
            
            <div className="mt-6 text-white/90 text-sm font-bold tracking-widest uppercase text-center border-b border-white/30 pb-1 z-10 relative px-4">
              {texts.subTitle}
            </div>

            <div className="flex flex-col items-center justify-center flex-1 w-full relative z-10">
              <div className="text-9xl filter drop-shadow-xl transform transition-transform duration-500">
                {packData.icon}
              </div>
              <h3 className="text-white text-3xl font-black text-center mt-4 leading-tight drop-shadow-md px-2">
                {packData.name}
              </h3>
            </div>

            <div className="w-full relative z-10 pb-6 px-6">
               <div className="bg-black/20 rounded-full px-3 py-1">
                <p className="text-white/80 text-xs text-center font-medium">
                  {texts.contentsInfo}
                </p>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-gray-300 to-gray-100 opacity-50 z-10" />
             <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-multiply z-0" />
          </>
        )}

        {/* --- 共通エフェクト --- */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none mix-blend-overlay z-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none z-20" />
      </div>

      {/* 裏面 */}
      <div 
        className="absolute inset-0 w-full h-full rounded-xl shadow-xl backface-hidden rotate-y-180 bg-zinc-800 border-2 border-zinc-700 flex flex-col items-center justify-center p-8 text-center"
        style={{ zIndex: 1 }}
      >
        <div className="text-zinc-500 mb-4"><RefreshCw className="w-10 h-10 mx-auto" /></div>
        <h4 className="text-white font-bold mb-2">{texts.backTitle}</h4>
        <p className="text-zinc-400 text-sm leading-relaxed mb-4">
          {packData.description}
        </p>
        <div className="w-full p-3 bg-zinc-900/50 rounded-lg border border-zinc-700">
          <p className="text-xs text-zinc-500 uppercase mb-1">{texts.featureTitle}</p>
          <p className="text-yellow-500 font-bold">{packData.rareRate}</p>
        </div>
        <div className="mt-6 w-full h-1 bg-zinc-700 rounded-full overflow-hidden">
           <div className={`h-full w-2/3 ${packData.accentColor}`} />
        </div>
      </div>
    </div>
  );
});

// -----------------------------------------------------------------------------
// Component: CoinDisplay
// -----------------------------------------------------------------------------
const CoinDisplay = ({ amount }) => (
  <div className="flex items-center gap-2 bg-zinc-800/80 backdrop-blur-md px-4 py-2 rounded-full border border-yellow-500/30 shadow-lg z-50 fixed top-4 right-4 animate-[fadeIn_0.5s_ease-out]">
    <div className="relative">
      <Coins className="text-yellow-400 w-5 h-5 fill-yellow-500/20" />
      <div className="absolute inset-0 bg-yellow-400 blur-sm opacity-30 animate-pulse"></div>
    </div>
    <span className="text-yellow-100 font-bold font-mono tracking-wide text-lg">
      {amount.toLocaleString()}
    </span>
  </div>
);

// -----------------------------------------------------------------------------
// Main Application
// -----------------------------------------------------------------------------
export default function App() {
  const [view, setView] = useState('select-type');
  const [selectedType, setSelectedType] = useState(null);
  const [isRotating, setIsRotating] = useState(false);
  const [myCoins, setMyCoins] = useState(500);

  // モーダル用のステート
  const [selectedCardForModal, setSelectedCardForModal] = useState(null);

  // カルーセル用状態: 初期は真ん中の要素(index: 1)を選択
  const [activeIndex, setActiveIndex] = useState(1);

  // パック選択時の処理
  const handleTypeSelect = (typeId) => {
    setSelectedType(typeId);
    setIsRotating(false);
    setView('preview');
  };

  // カルーセル操作: 前へ
  const prevPack = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : PACK_TYPES.length - 1));
  };

  // カルーセル操作: 次へ
  const nextPack = () => {
    setActiveIndex((prev) => (prev < PACK_TYPES.length - 1 ? prev + 1 : 0));
  };

  // 開封演出へ & コイン消費
  const handleOpenPack = () => {
    const pack = PACK_TYPES.find(p => p.id === selectedType);
    if (!pack) return;

    if (myCoins >= pack.price) {
      setMyCoins(prev => prev - pack.price);
      setView('opening');
      setTimeout(() => {
        setView('result');
      }, 2500);
    } else {
      alert("コインが足りません！");
    }
  };

  const reset = () => {
    setView('select-type');
    setSelectedType(null);
    setIsRotating(false);
  };

  const backToTypeSelect = () => {
    setView('select-type');
    setIsRotating(false);
  };

  return (
    <>
      <style>{`
        .perspective-container {
          perspective: 1200px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        @keyframes slideUp {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoomIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        /* 反射エフェクト用のマスク */
        .reflection-mask {
          mask-image: linear-gradient(to bottom, transparent 50%, black 100%);
          -webkit-mask-image: linear-gradient(to bottom, transparent 50%, black 100%);
        }
      `}</style>

      {/* 常時表示するコイン残高 */}
      <CoinDisplay amount={myCoins} />

      {/* カード詳細モーダル */}
      {selectedCardForModal && (
        <CardDetailModal 
          card={selectedCardForModal} 
          onClose={() => setSelectedCardForModal(null)} 
          CardComponent={DefaultCardVisual}
        />
      )}

      {/* ---------------------------------------------------------------------------
          View 1: 3Dカルーセル選択画面 (Cover Flow / Flip 3D style)
         --------------------------------------------------------------------------- */}
      {view === 'select-type' && (
        <div className="min-h-screen bg-zinc-900 text-white flex flex-col items-center justify-center font-sans select-none overflow-hidden relative">
          
          {/* 背景の装飾 */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-900 to-black z-0" />
          
          <header className="absolute top-12 left-0 right-0 text-center space-y-3 z-20" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 text-xs font-medium border border-zinc-700">
              <Layers size={14} />
              <span>Expansion Set Vol.1</span>
            </div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              パックを選択
            </h1>
            <p className="text-zinc-500 text-sm">左右にスワイプまたはクリックして選択</p>
          </header>

          {/* 3D Carousel Area */}
          <div className="relative w-full h-[600px] flex items-center justify-center perspective-container z-10">
            {PACK_TYPES.map((pack, index) => {
              // 現在のアクティブ要素との距離
              const offset = index - activeIndex;
              const isActive = offset === 0;
              const canAfford = myCoins >= pack.price;
              
              // 3D変換の計算
              const translateX = offset * 240; 
              const translateZ = Math.abs(offset) * -200; 
              const rotateY = offset * -45; 
              const zIndex = 100 - Math.abs(offset);

              return (
                <div
                  key={pack.id}
                  onClick={() => {
                    if (isActive) {
                      handleTypeSelect(pack.id);
                    } else {
                      setActiveIndex(index);
                    }
                  }}
                  className="absolute top-1/2 left-1/2 transform-style-3d cursor-pointer transition-all duration-500 ease-out"
                  style={{
                    width: '16rem', // w-64
                    height: '24rem', // h-96
                    marginTop: '-12rem', // height/2
                    marginLeft: '-8rem', // width/2
                    zIndex: zIndex,
                    transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg)`,
                  }}
                >
                  {/* パック本体 */}
                  <div className="relative group transform-style-3d">
                     {/* 光る背景エフェクト (アクティブ時のみ) */}
                    {isActive && (
                      <div className={`absolute inset-0 -inset-y-4 opacity-50 blur-2xl rounded-full bg-gradient-to-t ${pack.colorFrom} ${pack.colorTo} animate-pulse`} />
                    )}
                    
                    <PackVisual type={pack.id} isHovered={isActive} isSelected={isActive} />
                    
                    {/* 非アクティブ時の暗転用オーバーレイ */}
                    <div 
                      className="absolute inset-0 bg-black transition-opacity duration-500 rounded-xl z-50 pointer-events-none"
                      style={{ opacity: isActive ? 0 : 0.6 }} 
                    />

                    {/* 鏡面反射 (Reflection) */}
                    <div className="absolute top-full left-0 right-0 h-full transform scale-y-[-1] opacity-30 pointer-events-none reflection-mask mt-2">
                       <PackVisual type={pack.id} isHovered={false} isSelected={false} />
                       {/* 反射にも暗転を適用 */}
                       <div 
                        className="absolute inset-0 bg-black transition-opacity duration-500 rounded-xl z-50"
                        style={{ opacity: isActive ? 0 : 0.6 }} 
                       />
                    </div>
                  </div>

                  {/* 情報オーバーレイ (アクティブ時のみ表示) */}
                  <div 
                    className={`absolute -bottom-24 left-1/2 -translate-x-1/2 w-80 text-center transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
                  >
                    <div className="flex justify-center mb-2">
                      <div className={`inline-flex items-center gap-1 px-4 py-1.5 rounded-full ${canAfford ? 'bg-zinc-800 text-yellow-400 border-zinc-700' : 'bg-red-900/50 text-red-400 border-red-800'} border shadow-lg`}>
                        <Coins size={16} className={canAfford ? "fill-yellow-400/20" : ""} />
                        <span className="font-bold font-mono text-lg">{pack.price}</span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-zinc-400">{pack.description}</p>
                    
                    <div className="mt-4">
                       <span className="text-xs font-bold bg-white text-black px-4 py-1.5 rounded-full hover:bg-gray-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                         詳細を見る
                       </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="absolute bottom-10 flex gap-8 z-20">
            <button 
              onClick={prevPack}
              className="p-4 rounded-full bg-zinc-800/50 hover:bg-zinc-700 text-white border border-zinc-600 backdrop-blur-sm transition-all hover:scale-110 active:scale-95"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={nextPack}
              className="p-4 rounded-full bg-zinc-800/50 hover:bg-zinc-700 text-white border border-zinc-600 backdrop-blur-sm transition-all hover:scale-110 active:scale-95"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------------
          View 2: 単体パック確認 & 開封 (Preview)
         --------------------------------------------------------------------------- */}
      {view === 'preview' && (
        <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center relative overflow-hidden font-sans">
          
          {/* 背景装飾 */}
          {(() => {
            const currentPackData = PACK_TYPES.find(p => p.id === selectedType);
            const canAfford = myCoins >= currentPackData.price;

            return (
              <>
                <div className={`absolute inset-0 bg-gradient-to-b ${currentPackData.colorFrom} to-zinc-950 opacity-20 z-0`} />
                
                {/* ★ 流れるカード背景 ★ */}
                <StreamingCardsBackground 
                  cards={currentPackData.featuredCards || []} 
                  CardComponent={DefaultCardVisual} 
                />

                {/* ヘッダー */}
                <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
                  <button 
                    onClick={backToTypeSelect} 
                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors bg-black/30 px-4 py-2 rounded-full backdrop-blur-md border border-white/10"
                  >
                    <ArrowLeft size={20} />
                    <span className="text-sm font-bold">他のパックを選ぶ</span>
                  </button>
                </div>

                {/* メインエリア (Flex Layoutに変更) */}
                <div className="flex flex-col items-center z-10 w-full max-w-6xl px-4" style={{ animation: 'fadeIn 0.5s ease-out' }}>
                  
                  {/* タイトル & コイン判定 */}
                  <div className="mb-6 text-center">
                    <h2 className="text-3xl font-bold text-white mb-2 text-shadow-lg drop-shadow-md">{currentPackData.name}</h2>
                    {canAfford ? (
                      <p className="text-zinc-200 text-sm drop-shadow-md">このパックを開封しますか？</p>
                    ) : (
                      <p className="text-red-400 text-sm font-bold drop-shadow-md">コインが足りません！</p>
                    )}
                  </div>

                  <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-20">
                    
                    {/* 左側: 注目カードスライドショー (Featured Cards) */}
                    <div className="hidden md:block">
                      <CardSlideshow 
                        cards={currentPackData.featuredCards || []} 
                        CardComponent={DefaultCardVisual} 
                        onCardClick={(card) => setSelectedCardForModal(card)}
                      />
                    </div>

                    {/* 右側: パック本体 */}
                    <div 
                      className="cursor-pointer perspective-container group"
                      onClick={() => setIsRotating(!isRotating)}
                    >
                      <PackVisual 
                        type={selectedType} 
                        isSelected={true} 
                        showBack={isRotating} 
                        isHovered={false}
                      />
                      {/* 簡易的な反射 */}
                      <div className={`absolute top-full left-0 right-0 h-20 transform scale-y-[-1] opacity-20 pointer-events-none reflection-mask transition-opacity duration-300 ${isRotating ? 'opacity-5' : 'opacity-20'}`}>
                        <PackVisual type={selectedType} isSelected={false} showBack={false} isHovered={false} />
                      </div>

                      <div className="mt-8 text-center text-xs text-zinc-400 flex items-center justify-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full px-3 py-1 backdrop-blur-sm border border-white/10">
                        <RefreshCw size={12} />
                        <span>タップして裏面を確認</span>
                      </div>
                    </div>
                  
                  </div>

                  <div className="flex flex-col items-center gap-4 mt-10">
                     {/* 開封ボタン */}
                     <button 
                        onClick={handleOpenPack}
                        disabled={!canAfford}
                        className={`
                          h-16 px-12 rounded-full font-black tracking-widest text-lg flex items-center gap-3 transition-all z-20
                          ${canAfford 
                            ? 'bg-white text-black hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.3)]' 
                            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed grayscale'}
                        `}
                      >
                        {canAfford ? (
                          <>
                            <Sparkles size={24} className="text-yellow-500 fill-yellow-500" />
                            <span>開封する</span>
                          </>
                        ) : (
                           <span>コイン不足</span>
                        )}
                        
                        <div className={`ml-2 px-3 py-1 rounded-full text-sm font-mono flex items-center gap-1 border
                          ${canAfford ? 'bg-black/10 border-black/10' : 'bg-red-900/30 border-red-900/50 text-red-500'}
                        `}>
                          <Coins size={14} className={canAfford ? "text-yellow-600 fill-yellow-600" : ""} />
                          {currentPackData.price}
                        </div>
                      </button>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* ---------------------------------------------------------------------------
          View 3: 開封 & 結果
         --------------------------------------------------------------------------- */}
      {(view === 'opening' || view === 'result') && (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
          {(() => {
            const currentPackData = PACK_TYPES.find(p => p.id === selectedType);
            return (
              <>
                {view === 'opening' && (
                  <div className="animate-pulse flex flex-col items-center">
                     <div className="animate-bounce mb-8 transform scale-125">
                       <PackVisual type={selectedType} isSelected={true} />
                     </div>
                     <p className="text-white font-bold tracking-widest animate-pulse text-xl">OPENING...</p>
                     <p className="text-yellow-500 font-mono mt-2">-{currentPackData.price} Coins</p>
                     <div className="absolute inset-0 bg-white animate-[ping_1s_ease-in-out_infinite] opacity-10"></div>
                  </div>
                )}

                {view === 'result' && (
                  <div className="w-full max-w-5xl px-4 flex flex-col items-center" style={{ animation: 'fadeIn 1s ease-out' }}>
                    <div className="text-center mb-10">
                      <h2 className="text-4xl text-white font-bold mb-2">開封結果</h2>
                      <p className={`text-xl font-medium bg-clip-text text-transparent bg-gradient-to-r ${currentPackData.colorFrom} ${currentPackData.colorTo}`}>
                        {currentPackData.name}
                      </p>
                    </div>

                    {/* カード結果リスト */}
                    <div className="flex justify-center gap-4 flex-wrap w-full">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div 
                          key={i} 
                          className="w-40 h-56 bg-zinc-800 rounded-xl border-2 border-zinc-700 flex flex-col items-center justify-center hover:scale-110 transition-transform duration-300 shadow-xl"
                          style={{ 
                            animation: 'slideUp 0.5s ease-out forwards',
                            animationDelay: `${i * 150}ms`, 
                            opacity: 0 
                          }}
                        >
                          <div className={`text-6xl mb-4 ${i === 5 ? 'animate-bounce' : ''}`}>
                            {i === 5 ? '🌟' : '●'}
                          </div>
                          <div className="text-zinc-500 text-center">
                            <span className="text-xs font-bold uppercase tracking-wider">Card {i}</span>
                            {i === 5 && <div className="text-yellow-500 text-xs font-bold mt-1">RARE!</div>}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-16 flex gap-4">
                      <button 
                        onClick={reset}
                        className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full font-bold transition-colors border border-zinc-600 flex items-center gap-2"
                      >
                        <Layers size={18} />
                        パック一覧へ
                      </button>
                      <button 
                        onClick={() => setView('preview')}
                        className="px-8 py-3 bg-white text-black hover:bg-gray-200 rounded-full font-bold transition-colors shadow-lg flex items-center gap-2"
                      >
                        <RefreshCw size={18} />
                        もう一度開ける
                      </button>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}
    </>
  );
}