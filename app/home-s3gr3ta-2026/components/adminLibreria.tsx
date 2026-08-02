'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function AdminLibreria() {
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [links, setLinks] = useState<{[key: number]: string}>({});

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    const { data } = await supabase.from('book_requests').select('*').eq('status', 'PENDING').order('created_at', { ascending: true });
    if (data) setPendingRequests(data);
  };

  // Funzione che "pulisce" il link di Google Drive e lo forza al download
  const formatDriveLink = (rawUrl: string) => {
    // Cerca il pattern standard dei link di condivisione di Drive per isolare l'ID
    const match = rawUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    
    if (match && match[1]) {
      // Se trova l'ID, costruisce il link per il download diretto
      return `https://drive.google.com/uc?export=download&id=${match[1]}`;
    }
    
    // Se per qualche motivo incolli un link non standard, lo lascia intatto come fallback
    return rawUrl;
  };

  const handleApprove = async (id: number) => {
    const rawUrl = links[id];
    if (!rawUrl) return alert("Inserisci il link di Drive prima di approvare!");

    // Trasformiamo il link PRIMA di mandarlo a Supabase
    const finalDownloadUrl = formatDriveLink(rawUrl);

    const { error } = await supabase.from('book_requests').update({ status: 'READY', download_url: finalDownloadUrl }).eq('id', id);
    if (!error) {
      fetchPending();
      setLinks(prev => { const newLinks = {...prev}; delete newLinks[id]; return newLinks; });
    } else {
      alert("Errore nell'aggiornamento. Riprova.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mt-8">
      <h2 className="text-xl font-bold mb-4">Gestione Libreria (Da Caricare)</h2>
      {pendingRequests.length === 0 ? (
        <p className="text-sm text-gray-500">Nessuna richiesta in attesa.</p>
      ) : (
        <div className="space-y-4">
          {pendingRequests.map(req => (
            <div key={req.id} className="flex flex-col md:flex-row gap-4 items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{req.title}</p>
                <p className="text-xs text-gray-500">Formato: {req.format} ({req.language})</p>
              </div>
              <input 
                type="text" 
                placeholder="Incolla link GDrive..." 
                value={links[req.id] || ''}
                onChange={(e) => setLinks({...links, [req.id]: e.target.value})}
                className="w-full md:w-64 border border-gray-300 p-2 text-sm rounded-lg outline-none focus:ring-2 focus:ring-[var(--rose-dark)]"
              />
              <button 
                onClick={() => handleApprove(req.id)}
                className="w-full md:w-auto bg-green-500 text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-green-600 transition-colors"
              >
                Approva & Pubblica
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}