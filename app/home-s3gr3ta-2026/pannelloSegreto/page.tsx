'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// 1. Tipi
type Voucher = {
  id: number;
  title: string;
  description: string;
  is_used: boolean;
};

type BookRequest = {
  id: number;
  title: string;
  author: string;
  format: string;
  language: string;
  status: string;
};

export default function AdminPanel() {
  // STATI VOUCHER E SALDO
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saldo, setSaldo] = useState(0);
  const [isUpdatingSaldo, setIsUpdatingSaldo] = useState(false);

  // STATI LIBRERIA
  const [pendingBooks, setPendingBooks] = useState<BookRequest[]>([]);
  const [links, setLinks] = useState<{[key: number]: string}>({});

  useEffect(() => {
    fetchVouchers();
    fetchSaldo();
    fetchPendingBooks();
  }, []);

  // --- LOGICA SALDO E VOUCHER ---
  const fetchVouchers = async () => {
    const { data } = await supabase.from('vouchers').select('*').order('created_at', { ascending: false });
    if (data) setVouchers(data as Voucher[]);
  };

  const fetchSaldo = async () => {
    const { data } = await supabase.from('settings').select('value').eq('key', 'saldo').single();
    if (data) setSaldo(data.value);
  };

  const updateSaldo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingSaldo(true);
    await supabase.from('settings').update({ value: saldo }).eq('key', 'saldo');
    setIsUpdatingSaldo(false);
    alert('Saldo aggiornato!');
  };

  const addVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    await supabase.from('vouchers').insert([{ title, description }]);
    setTitle('');
    setDescription('');
    fetchVouchers();
  };

  const deleteVoucher = async (id: number) => {
    if(!confirm("Sicuro di voler eliminare questo voucher?")) return;
    await supabase.from('vouchers').delete().eq('id', id);
    fetchVouchers();
  };

  // --- LOGICA LIBRERIA ---
  const fetchPendingBooks = async () => {
    const { data } = await supabase
      .from('book_requests')
      .select('*')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: true });
    if (data) setPendingBooks(data as BookRequest[]);
  };

  const handleApproveBook = async (id: number) => {
    const url = links[id];
    if (!url) return alert("Devi inserire il link di Google Drive prima di approvare!");

    const { error } = await supabase
      .from('book_requests')
      .update({ status: 'READY', download_url: url })
      .eq('id', id);
      
    if (!error) {
      fetchPendingBooks();
      // Pulisce l'input del link per quell'ID specifico
      setLinks(prev => { const newLinks = {...prev}; delete newLinks[id]; return newLinks; });
    } else {
      alert("Errore durante l'approvazione del libro.");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen space-y-12">
      <h1 className="text-3xl font-bold">Pannello di Controllo Segreto 🕵️‍♂️</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* COLONNA SINISTRA: VOUCHER E SALDO */}
        <div className="space-y-8">
          
          {/* GESTIONE SALDO */}
          <form onSubmit={updateSaldo} className="bg-white p-6 rounded-xl shadow-sm flex items-end gap-4 border border-[var(--rose-light)]">
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 mb-2">Saldo Attuale (EUR)</label>
              <input 
                type="number" 
                value={saldo} 
                onChange={(e) => setSaldo(Number(e.target.value))}
                className="border border-gray-200 p-2 rounded-lg w-full font-bold text-xl outline-none focus:ring-2 focus:ring-[var(--rose-light)]" 
              />
            </div>
            <button type="submit" disabled={isUpdatingSaldo} className="bg-[var(--rose-dark)] text-white font-bold py-2.5 px-6 rounded-lg hover:bg-opacity-90 transition-colors">
              {isUpdatingSaldo ? '...' : 'Aggiorna'}
            </button>
          </form>

          {/* GESTIONE VOUCHER */}
          <form onSubmit={addVoucher} className="bg-white p-6 rounded-xl shadow-sm flex flex-col gap-4 border border-gray-200">
            <h2 className="font-bold text-xl text-[var(--brand-text)]">Nuovo Voucher</h2>
            <input 
              type="text" placeholder="Titolo (es. Giropizza)" value={title} onChange={(e) => setTitle(e.target.value)}
              className="border border-gray-200 p-3 rounded-lg w-full bg-gray-50 outline-none focus:ring-2 focus:ring-[var(--rose-light)]" required 
            />
            <textarea 
              placeholder="Descrizione (es. Valido per una giropizzata)" value={description} onChange={(e) => setDescription(e.target.value)}
              className="border border-gray-200 p-3 rounded-lg w-full bg-gray-50 outline-none focus:ring-2 focus:ring-[var(--rose-light)]" rows={3} required 
            />
            <button type="submit" className="bg-gray-800 text-white font-bold py-3 rounded-lg hover:bg-gray-700 transition-colors">
              Crea Voucher
            </button>
          </form>

          {/* LISTA VOUCHER */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="font-bold text-xl mb-4 text-[var(--brand-text)]">Voucher Esistenti</h2>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {vouchers.map(v => (
                <div key={v.id} className="p-3 rounded-lg border border-gray-100 flex justify-between items-center hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0 pr-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded mr-2 align-middle ${v.is_used ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {v.is_used ? 'USATO' : 'ATTIVO'}
                    </span>
                    <strong className="text-sm text-gray-800 truncate block sm:inline-block mt-1 sm:mt-0">{v.title}</strong>
                  </div>
                  <button onClick={() => deleteVoucher(v.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLONNA DESTRA: LIBRERIA (RICHIESTE IN SOSPESO) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[var(--rose-light)]">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">📚</span>
            <h2 className="font-bold text-xl text-[var(--brand-text)]">Richieste Libreria</h2>
          </div>
          
          {pendingBooks.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
              Nessun libro in attesa. Sei in pari!
            </div>
          ) : (
            <div className="space-y-4">
              {pendingBooks.map(req => (
                <div key={req.id} className="flex flex-col gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="font-bold text-sm text-gray-900 truncate leading-tight">{req.title}</p>
                      <p className="text-xs text-gray-500 truncate">{req.author}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <span className="text-[10px] font-bold bg-gray-200 text-gray-700 px-2 py-1 rounded">{req.format}</span>
                      <span className="text-[10px] font-bold bg-gray-200 text-gray-700 px-2 py-1 rounded">{req.language}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 mt-2">
                    <input 
                      type="text" 
                      placeholder="Incolla link GDrive qui..." 
                      value={links[req.id] || ''}
                      onChange={(e) => setLinks({...links, [req.id]: e.target.value})}
                      className="border border-gray-300 p-2.5 text-sm rounded-lg outline-none focus:ring-2 focus:ring-green-400"
                    />
                    <button 
                      onClick={() => handleApproveBook(req.id)}
                      className="w-full bg-green-600 text-white text-xs font-bold px-4 py-3 rounded-lg hover:bg-green-500 transition-colors"
                    >
                      Approva & Pubblica
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}