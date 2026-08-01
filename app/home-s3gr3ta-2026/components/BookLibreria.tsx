'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

type BookRequest = {
  id: number;
  title: string;
  author: string;
  cover_url: string;
  format: string;
  language: string;
};

export default function BookLibreria() {
  const [requests, setRequests] = useState<BookRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [message, setMessage] = useState('');
  const [format, setFormat] = useState<'EPUB' | 'AUDIO'>('EPUB');
  const [language, setLanguage] = useState<'IT' | 'EN'>('IT');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const { data } = await supabase
      .from('book_requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setRequests(data);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResults([]);
    setMessage('');

    try {
      const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(searchQuery)}&limit=50`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.docs && data.docs.length > 0) {
        setSearchResults(data.docs.filter((b: any) => b.title));
      } else {
        setMessage('Nessun libro trovato.');
      }
    } catch (error) {
      setMessage('Errore di connessione.');
    }
    setIsSearching(false);
  };

  const addRequest = async (book: any, format: string, language: string) => {
    const title = book.title;
    const author = book.author_name ? book.author_name[0] : 'Autore sconosciuto';
    const cover_url = book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : '';

    const { error } = await supabase
      .from('book_requests')
      .insert([{ title, author, cover_url, format, language }]);

    if (error) {
      alert('Errore nel salvataggio.');
    } else {
      setSearchQuery('');
      setSearchResults([]);
      fetchRequests();
    }
  };

  const deleteRequest = async (id: number) => {
    if (!confirm('Sicuro di voler eliminare questa richiesta?')) return;
    const { error } = await supabase.from('book_requests').delete().eq('id', id);
    if (!error) fetchRequests();
  };

  const pillClass = (active: boolean) =>
    `flex-1 text-xs font-bold py-2.5 rounded-xl transition-colors ${
      active
        ? 'bg-[var(--rose-dark)] text-white'
        : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
    }`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">

      {/* RICERCA */}
      <section className="md:col-span-1 bg-white p-7 rounded-3xl shadow-sm border border-gray-100 sticky top-8">
        <h2 className="text-2xl font-bold text-[var(--brand-text)] mb-6">Nuova Richiesta</h2>

        <form onSubmit={handleSearch} className="flex flex-col gap-4 mb-6">
          <input
            type="text"
            placeholder="Titolo o autore..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-200 p-4 rounded-2xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[var(--rose-dark)] transition-shadow"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="w-full bg-[var(--rose-dark)] text-white p-4 rounded-2xl font-bold hover:bg-opacity-90 transition disabled:opacity-60"
          >
            {isSearching ? '⏳ Ricerca...' : 'Cerca'}
          </button>
        </form>

        <div className="mb-6 space-y-4">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">Formato</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setFormat('EPUB')} className={pillClass(format === 'EPUB')}>
                📖 EPUB
              </button>
              <button type="button" onClick={() => setFormat('AUDIO')} className={pillClass(format === 'AUDIO')}>
                🎧 Audiolibro
              </button>
            </div>
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">Lingua</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setLanguage('IT')} className={pillClass(language === 'IT')}>
                🇮🇹 Italiano
              </button>
              <button type="button" onClick={() => setLanguage('EN')} className={pillClass(language === 'EN')}>
                🇬🇧 Inglese
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-2">
          {!isSearching && searchResults.length === 0 && !message && (
            <p className="text-center text-sm text-gray-400 py-6">Cerca un titolo per iniziare 🔎</p>
          )}

          {message && <p className="text-center text-sm text-gray-400 py-6">{message}</p>}

          {searchResults.map((book, idx) => (
            <div
              key={`${book.key}-${idx}`}
              className="flex items-center gap-3 p-3 border border-gray-100 rounded-2xl hover:border-gray-200 transition-colors"
            >
              {book.cover_i ? (
                <img
                  src={`https://covers.openlibrary.org/b/id/${book.cover_i}-S.jpg`}
                  className="w-12 h-16 object-cover rounded-lg shrink-0"
                />
              ) : (
                <div className="w-12 h-16 bg-gray-100 rounded-lg shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-xs truncate">{book.title}</h3>
                {book.author_name?.[0] && (
                  <p className="text-[11px] text-gray-400 truncate">{book.author_name[0]}</p>
                )}
              </div>
              <button
                onClick={() => addRequest(book, format, language)}
                className="shrink-0 w-8 h-8 rounded-full bg-[var(--rose-dark)] text-white text-lg leading-none flex items-center justify-center hover:bg-opacity-90 transition"
                aria-label="Aggiungi richiesta"
                title={`Aggiungi in ${format === 'EPUB' ? 'EPUB' : 'Audio'} - ${language}`}
              >
                +
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* RICHIESTE ATTIVE */}
      <section className="md:col-span-2">
        <h2 className="text-2xl font-bold text-[var(--brand-text)] mb-8">
          Libri in attesa {requests.length > 0 && `(${requests.length})`}
        </h2>

        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center bg-white border border-dashed border-gray-200 rounded-3xl py-20 px-6">
            <span className="text-4xl mb-4">📚</span>
            <p className="text-gray-500 font-semibold">Nessun libro in attesa</p>
            <p className="text-gray-400 text-sm mt-1">Cerca un titolo e invia la tua prima richiesta</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                {req.cover_url ? (
                  <img src={req.cover_url} className="w-12 h-16 object-cover rounded-lg shrink-0" />
                ) : (
                  <div className="w-12 h-16 bg-gray-100 rounded-lg shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm truncate">{req.title}</h3>
                  <p className="text-xs text-gray-500 truncate">{req.author}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {req.format === 'AUDIO' ? '🎧 Audio' : '📖 EPUB'}
                    </span>
                    <span className="text-[10px] font-bold bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full">
                      {req.language === 'IT' ? '🇮🇹 IT' : '🇬🇧 EN'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => deleteRequest(req.id)}
                  className="shrink-0 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full p-2 transition-colors"
                  aria-label="Elimina richiesta"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}