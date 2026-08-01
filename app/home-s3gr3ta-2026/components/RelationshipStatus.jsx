'use client';
import { useEffect, useState } from 'react';

export default function RelationshipStatus() {
  const [time, setTime] = useState({ years: 0, months: 0, days: 0, percentage: 0 });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const startDate = new Date('2018-06-28T00:00:00');
    const now = new Date();

    // Calcolo esatto di anni, mesi e giorni
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

    // Calcolo percentuale su un target di 100 anni
    const totalDaysTarget = 100 * 365.25;
    const daysElapsed = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const p = Math.min((daysElapsed / totalDaysTarget) * 100, 100).toFixed(2);

    setTime({ years: y, months: m, days: d, percentage: p });
  }, []);

  // Previene errori visivi durante il primo render del server
  if (!isClient) return <div className="mt-8 w-full h-32 bg-gray-50 rounded-xl animate-pulse"></div>;

  return (
    <div className="mt-8 w-full bg-white p-5 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-end mb-2">
        <h3 className="font-bold text-[var(--brand-text)] text-[10px] sm:text-xs uppercase tracking-widest">
          Fiansata soddisfatta da:
        </h3>
        <span className="text-sm font-bold text-[var(--rose-dark)]">
          {time.years}a {time.months}m {time.days}g
        </span>
      </div>
      
      {/* Barra di progresso dinamica */}
      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden relative">
        <div 
          className="h-full bg-gradient-to-r from-[var(--rose-light)] to-[var(--rose-dark)] rounded-full shadow-inner transition-all duration-1000 ease-out"
          style={{ width: `${time.percentage}%` }}
        ></div>
      </div>
      
      <p className="text-[9px] text-gray-400 mt-1 text-right tracking-wider">
        {time.percentage}% DEL TARGET (100 ANNI)
      </p>
      
      <p className="text-xs text-gray-500 mt-2 text-center font-medium opacity-80">
        Abbonamento Premium a vita attivo.<br/>
      </p>
    </div>
  );
}