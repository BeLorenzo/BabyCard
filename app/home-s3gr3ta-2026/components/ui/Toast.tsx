'use client';
import { createContext, useContext, useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ConfirmDialogState {
  message: string;
  resolve: (confirmed: boolean) => void;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  confirmAction: (message: string) => Promise<boolean>;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast deve essere usato dentro ToastProvider');
  }
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const confirmAction = useCallback((message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmDialog({ message, resolve });
    });
  }, []);

  const handleConfirm = (result: boolean) => {
    if (confirmDialog) {
      confirmDialog.resolve(result);
      setConfirmDialog(null);
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, confirmAction }}>
      {children}

      {/* TOAST CONTAINER */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2.5 pointer-events-none w-[90vw] max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto animate-fade-in-up flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-xl backdrop-blur-xl border text-sm font-bold transition-all ${
              t.type === 'success'
                ? 'bg-white/95 border-emerald-200 text-gray-800 shadow-emerald-500/10'
                : t.type === 'error'
                ? 'bg-white/95 border-red-200 text-red-600 shadow-red-500/10'
                : 'bg-white/95 border-[var(--rose-light)] text-gray-800 shadow-pink-500/10'
            }`}
          >
            <span className="text-lg shrink-0">
              {t.type === 'success' ? '✨' : t.type === 'error' ? '⚠️' : '💌'}
            </span>
            <span className="flex-1 leading-snug">{t.message}</span>
          </div>
        ))}
      </div>

      {/* CUSTOM CONFIRM MODAL */}
      {confirmDialog && (
        <div
          className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => handleConfirm(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-[var(--rose-light)] animate-fade-in-up text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[var(--rose-dark)] flex items-center justify-center text-2xl mx-auto mb-3">
              🤔
            </div>
            <h3 className="text-lg font-extrabold text-[var(--brand-text)] mb-1">Conferma azione</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">{confirmDialog.message}</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleConfirm(false)}
                className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={() => handleConfirm(true)}
                className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-[var(--rose-dark)] text-white hover:opacity-90 transition-opacity shadow-md shadow-pink-500/20"
              >
                Conferma
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}
