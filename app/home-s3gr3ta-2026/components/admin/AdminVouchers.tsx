'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Voucher } from '../../lib/types';
import { useToast } from '../ui/Toast';

export default function AdminVouchers() {
  const { showToast, confirmAction } = useToast();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saldo, setSaldo] = useState(0);
  const [isUpdatingSaldo, setIsUpdatingSaldo] = useState(false);

  const refreshVouchers = async () => {
    const { data } = await supabase
      .from('vouchers')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setVouchers(data as Voucher[]);
  };

  useEffect(() => {
    let ignore = false;
    supabase
      .from('vouchers')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (!ignore && data) setVouchers(data as Voucher[]);
      });

    supabase
      .from('settings')
      .select('value')
      .eq('key', 'saldo')
      .single()
      .then(({ data }) => {
        if (!ignore && data) setSaldo(data.value);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const updateSaldo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingSaldo(true);
    const { error } = await supabase.from('settings').update({ value: saldo }).eq('key', 'saldo');
    setIsUpdatingSaldo(false);
    if (error) {
      showToast("Errore durante l'aggiornamento del saldo", 'error');
    } else {
      showToast(`Saldo aggiornato a ${saldo} EUR!`, 'success');
    }
  };

  const handleSaveVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    if (editingId) {
      await supabase.from('vouchers').update({ title, description }).eq('id', editingId);
      showToast('Voucher aggiornato!', 'success');
    } else {
      await supabase.from('vouchers').insert([{ title, description }]);
      showToast('Nuovo voucher creato!', 'success');
    }

    setTitle('');
    setDescription('');
    setEditingId(null);
    refreshVouchers();
  };

  const startEditing = (v: Voucher) => {
    setEditingId(v.id);
    setTitle(v.title);
    setDescription(v.description);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
  };

  const deleteVoucher = async (id: number) => {
    const ok = await confirmAction('Sicuro di voler eliminare questo voucher?');
    if (!ok) return;
    await supabase.from('vouchers').delete().eq('id', id);
    showToast('Voucher eliminato', 'info');
    refreshVouchers();
  };

  return (
    <div className="space-y-8">
      {/* GESTIONE SALDO */}
      <form
        onSubmit={updateSaldo}
        className="bg-white p-6 rounded-2xl shadow-sm flex items-end gap-4 border border-[var(--rose-light)]"
      >
        <div className="flex-1">
          <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-2">
            Saldo Attuale (EUR)
          </label>
          <input
            type="number"
            value={saldo}
            onChange={(e) => setSaldo(Number(e.target.value))}
            className="border border-gray-200 p-2.5 rounded-xl w-full font-extrabold font-mono text-xl outline-none focus:ring-2 focus:ring-[var(--rose-light)] bg-gray-50"
          />
        </div>
        <button
          type="submit"
          disabled={isUpdatingSaldo}
          className="bg-[var(--rose-dark)] text-white font-bold py-3 px-6 rounded-xl hover:opacity-90 transition-opacity shadow-sm"
        >
          {isUpdatingSaldo ? '...' : 'Aggiorna'}
        </button>
      </form>

      {/* GESTIONE VOUCHER (Creazione/Modifica) */}
      <form
        onSubmit={handleSaveVoucher}
        className="bg-white p-6 rounded-2xl shadow-sm flex flex-col gap-4 border border-gray-200"
      >
        <div className="flex justify-between items-center">
          <h2 className="font-extrabold text-xl text-[var(--brand-text)]">
            {editingId ? 'Modifica Voucher' : 'Nuovo Voucher'}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={cancelEditing}
              className="text-xs text-gray-400 hover:text-gray-600 font-bold"
            >
              Annulla Modifica ✕
            </button>
          )}
        </div>
        <input
          type="text"
          placeholder="Titolo (es. Giropizza)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border border-gray-200 p-3 rounded-xl w-full bg-gray-50 outline-none focus:ring-2 focus:ring-[var(--rose-light)] text-sm"
          required
        />
        <textarea
          placeholder="Descrizione (es. Valido per una giropizzata)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border border-gray-200 p-3 rounded-xl w-full bg-gray-50 outline-none focus:ring-2 focus:ring-[var(--rose-light)] text-sm"
          rows={3}
          required
        />
        <button
          type="submit"
          className={`${
            editingId ? 'bg-[var(--rose-dark)]' : 'bg-gray-900'
          } text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity text-sm`}
        >
          {editingId ? 'Salva Modifiche' : 'Crea Voucher'}
        </button>
      </form>

      {/* LISTA VOUCHER */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="font-extrabold text-xl mb-4 text-[var(--brand-text)]">Voucher Esistenti</h2>
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {vouchers.map((v) => (
            <div
              key={v.id}
              className={`p-3.5 rounded-xl border flex justify-between items-center transition-colors ${
                editingId === v.id
                  ? 'border-[var(--rose-dark)] bg-rose-50'
                  : 'border-gray-100 hover:bg-gray-50'
              }`}
            >
              <div className="flex-1 min-w-0 pr-4">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md mr-2 align-middle ${
                    v.is_used ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {v.is_used ? 'USATO' : 'ATTIVO'}
                </span>
                <strong className="text-sm text-gray-800 truncate block sm:inline-block mt-1 sm:mt-0">
                  {v.title}
                </strong>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => startEditing(v)}
                  className="text-gray-400 hover:text-[var(--rose-dark)] transition-colors"
                  title="Modifica"
                >
                  ✏️
                </button>
                <button
                  onClick={() => deleteVoucher(v.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Elimina"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
