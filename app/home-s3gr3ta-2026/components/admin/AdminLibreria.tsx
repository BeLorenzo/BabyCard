'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { BookRequest } from '../../lib/types';
import { formatDriveLink } from '../../lib/utils';
import { useToast } from '../ui/Toast';

export default function AdminLibreria() {
  const { showToast } = useToast();
  const [pendingBooks, setPendingBooks] = useState<BookRequest[]>([]);
  const [links, setLinks] = useState<{ [key: number]: string }>({});

  const refreshBooks = async () => {
    const { data } = await supabase
      .from('book_requests')
      .select('*')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: true });
    if (data) setPendingBooks(data as BookRequest[]);
  };

  useEffect(() => {
    let ignore = false;
    supabase
      .from('book_requests')
      .select('*')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (!ignore && data) {
          setPendingBooks(data as BookRequest[]);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleApproveBook = async (id: number) => {
    const rawUrl = links[id];
    if (!rawUrl) {
      showToast('Devi inserire il link di Google Drive prima di approvare!', 'error');
      return;
    }

    const finalDownloadUrl = formatDriveLink(rawUrl);

    const { error } = await supabase
      .from('book_requests')
      .update({ status: 'READY', download_url: finalDownloadUrl })
      .eq('id', id);

    if (!error) {
      showToast('Libro approvato e pubblicato in libreria! 📚', 'success');
      refreshBooks();
      setLinks((prev) => {
        const newLinks = { ...prev };
        delete newLinks[id];
        return newLinks;
      });
    } else {
      showToast("Errore durante l'approvazione del libro.", 'error');
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-[var(--rose-light)]">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">📚</span>
        <h2 className="font-extrabold text-xl text-[var(--brand-text)]">Richieste Libreria</h2>
      </div>

      {pendingBooks.length === 0 ? (
        <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
          Nessun libro in attesa. Sei in pari!
        </div>
      ) : (
        <div className="space-y-4">
          {pendingBooks.map((req) => (
            <div key={req.id} className="flex flex-col gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0 pr-2">
                  <p className="font-bold text-sm text-gray-900 truncate leading-tight">{req.title}</p>
                  <p className="text-xs text-gray-500 truncate">{req.author}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <span className="text-[10px] font-bold bg-gray-200 text-gray-700 px-2 py-1 rounded">
                    {req.format}
                  </span>
                  <span className="text-[10px] font-bold bg-gray-200 text-gray-700 px-2 py-1 rounded">
                    {req.language}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Incolla link GDrive qui..."
                  value={links[req.id] || ''}
                  onChange={(e) => setLinks({ ...links, [req.id]: e.target.value })}
                  className="border border-gray-300 p-2.5 text-sm rounded-xl outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
                />
                <button
                  onClick={() => handleApproveBook(req.id)}
                  className="w-full bg-emerald-600 text-white text-xs font-bold px-4 py-3 rounded-xl hover:bg-emerald-500 transition-colors shadow-xs"
                >
                  Approva & Pubblica
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
