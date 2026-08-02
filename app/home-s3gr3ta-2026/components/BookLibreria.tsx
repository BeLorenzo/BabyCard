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
  status: string;
  download_url: string;
};

export default function BookLibreria() {
  const [requests, setRequests] = useState<BookRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [message, setMessage] = useState('');
  
  // Stati per la nuova richiesta
  const [format, setFormat] = useState<'EPUB' | 'AUDIO'>('EPUB');
  const [language, setLanguage] = useState<'IT' | 'EN'>('IT');

  // Stati per i filtri della libreria
  const [libFilterText, setLibFilterText] = useState('');
  const [libFilterFormat, setLibFilterFormat] = useState<'ALL' | 'EPUB' | 'AUDIO'>('ALL');
  const [libFilterLang, setLibFilterLang] = useState<'ALL' | 'IT' | 'EN'>('ALL');

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
      const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(searchQuery)}&limit=10`;
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
      .insert([{ title, author, cover_url, format, language, status: 'PENDING' }]);

    if (error) {
      alert('Errore nel salvataggio.');
    } else {
      setSearchQuery('');
      setSearchResults([]);
      fetchRequests();
    }
  };

  const deleteRequest = async (id: number) => {
    if (!confirm('Sicuro di voler eliminare questo libro?')) return;
    const { error } = await supabase.from('book_requests').delete().eq('id', id);
    if (!error) fetchRequests();
  };

  const pillClass = (active: boolean) =>
    `flex-1 text-xs font-bold py-2.5 rounded-xl transition-colors ${
      active
        ? 'bg-[var(--rose-dark)] text-white'
        : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
    }`;

  const filterPillClass = (active: boolean) =>
    `px-3 py-1.5 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
      active
        ? 'bg-[var(--rose-dark)] text-white shadow-sm'
        : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
    }`;

  const pendingBooks = requests.filter(r => r.status === 'PENDING' || !r.status);
  
  // Logica di filtraggio per la libreria
  const readyBooks = requests.filter(r => r.status === 'READY');
  const filteredReadyBooks = readyBooks.filter(book => {
    const matchesText = book.title.toLowerCase().includes(libFilterText.toLowerCase()) || 
                        book.author.toLowerCase().includes(libFilterText.toLowerCase());
    const matchesFormat = libFilterFormat === 'ALL' || book.format === libFilterFormat;
    const matchesLang = libFilterLang === 'ALL' || book.language === libFilterLang;
    
    return matchesText && matchesFormat && matchesLang;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">

      {/* COLONNA SX: RICERCA */}
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

      {/* COLONNA DX: LIBRERIA E RICHIESTE */}
      <section className="md:col-span-2 space-y-10">
        
        {/* SEZIONE 1: LIBRERIA (Drive) */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-[var(--brand-text)]">
              La tua Libreria 📚
            </h2>
            
            {/* Barra dei Filtri */}
            {readyBooks.length > 0 && (
              <div className="flex flex-col gap-3">
                <input 
                  type="text" 
                  placeholder="Filtra titolo o autore..." 
                  value={libFilterText}
                  onChange={(e) => setLibFilterText(e.target.value)}
                  className="border border-gray-200 px-3 py-2 text-sm rounded-xl bg-white focus:outline-none focus:border-[var(--rose-dark)]"
                />
                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] text-gray-400 font-bold self-center uppercase mr-1">Filtri:</span>
                  <button onClick={() => setLibFilterFormat(libFilterFormat === 'EPUB' ? 'ALL' : 'EPUB')} className={filterPillClass(libFilterFormat === 'EPUB')}>EPUB</button>
                  <button onClick={() => setLibFilterFormat(libFilterFormat === 'AUDIO' ? 'ALL' : 'AUDIO')} className={filterPillClass(libFilterFormat === 'AUDIO')}>AUDIO</button>
                  <button onClick={() => setLibFilterLang(libFilterLang === 'IT' ? 'ALL' : 'IT')} className={filterPillClass(libFilterLang === 'IT')}>IT</button>
                  <button onClick={() => setLibFilterLang(libFilterLang === 'EN' ? 'ALL' : 'EN')} className={filterPillClass(libFilterLang === 'EN')}>EN</button>
                </div>
              </div>
            )}
          </div>

          {readyBooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center bg-white border border-dashed border-gray-200 rounded-3xl py-12 px-6">
              <p className="text-gray-500 font-semibold">Nessun libro disponibile</p>
              <p className="text-gray-400 text-sm mt-1">I libri pronti per il download appariranno qui.</p>
            </div>
          ) : filteredReadyBooks.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-3xl text-gray-400 text-sm border border-gray-100">
              Nessun libro corrisponde ai filtri selezionati.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredReadyBooks.map((req) => (
                <div key={req.id} className="flex flex-col bg-white p-5 rounded-3xl border-2 border-[var(--rose-light)] shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex gap-5 items-start">
                    
                    {/* Copertina Grande */}
                    <div className="w-24 h-36 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden shadow-sm border border-gray-100">
                      {req.cover_url ? (
                        <img src={req.cover_url} className="w-full h-full object-cover" alt="Cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">📚</div>
                      )}
                    </div>

                    {/* Dati Libro */}
                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-extrabold text-lg text-gray-900 leading-tight line-clamp-2">{req.title}</h3>
                        <button 
                          onClick={() => deleteRequest(req.id)} 
                          className="text-gray-300 hover:text-red-500 transition-colors mt-0.5"
                          title="Elimina"
                        >
                          🗑️
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 mb-3 line-clamp-1">{req.author}</p>

                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md">
                          {req.format === 'AUDIO' ? '🎧 Audio' : '📖 EPUB'}
                        </span>
                        <span className="text-xs font-bold bg-rose-50 text-[var(--rose-dark)] px-2.5 py-1 rounded-md">
                          {req.language === 'IT' ? '🇮🇹 IT' : '🇬🇧 EN'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottone Scarica */}
                  <a 
                    href={req.download_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-5 w-full bg-[var(--rose-dark)] text-white text-sm font-bold py-3.5 rounded-xl text-center hover:bg-opacity-90 transition-all shadow-sm"
                  >
                    Scarica {req.format}
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SEZIONE 2: IN ATTESA */}
        <div>
          <h2 className="text-xl font-bold text-gray-400 mb-6">
            In attesa {pendingBooks.length > 0 && `(${pendingBooks.length})`}
          </h2>

          {pendingBooks.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 opacity-80">
              {pendingBooks.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100"
                >
                  {req.cover_url ? (
                    <img src={req.cover_url} className="w-10 h-14 object-cover rounded-md shrink-0 grayscale" />
                  ) : (
                    <div className="w-10 h-14 bg-gray-200 rounded-md shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-xs text-gray-700 truncate">{req.title}</h3>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[9px] font-bold bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded">
                        {req.format}
                      </span>
                      <span className="text-[9px] font-bold bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded">
                        {req.language}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteRequest(req.id)}
                    className="shrink-0 text-gray-400 hover:text-red-500 p-2 transition-colors"
                    title="Annulla richiesta"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </section>
    </div>
  );
}