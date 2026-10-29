'use client';
import { useState } from 'react';
import { BookRequest } from '../../lib/types';

interface BookCatalogProps {
  requests: BookRequest[];
  onDelete: (id: number) => void;
}

export default function BookCatalog({ requests, onDelete }: BookCatalogProps) {
  const [libFilterText, setLibFilterText] = useState('');
  const [libFilterFormat, setLibFilterFormat] = useState<'ALL' | 'EPUB' | 'AUDIO'>('ALL');
  const [libFilterLang, setLibFilterLang] = useState<'ALL' | 'IT' | 'EN'>('ALL');

  const filterPillClass = (active: boolean) =>
    `px-3 py-1.5 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
      active
        ? 'bg-[var(--rose-dark)] text-white shadow-sm'
        : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
    }`;

  const readyBooks = requests.filter((r) => r.status === 'READY');
  const pendingBooks = requests.filter((r) => r.status === 'PENDING' || !r.status);

  const filteredReadyBooks = readyBooks.filter((book) => {
    const matchesText =
      book.title.toLowerCase().includes(libFilterText.toLowerCase()) ||
      book.author.toLowerCase().includes(libFilterText.toLowerCase());
    const matchesFormat = libFilterFormat === 'ALL' || book.format === libFilterFormat;
    const matchesLang = libFilterLang === 'ALL' || book.language === libFilterLang;

    return matchesText && matchesFormat && matchesLang;
  });

  return (
    <section className="md:col-span-2 space-y-10">
      {/* SEZIONE 1: LIBRERIA (Drive) */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-[var(--brand-text)]">
            La tua Libreria 📚
          </h2>

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
                <button
                  onClick={() => setLibFilterFormat(libFilterFormat === 'EPUB' ? 'ALL' : 'EPUB')}
                  className={filterPillClass(libFilterFormat === 'EPUB')}
                >
                  EPUB
                </button>
                <button
                  onClick={() => setLibFilterFormat(libFilterFormat === 'AUDIO' ? 'ALL' : 'AUDIO')}
                  className={filterPillClass(libFilterFormat === 'AUDIO')}
                >
                  AUDIO
                </button>
                <button
                  onClick={() => setLibFilterLang(libFilterLang === 'IT' ? 'ALL' : 'IT')}
                  className={filterPillClass(libFilterLang === 'IT')}
                >
                  IT
                </button>
                <button
                  onClick={() => setLibFilterLang(libFilterLang === 'EN' ? 'ALL' : 'EN')}
                  className={filterPillClass(libFilterLang === 'EN')}
                >
                  EN
                </button>
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
              <div
                key={req.id}
                className="flex flex-col bg-white p-5 rounded-3xl border-2 border-[var(--rose-light)] shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex gap-5 items-start">
                  <div className="w-24 h-36 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden shadow-sm border border-gray-100">
                    {req.cover_url ? (
                      <img src={req.cover_url} className="w-full h-full object-cover" alt={req.title} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">📘</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-extrabold text-lg text-gray-900 leading-tight line-clamp-2">{req.title}</h3>
                      <button
                        onClick={() => onDelete(req.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors mt-0.5"
                        title="Elimina"
                        aria-label="Elimina libro"
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
                  <img src={req.cover_url} alt={req.title} className="w-10 h-14 object-cover rounded-md shrink-0 grayscale" />
                ) : (
                  <div className="w-10 h-14 bg-gray-200 rounded-md shrink-0 flex items-center justify-center text-sm">📘</div>
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
                  onClick={() => onDelete(req.id)}
                  className="shrink-0 text-gray-400 hover:text-red-500 p-2 transition-colors"
                  title="Annulla richiesta"
                  aria-label="Annulla richiesta"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
