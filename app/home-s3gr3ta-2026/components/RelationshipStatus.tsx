'use client';
import { useState, useSyncExternalStore } from 'react';
import { RELATIONSHIP_START_DATE } from '../lib/constants';

interface RelationshipTime {
  years: number;
  months: number;
  days: number;
  percentage: string | number;
}

const emptySubscribe = () => () => {};

function calculateRelationshipTime(): RelationshipTime {
  const startDate = new Date(RELATIONSHIP_START_DATE);
  const now = new Date();

  let y = now.getFullYear() - startDate.getFullYear();
  let m = now.getMonth() - startDate.getMonth();
  let d = now.getDate() - startDate.getDate();

  if (d < 0) {
    m -= 1;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    d += prevMonth.getDate();
  }
  if (m < 0) {
    y -= 1;
    m += 12;
  }

  const totalDaysTarget = 100 * 365.25;
  const daysElapsed = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
  const p = Math.min((daysElapsed / totalDaysTarget) * 100, 100).toFixed(2);

  return { years: y, months: m, days: d, percentage: p };
}

export default function RelationshipStatus() {
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [time] = useState<RelationshipTime>(calculateRelationshipTime);

  if (!isClient) return <div className="mt-8 w-full h-32 bg-white/60 rounded-2xl animate-pulse" />;

  return (
    <div className="mt-6 w-full bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-[var(--rose-light)]/60">
      <div className="flex justify-between items-center mb-2.5">
        <h3 className="font-extrabold text-[var(--brand-text)] text-[10px] sm:text-xs uppercase tracking-widest flex items-center gap-1.5">
          <span className="text-sm">💖</span> Fiansata soddisfatta da:
        </h3>
        <span className="text-xs sm:text-sm font-black font-mono text-[var(--rose-dark)] bg-rose-50 px-2.5 py-1 rounded-lg border border-[var(--rose-light)]">
          {time.years}a {time.months}m {time.days}g
        </span>
      </div>

      {/* Barra di progresso dinamica con shimmer */}
      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden relative p-0.5 border border-gray-200/60">
        <div
          className="h-full bg-gradient-to-r from-pink-400 via-[var(--rose-dark)] to-purple-700 rounded-full relative overflow-hidden transition-all duration-1000 ease-out"
          style={{ width: `${time.percentage}%` }}
        >
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            style={{ animation: 'shimmer 2.5s infinite' }}
          />
        </div>
      </div>

      <div className="flex justify-between items-center mt-2">
        <p className="text-[10px] text-gray-500 font-semibold flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
          Abbonamento Premium a vita attivo
        </p>
        <p className="text-[9px] font-mono font-bold text-gray-400 tracking-wider">
          {time.percentage}% / 100 ANNI
        </p>
      </div>
    </div>
  );
}
