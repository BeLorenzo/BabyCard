'use client';
import { useState } from 'react';
import { searchBooks } from '@/app/actions/books';
import { BookFormat, BookLanguage, BookSearchResult } from '../../lib/types';

interface BookSearchFormProps {
  onAddRequest: (book: BookSearchResult, format: BookFormat, language: BookLanguage) => Promise<void>;
  onAddManualRequest: (title: string, format: BookFormat, language: BookLanguage) => Promise<void>;
}

export default function BookSearchForm({ onAddRequest, onAddManualRequest }: BookSearchFormProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BookSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [message, setMessage] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const [format, setFormat] = useState<BookFormat>('EPUB');
  const [language, setLanguage] = useState<BookLanguage>('IT');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearching(true);
    setHasSearched(true);
    setSearchResults([]);
    setMessage('');

    try {
      const res = await searchBooks(query);
      if (res.error) {
        setMessage(res.error);
      } else if (res.results.length > 0) {
        setSearchResults(res.results);
      } else {
        setMessage('Nessun libro trovato. Usa il bottone qui sotto per fare la richiesta manualmente.');
      }
    } catch {
      setMessage('Errore di connessione durante la ricerca.');
    }
    setIsSearching(false);
  };

  const handleSelectBook = async (book: BookSearchResult) => {
    await onAddRequest(book, format, language);
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
    setMessage('');
  };

  const handleManual = async () => {
    if (!searchQuery.trim()) return;
    await onAddManualRequest(searchQuery.trim(), format, language);
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
    setMessage('');
  };

  const pillClass = (active: boolean) =>
    `flex-1 text-xs font-bold py-2.5 rounded-xl transition-colors ${
      active
        ? 'bg-[var(--rose-dark)] text-white'
        : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
    }`;

  return (
    <section className="md:col-span-1 bg-white p-7 rounded-3xl shadow-sm border border-gray-100">
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
        {!hasSearched && !isSearching && (
          <p className="text-center text-sm text-gray-400 py-6">Cerca un titolo per iniziare 🔎</p>
        )}

        {message && <p className="text-center text-sm text-gray-400 py-6">{message}</p>}

        {searchResults.map((book, idx) => (
          <div
            key={`${book.key}-${idx}`}
            className="flex items-center gap-3 p-3 border border-gray-100 rounded-2xl hover:border-gray-200 transition-colors"
          >
            {book.cover_url ? (
              <img
                src={book.cover_url}
                alt={book.title}
                className="w-12 h-16 object-cover rounded-lg shrink-0"
              />
            ) : (
              <div className="w-12 h-16 bg-gray-100 rounded-lg shrink-0 flex items-center justify-center text-xl">📘</div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-xs truncate">{book.title}</h3>
              <p className="text-[11px] text-gray-400 truncate">{book.author_name[0]}</p>
            </div>
            <button
              onClick={() => handleSelectBook(book)}
              className="shrink-0 w-8 h-8 rounded-full bg-[var(--rose-dark)] text-white text-lg leading-none flex items-center justify-center hover:bg-opacity-90 transition"
              aria-label="Aggiungi richiesta"
              title={`Aggiungi in ${format} - ${language}`}
            >
              +
            </button>
          </div>
        ))}

        {hasSearched && !isSearching && searchQuery.trim() !== '' && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center mb-2">Non trovi quello che cerchi?</p>
            <button
              onClick={handleManual}
              className="w-full bg-white border-2 border-dashed border-gray-300 text-gray-600 p-3 rounded-xl font-bold hover:border-[var(--rose-dark)] hover:text-[var(--rose-dark)] transition-colors text-sm"
            >
              Invia &quot;{searchQuery}&quot; manualmente
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
