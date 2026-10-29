'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SECRET_PATH } from '../lib/constants';

const NAV_ITEMS = [
  { href: `${SECRET_PATH}/wishlist`, label: 'Wishlist', desktopLabel: 'Wishlist e ToDo', icon: '✨' },
  { href: `${SECRET_PATH}/randomizer`, label: 'Decisioni', desktopLabel: 'Aiuto Scelte', icon: '🎰' },
  { href: `${SECRET_PATH}/libreria`, label: 'Libreria', desktopLabel: 'Libreria', icon: '📚' },
  { href: `${SECRET_PATH}/cinema`, label: 'Cinema', desktopLabel: 'Cinema', icon: '🍿' },
  { href: `${SECRET_PATH}/pannelloSegreto`, label: 'Admin', desktopLabel: 'Admin', icon: '🔒' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/75 border-b border-[var(--rose-light)]/70 shadow-[0_4px_30px_rgba(218,24,132,0.05)]">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href={SECRET_PATH}
          onClick={() => setIsOpen(false)}
          className="font-extrabold text-xl tracking-tight text-[var(--rose-dark)] flex items-center gap-1.5 hover:opacity-80 transition-opacity"
        >
          <span>BabyPal</span>
          <span className="text-[10px] font-mono bg-rose-100 text-[var(--rose-dark)] px-2 py-0.5 rounded-full border border-[var(--rose-light)]">
            2.0 ✨
          </span>
        </Link>

        {/* MENU DESKTOP (Pill style) */}
        <div className="hidden md:flex items-center gap-1.5 bg-gray-100/80 p-1.5 rounded-2xl border border-gray-200/60">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? 'bg-[var(--rose-dark)] text-white shadow-sm shadow-pink-500/25'
                    : 'text-gray-600 hover:text-[var(--rose-dark)] hover:bg-white/70'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.desktopLabel}</span>
              </Link>
            );
          })}
        </div>

        {/* BOTTONE HAMBURGER MOBILE */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-[var(--rose-dark)] focus:outline-none hover:bg-rose-50 rounded-xl transition-colors"
          aria-label="Menu"
        >
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* TENDINA MENU MOBILE */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white/95 backdrop-blur-2xl border-b border-[var(--rose-light)] shadow-2xl px-4 py-5 flex flex-col gap-2 animate-fade-in-up">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-center gap-2 font-bold text-sm py-3 rounded-xl transition-all ${
                  active
                    ? 'bg-[var(--rose-dark)] text-white shadow-md shadow-pink-500/20'
                    : 'text-gray-700 hover:bg-rose-50 hover:text-[var(--rose-dark)]'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
