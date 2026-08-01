'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Il percorso segreto
  const SECRET_PATH = '/home-s3gr3ta-2026';

  // Se siamo sulla finta Home (o ovunque fuori dal percorso segreto), la navbar non viene proprio renderizzata
  if (!pathname.startsWith(SECRET_PATH)) {
    return null;
  }

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/70 border-b border-gray-200/60 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo - Rimanda alla dashboard segreta */}
        <Link 
          href={SECRET_PATH} 
          onClick={() => setIsOpen(false)}
          className="font-extrabold text-xl tracking-tight text-[var(--rose-dark)] flex items-center gap-1 hover:opacity-80 transition-opacity"
        >
          BabyPal 2.0 ✨
        </Link>
        
        {/* MENU DESKTOP (nascosto su schermi piccoli) */}
        <div className="hidden md:flex gap-6 text-sm font-bold">
          <Link 
            href={`${SECRET_PATH}/wishlist`} 
            className={`flex items-center gap-1.5 transition-colors pb-1 border-b-2 ${
              isActive(`${SECRET_PATH}/wishlist`) 
                ? 'border-[var(--rose-dark)] text-[var(--rose-dark)]' 
                : 'border-transparent text-gray-500 hover:text-[var(--brand-text)]'
            }`}
          >
            <span>Wishlist e ToDo</span>
          </Link>

          <Link 
            href={`${SECRET_PATH}/randomizer`} 
            className={`flex items-center gap-1.5 transition-colors pb-1 border-b-2 ${
              isActive(`${SECRET_PATH}/randomizer`) 
                ? 'border-[var(--rose-dark)] text-[var(--rose-dark)]' 
                : 'border-transparent text-gray-500 hover:text-[var(--brand-text)]'
            }`}
          >
            <span>Aiuto nelle scelte</span>
          </Link>

          {/* NUOVO LINK LIBRERIA DESKTOP */}
          <Link 
            href={`${SECRET_PATH}/libreria`} 
            className={`flex items-center gap-1.5 transition-colors pb-1 border-b-2 ${
              isActive(`${SECRET_PATH}/libreria`) 
                ? 'border-[var(--rose-dark)] text-[var(--rose-dark)]' 
                : 'border-transparent text-gray-500 hover:text-[var(--brand-text)]'
            }`}
          >
            <span>Libreria</span>
          </Link>
        </div>

        {/* BOTTONE HAMBURGER MOBILE (visibile solo su schermi piccoli) */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-[var(--rose-dark)] focus:outline-none"
        >
          {isOpen ? (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* TENDINA MENU MOBILE */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg px-4 pt-6 pb-8 flex flex-col gap-5 items-center">
          <Link 
            href={`${SECRET_PATH}/wishlist`} 
            onClick={() => setIsOpen(false)}
            className={`font-bold text-sm transition-all pb-1 border-b-2 ${
              isActive(`${SECRET_PATH}/wishlist`) 
                ? 'border-[var(--rose-dark)] text-[var(--rose-dark)]' 
                : 'border-transparent text-[var(--rose-dark)]/70 hover:text-[var(--rose-dark)]'
            }`}
          >
            Wishlist
          </Link>
          <Link 
            href={`${SECRET_PATH}/randomizer`} 
            onClick={() => setIsOpen(false)}
            className={`font-bold text-sm transition-all pb-1 border-b-2 ${
              isActive(`${SECRET_PATH}/randomizer`) 
                ? 'border-[var(--rose-dark)] text-[var(--rose-dark)]' 
                : 'border-transparent text-[var(--rose-dark)]/70 hover:text-[var(--rose-dark)]'
            }`}
          >
            Decisioni
          </Link>

          {/* NUOVO LINK LIBRERIA MOBILE */}
          <Link 
            href={`${SECRET_PATH}/libreria`} 
            onClick={() => setIsOpen(false)}
            className={`font-bold text-sm transition-all pb-1 border-b-2 ${
              isActive(`${SECRET_PATH}/libreria`) 
                ? 'border-[var(--rose-dark)] text-[var(--rose-dark)]' 
                : 'border-transparent text-[var(--rose-dark)]/70 hover:text-[var(--rose-dark)]'
            }`}
          >
            Libreria
          </Link>
        </div>
      )}
    </nav>
  );
}