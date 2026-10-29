'use client';
import { useState } from 'react';

interface GiftCardProps {
  saldo?: number;
  cardSignature?: string;
  cardPhone?: string;
  cardNumber?: string;
  cardHolderFull?: string;
}

export default function GiftCard({
  saldo = 0,
  cardSignature = process.env.NEXT_PUBLIC_CARD_SIGNATURE || 'Baby',
  cardPhone = process.env.NEXT_PUBLIC_CARD_PHONE || '+39 ••• •••••••',
  cardNumber = process.env.NEXT_PUBLIC_CARD_NUMBER || '•••• •••• •••• ••••',
  cardHolderFull = process.env.NEXT_PUBLIC_CARD_HOLDER_FULL || 'Bella Baby',
}: GiftCardProps) {
  const [transform, setTransform] = useState('');
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [isFlipped, setIsFlipped] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isFlipped) return;
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;

    const centerX = box.width / 2;
    const centerY = box.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    const percentX = Math.round((x / box.width) * 100);
    const percentY = Math.round((y / box.height) * 100);

    setTransform(`rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`);
    setGlare({ x: percentX, y: percentY, opacity: 0.35 });
  };

  const handleMouseLeave = () => {
    if (!isFlipped) {
      setTransform('rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    }
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      className="flex justify-center items-center p-4 cursor-pointer w-full max-w-[410px] mx-auto select-none group"
      style={{ perspective: '1500px' }}
      onClick={() => {
        setIsFlipped(!isFlipped);
        setGlare((prev) => ({ ...prev, opacity: 0 }));
      }}
    >
      <div
        className="w-full aspect-[1.586/1] relative transition-transform duration-500 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : transform,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* ================= FRONTE ================= */}
        <div
          className="absolute inset-0 w-full h-full rounded-2xl p-5 sm:p-6 text-white shadow-[0_20px_50px_rgba(218,24,132,0.35)] flex flex-col justify-between overflow-hidden bg-gradient-to-br from-pink-400 via-[var(--rose-dark)] to-purple-950 border border-white/30"
          style={{
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(0deg) translateZ(1px)',
          }}
        >
          {/* Riflesso statico diagonale */}
          <div className="absolute top-0 left-0 w-full h-[150%] bg-gradient-to-b from-white/20 to-transparent -rotate-45 -translate-y-10 -translate-x-10 pointer-events-none" />

          {/* Riflesso Olografico Dinamico che segue il cursore */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300 mix-blend-overlay"
            style={{
              opacity: glare.opacity,
              background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.9) 0%, rgba(251,207,232,0.4) 35%, transparent 70%)`,
            }}
          />

          <div className="flex justify-between items-start z-10 relative">
            <div className="flex flex-col">
              <span className="font-extrabold tracking-widest text-lg opacity-95 drop-shadow-sm">
                BABYPAL 2.0 ✨
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-pink-100/80 font-semibold">
                 Metal Edition
              </span>
            </div>

            {/* Chip Metallico */}
            <div className="w-11 sm:w-12 h-8 sm:h-9 bg-gradient-to-br from-amber-100 via-yellow-300 to-amber-500 rounded-lg border border-yellow-600/40 flex flex-col justify-between p-1.5 overflow-hidden shadow-inner relative">
              <div className="w-full h-[1px] bg-yellow-800/30" />
              <div className="w-4 h-3 border border-yellow-800/30 rounded-[2px] mx-auto" />
              <div className="w-full h-[1px] bg-yellow-800/30" />
            </div>
          </div>

          <div className="z-10 mt-1 relative">
            <p className="text-[10px] font-semibold opacity-80 uppercase tracking-[0.2em] mb-0.5">
              Saldo Disponibile
            </p>
            <p className="text-3xl sm:text-4xl font-extrabold tracking-tight drop-shadow-md font-mono">
              {saldo} <span className="text-xl sm:text-2xl opacity-90">EUR</span>
            </p>
          </div>

          <div className="flex justify-between items-end z-10 font-mono text-xs sm:text-sm relative">
            <div className="flex flex-col">
              <span className="opacity-70 text-[9px] uppercase tracking-widest font-sans">
                Cardholder
              </span>
              <span className="tracking-widest uppercase mt-0.5 font-bold drop-shadow-sm">
                Bella Baby
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="opacity-70 text-[9px] uppercase tracking-widest font-sans">
                Valid Thru
              </span>
              <span className="tracking-widest font-bold drop-shadow-sm">∞ PER SEMPRE</span>
            </div>
          </div>
        </div>

        {/* ================= RETRO ================= */}
        <div
          className="absolute inset-0 w-full h-full rounded-2xl shadow-2xl flex flex-col border border-white/60 overflow-hidden"
          style={{
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg) translateZ(1px)',
            background: 'linear-gradient(135deg, #FFF7F8 0%, #F5DBD8 100%)',
          }}
        >
          <div className="absolute top-0 left-0 w-full h-[150%] bg-white/30 -rotate-45 -translate-y-10 -translate-x-10 pointer-events-none" />

          {/* Banda Magnetica */}
          <div className="w-full h-10 sm:h-12 mt-5 sm:mt-6 relative z-10 bg-[#1f1f1f] shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
            <div
              className="w-full h-full opacity-15"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 4px)',
              }}
            />
          </div>

          <div className="flex-1 px-4 sm:px-6 py-3 flex flex-col relative z-10">
            {/* Box Firma e CVV */}
            <div className="flex items-center w-full mt-2 gap-2 sm:gap-3">
              <div className="flex-1 h-8 sm:h-10 bg-white/95 rounded-md shadow-inner flex items-center px-3 overflow-hidden relative border border-rose-200/60">
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(45deg, transparent, transparent 4px, var(--rose-gold) 4px, var(--rose-gold) 5px)',
                  }}
                />
                <span className="font-[cursive] text-[var(--brand-text)] text-lg sm:text-xl opacity-90 transform -rotate-3 relative z-10 -mt-1">
                  {cardSignature}
                </span>
              </div>

              <div className="w-12 sm:w-14 h-8 sm:h-10 bg-white/95 rounded-md shadow-inner flex items-center justify-center font-mono font-bold text-[var(--brand-text)] border border-rose-200/60 relative">
                <span className="absolute -top-3 sm:-top-4 left-1 text-[7px] sm:text-[8px] text-gray-500 font-sans tracking-widest uppercase">
                  CVV
                </span>
                <span className="text-sm sm:text-base">286</span>
              </div>
            </div>

            {/* Testi di supporto */}
            <div className="mt-3 sm:mt-4 flex justify-between items-end">
              <div className="text-[7px] sm:text-[8px] text-gray-500 uppercase font-semibold leading-[1.2] max-w-[70%]">
                <p>Assistenza Clienti VIP: {cardPhone}</p>
                <p className="mt-1">
                  Proprietà esclusiva di BabyPal. Uso non autorizzato altamente punibile con inalamento puzze della pussa.
                </p>
              </div>
            </div>

            {/* Numero Carta e Nome Titolare */}
            <div className="mt-auto text-right">
              <div className="text-gray-500 font-mono tracking-[0.15em] sm:tracking-[0.2em] text-[9px] sm:text-[10px]">
                {cardNumber}
              </div>
              <div className="text-[var(--brand-text)] font-mono tracking-wider text-[10px] sm:text-xs font-bold uppercase mt-0.5">
                {cardHolderFull}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
