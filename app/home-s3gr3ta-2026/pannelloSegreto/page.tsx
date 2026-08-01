'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// 1. Definiamo come è fatto un Voucher per TypeScript
type Voucher = {
  id: number;
  title: string;
  description: string;
  is_used: boolean;
};

export default function AdminVouchers() {
  // 2. Assegniamo il tipo all'array
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  const [saldo, setSaldo] = useState(0);
  const [isUpdatingSaldo, setIsUpdatingSaldo] = useState(false);

  useEffect(() => {
    fetchVouchers();
    fetchSaldo();
  }, []);

  const fetchVouchers = async () => {
    const { data } = await supabase.from('vouchers').select('*').order('created_at', { ascending: false });
    if (data) setVouchers(data as Voucher[]);
  };

  const fetchSaldo = async () => {
    const { data } = await supabase.from('settings').select('value').eq('key', 'saldo').single();
    if (data) setSaldo(data.value);
  };

  // 3. Tipizziamo l'evento del form
  const updateSaldo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingSaldo(true);
    await supabase.from('settings').update({ value: saldo }).eq('key', 'saldo');
    setIsUpdatingSaldo(false);
    alert('Saldo aggiornato!');
  };

  // 4. Tipizziamo l'evento del form
  const addVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    await supabase.from('vouchers').insert([{ title, description }]);
    setTitle('');
    setDescription('');
    fetchVouchers();
  };

  // 5. Tipizziamo l'ID
  const deleteVoucher = async (id: number) => {
    await supabase.from('vouchers').delete().eq('id', id);
    fetchVouchers();
  };

  return (
    <div className="p-8 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Pannello di Controllo Segreto 🕵️‍♂️</h1>
      
      {/* GESTIONE SALDO */}
      <form onSubmit={updateSaldo} className="bg-white p-6 rounded-xl shadow-sm mb-8 flex items-end gap-4 border border-[var(--rose-gold)] bg-[var(--brand-bg)]">
        <div className="flex-1">
          <label className="block text-sm font-bold text-gray-700 mb-2">Saldo Attuale (EUR)</label>
          <input 
            type="number" 
            value={saldo} 
            onChange={(e) => setSaldo(Number(e.target.value))}
            className="border p-2 rounded w-full font-bold text-xl" 
          />
        </div>
        <button type="submit" disabled={isUpdatingSaldo} className="bg-[var(--rose-dark)] text-white font-bold py-2 px-6 rounded hover:bg-[var(--rose-gold)] transition-colors">
          {isUpdatingSaldo ? '...' : 'Aggiorna Saldo'}
        </button>
      </form>

      {/* GESTIONE VOUCHER */}
      <form onSubmit={addVoucher} className="bg-white p-6 rounded-xl shadow-sm mb-8 flex flex-col gap-4 border border-gray-200">
        <h2 className="font-bold text-xl">Nuovo Voucher</h2>
        <input 
          type="text" placeholder="Titolo (es. Giropizza)" value={title} onChange={(e) => setTitle(e.target.value)}
          className="border p-2 rounded w-full bg-gray-50" required 
        />
        <textarea 
          placeholder="Descrizione (es. Valido per una giropizzata)" value={description} onChange={(e) => setDescription(e.target.value)}
          className="border p-2 rounded w-full bg-gray-50" rows={3} required 
        />
        <button type="submit" className="bg-gray-800 text-white font-bold py-2 rounded hover:bg-gray-700">
          Crea Voucher
        </button>
      </form>

      {/* Lista Voucher Esistenti */}
      <div className="space-y-4">
        <h2 className="font-bold text-xl">Voucher Esistenti</h2>
        {vouchers.map(v => (
          <div key={v.id} className="bg-white p-4 rounded-xl border border-gray-200 flex justify-between items-center">
            <div>
              <span className={`text-xs font-bold px-2 py-1 rounded mr-2 ${v.is_used ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {v.is_used ? 'USATO' : 'ATTIVO'}
              </span>
              <strong>{v.title}</strong>
            </div>
            <button onClick={() => deleteVoucher(v.id)} className="text-red-500 font-bold hover:underline">
              Elimina
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}