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
    <nav className="sticky top-0 z-40 w-full backdrop-blur-md bg-gradient-to-r from-[var(--rose-light)]/40 via-white/60 to-[var(--rose-light)]/40 border-b border-[var(--rose-light)] shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo - Rimanda alla dashboard segreta */}
        <Link 
          href={SECRET_PATH} 
          onClick={() => setIsOpen(false)}
          className="font-extrabold text-xl tracking-tight text-[var(--rose-dark)] flex items-center gap-1 hover:opacity-80 transition-opacity drop-shadow-sm"
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
                : 'border-transparent text-gray-600 hover:text-[var(--rose-dark)]'
            }`}
          >
            <span>Wishlist e ToDo</span>
          </Link>

          <Link 
            href={`${SECRET_PATH}/randomizer`} 
            className={`flex items-center gap-1.5 transition-colors pb-1 border-b-2 ${
              isActive(`${SECRET_PATH}/randomizer`) 
                ? 'border-[var(--rose-dark)] text-[var(--rose-dark)]' 
                : 'border-transparent text-gray-600 hover:text-[var(--rose-dark)]'
            }`}
          >
            <span>Aiuto nelle scelte</span>
          </Link>

          <Link 
            href={`${SECRET_PATH}/libreria`} 
            className={`flex items-center gap-1.5 transition-colors pb-1 border-b-2 ${
              isActive(`${SECRET_PATH}/libreria`) 
                ? 'border-[var(--rose-dark)] text-[var(--rose-dark)]' 
                : 'border-transparent text-gray-600 hover:text-[var(--rose-dark)]'
            }`}
          >
            <span>Libreria</span>
          </Link>

          {/* NUOVO LINK CINEMA DESKTOP */}
          <Link 
            href={`${SECRET_PATH}/cinema`} 
            className={`flex items-center gap-1.5 transition-colors pb-1 border-b-2 ${
              isActive(`${SECRET_PATH}/cinema`) 
                ? 'border-[var(--rose-dark)] text-[var(--rose-dark)]' 
                : 'border-transparent text-gray-600 hover:text-[var(--rose-dark)]'
            }`}
          >
            <span>Cinema</span>
          </Link>
        </div>

        {/* BOTTONE HAMBURGER MOBILE (visibile solo su schermi piccoli) */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-[var(--rose-dark)] focus:outline-none hover:bg-white/50 rounded-lg transition-colors"
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
        <div className="md:hidden absolute top-16 left-0 w-full bg-gradient-to-r from-[var(--rose-light)]/95 via-white/95 to-[var(--rose-light)]/95 backdrop-blur-xl border-b border-[var(--rose-light)] shadow-2xl px-4 pt-6 pb-8 flex flex-col gap-5 items-center">
          <Link 
            href={`${SECRET_PATH}/wishlist`} 
            onClick={() => setIsOpen(false)}
            className={`font-bold text-base transition-all pb-1 border-b-2 ${
              isActive(`${SECRET_PATH}/wishlist`) 
                ? 'border-[var(--rose-dark)] text-[var(--rose-dark)]' 
                : 'border-transparent text-gray-600 hover:text-[var(--rose-dark)]'
            }`}
          >
            Wishlist
          </Link>
          <Link 
            href={`${SECRET_PATH}/randomizer`} 
            onClick={() => setIsOpen(false)}
            className={`font-bold text-base transition-all pb-1 border-b-2 ${
              isActive(`${SECRET_PATH}/randomizer`) 
                ? 'border-[var(--rose-dark)] text-[var(--rose-dark)]' 
                : 'border-transparent text-gray-600 hover:text-[var(--rose-dark)]'
            }`}
          >
            Decisioni
          </Link>

          <Link 
            href={`${SECRET_PATH}/libreria`} 
            onClick={() => setIsOpen(false)}
            className={`font-bold text-base transition-all pb-1 border-b-2 ${
              isActive(`${SECRET_PATH}/libreria`) 
                ? 'border-[var(--rose-dark)] text-[var(--rose-dark)]' 
                : 'border-transparent text-gray-600 hover:text-[var(--rose-dark)]'
            }`}
          >
            Libreria
          </Link>

          {/* NUOVO LINK CINEMA MOBILE */}
          <Link 
            href={`${SECRET_PATH}/cinema`} 
            onClick={() => setIsOpen(false)}
            className={`font-bold text-base transition-all pb-1 border-b-2 ${
              isActive(`${SECRET_PATH}/cinema`) 
                ? 'border-[var(--rose-dark)] text-[var(--rose-dark)]' 
                : 'border-transparent text-gray-600 hover:text-[var(--rose-dark)]'
            }`}
          >
            Cinema
          </Link>
        </div>
      )}
    </nav>
  );
}