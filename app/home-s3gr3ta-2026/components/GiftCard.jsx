'use client';
import { useState } from 'react';

export default function GiftCard({ saldo = 0 }) {
  const [transform, setTransform] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);

  const handleMouseMove = (e) => {
    if (isFlipped) return;
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    
    const centerX = box.width / 2;
    const centerY = box.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    
    setTransform(`rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
  };

  const handleMouseLeave = () => {
    if (!isFlipped) setTransform('rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  };

  return (
    <div 
      className="flex justify-center items-center p-4 cursor-pointer w-full max-w-[400px] mx-auto" 
      style={{ perspective: '1500px' }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      
      <div 
        className="w-full aspect-[1.586/1] relative transition-transform duration-700 ease-out"
        style={{ 
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : transform 
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        
        {/* ================= FRONTE ================= */}
        <div 
          className="absolute inset-0 w-full h-full rounded-2xl p-5 sm:p-6 text-white shadow-2xl flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[var(--rose-light)] via-[var(--rose-gold)] to-[var(--rose-dark)] border border-white/20"
          style={{ 
            WebkitBackfaceVisibility: 'hidden', 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(0deg) translateZ(1px)'
          }}
        >
          <div className="absolute top-0 left-0 w-full h-[150%] bg-gradient-to-b from-white/20 to-transparent -rotate-45 -translate-y-10 -translate-x-10 pointer-events-none" />
          
          <div className="flex justify-between items-start z-10 relative">
            <span className="font-bold tracking-widest text-lg opacity-90 drop-shadow-sm">BABYPAL ✨</span>
            <div className="w-10 sm:w-12 h-7 sm:h-9 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-md border border-yellow-500/50 flex flex-col justify-center items-center gap-1 overflow-hidden shadow-sm">
              <div className="w-full h-[1px] bg-yellow-600/30"></div>
              <div className="w-full h-[1px] bg-yellow-600/30"></div>
            </div>
          </div>

          <div className="z-10 mt-2 relative">
            <p className="text-xs font-light opacity-90 uppercase tracking-wider mb-1">Saldo Disponibile</p>
            <p className="text-3xl sm:text-4xl font-bold tracking-tight drop-shadow-md">{saldo} EUR</p>
          </div>

          <div className="flex justify-between items-end z-10 font-mono text-xs sm:text-sm relative">
            <div className="flex flex-col">
              <span className="opacity-80 text-[10px]">Cardholder</span>
              <span className="tracking-widest uppercase mt-1 font-semibold drop-shadow-sm">Bella Baby</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="opacity-80 text-[10px]">Valid Thru</span>
              <span className="tracking-widest font-semibold drop-shadow-sm">Per Sempre</span>
            </div>
          </div>
        </div>

        {/* ================= RETRO ================= */}
        <div 
          className="absolute inset-0 w-full h-full rounded-2xl shadow-2xl flex flex-col border border-white/50 overflow-hidden"
          style={{ 
            WebkitBackfaceVisibility: 'hidden', 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg) translateZ(1px)',
            // Sfondo rose-gold chiarissimo e satinato
            background: 'linear-gradient(135deg, #FFF5F5 0%, #F6DCD8 100%)' 
          }}
        >
          {/* Riflesso di luce anche sul retro */}
          <div className="absolute top-0 left-0 w-full h-[150%] bg-white/30 -rotate-45 -translate-y-10 -translate-x-10 pointer-events-none" />

          {/* Banda Magnetica */}
          <div className="w-full h-10 sm:h-12 mt-5 sm:mt-6 relative z-10 bg-[#2a2a2a] shadow-[0_2px_5px_rgba(0,0,0,0.15)]">
            <div className="w-full h-full opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 4px)' }}></div>
          </div>
          
          <div className="flex-1 px-4 sm:px-6 py-3 flex flex-col relative z-10">
            
            {/* Box Firma e CVV separati elegantemente */}
            <div className="flex items-center w-full mt-2 gap-2 sm:gap-3">
              <div className="flex-1 h-8 sm:h-10 bg-white/90 rounded-sm shadow-inner flex items-center px-3 overflow-hidden relative border border-white/50">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, var(--rose-gold) 4px, var(--rose-gold) 5px)' }}></div>
                <span className="font-[cursive] text-[var(--brand-text)] text-lg sm:text-xl opacity-90 transform -rotate-3 relative z-10 -mt-1">Alessia</span>
              </div>
              
              <div className="w-12 sm:w-14 h-8 sm:h-10 bg-white/90 rounded-sm shadow-inner flex items-center justify-center font-mono font-bold text-[var(--brand-text)] border border-white/50 relative">
                <span className="absolute -top-3 sm:-top-4 left-1 text-[7px] sm:text-[8px] text-gray-500 font-sans tracking-widest uppercase">CVV</span>
                <span className="text-sm sm:text-base">286</span>
              </div>
            </div>

            {/* Testi di supporto e Ologramma Finto */}
            <div className="mt-3 sm:mt-4 flex justify-between items-end">
              <div className="text-[7px] sm:text-[8px] text-gray-500 uppercase font-semibold leading-[1.2] max-w-[65%]">
                <p>Assistenza Clienti: +39 338 8486556</p>
                <p className="mt-1">Proprietà esclusiva di BabyPal. Uso non autorizzato altamente punibile inalamento puzze della pussa.</p>
              </div>
            </div>

            {/* Numero Carta e Nome Titolare */}
            <div className="mt-auto text-right">
              <div className="text-gray-500 font-mono tracking-[0.15em] sm:tracking-[0.2em] text-[9px] sm:text-[10px]">
                1306 2806 0508 1809
              </div>
              <div className="text-[var(--brand-text)] font-mono tracking-wider text-[10px] sm:text-xs font-bold uppercase mt-0.5">
                Alessia Mapelli (Culo)
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}