'use client';
import { useState, useSyncExternalStore } from 'react';
import { verifyAdminPin } from '../../../actions/admin';

const emptySubscribe = () => () => {};

export default function PinGate({ children }: { children: React.ReactNode }) {
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const currentlyUnlocked =
    isUnlocked || (isClient && typeof window !== 'undefined' && sessionStorage.getItem('babypal_admin_unlocked') === 'true');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;

    setIsLoading(true);
    setError('');

    const res = await verifyAdminPin(pin);
    if (res.success) {
      sessionStorage.setItem('babypal_admin_unlocked', 'true');
      setIsUnlocked(true);
    } else {
      setError(res.error || 'PIN errato!');
      setPin('');
    }
    setIsLoading(false);
  };

  if (!isClient) {
    return <div className="min-h-screen" />;
  }

  if (currentlyUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-3xl shadow-lg border border-[var(--rose-light)] w-full max-w-sm text-center">
        <div className="w-16 h-16 bg-[var(--rose-light)]/30 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
          🔒
        </div>
        <h2 className="text-2xl font-black text-[var(--brand-text)] mb-2">Area Riservata</h2>
        <p className="text-xs text-gray-500 mb-6">Inserisci il PIN per accedere al pannello segreto</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            maxLength={10}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Inserisci PIN..."
            className="w-full text-center tracking-widest text-2xl font-bold bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[var(--rose-dark)]"
            autoFocus
          />

          {error && (
            <p className="text-xs font-bold text-red-500 animate-shake">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading || !pin.trim()}
            className="w-full bg-[var(--rose-dark)] text-white font-bold py-3.5 rounded-2xl hover:bg-opacity-90 transition-all disabled:opacity-50"
          >
            {isLoading ? 'Verifica...' : 'Sblocca Pannello'}
          </button>
        </form>
      </div>
    </div>
  );
}
