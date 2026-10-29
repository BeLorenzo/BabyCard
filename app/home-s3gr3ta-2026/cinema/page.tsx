'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ui/Toast';

const TMDB_GENRES = [
  { id: 28, name: 'Azione' },
  { id: 35, name: 'Commedia' },
  { id: 18, name: 'Dramma' },
  { id: 878, name: 'Fantascienza' },
  { id: 27, name: 'Horror' },
  { id: 53, name: 'Thriller' },
  { id: 10749, name: 'Romantico' },
  { id: 16, name: 'Animazione' },
];

const ROULETTE_SORT_OPTIONS = [
  'popularity.desc',
  'vote_average.desc',
  'revenue.desc',
  'vote_count.desc',
];

type TabType = 'ESPLORA' | 'WATCHLIST' | 'VISTI' | 'ROULETTE';
type CardType = 'TMDB' | 'WATCHLIST' | 'HISTORY' | 'ROULETTE';

interface MovieItem {
  id: number;
  tmdb_id?: number;
  title: string;
  poster_path: string | null;
  vote_average?: number;
  genre_ids?: number[];
  status?: 'DA_VEDERE' | 'VISTO';
  rating?: number;
  notes?: string;
}

interface MovieDetails {
  id: number;
  title: string;
  poster_path: string | null;
  release_date?: string;
  vote_average?: number;
  runtime?: number;
  overview?: string;
  credits?: {
    crew?: { job: string; name: string }[];
    cast?: { id: number; name: string }[];
  };
}

interface MovieCardProps {
  movie: MovieItem;
  type: CardType;
  isSaved: boolean;
  isCurrentlySaving: boolean;
  onOpenModal: (movie: MovieItem) => void;
  onSaveToWatchlist: (movie: MovieItem) => void;
  onReviewMovie: (movie: MovieItem) => void;
  onDeleteMovie: (id: number) => void;
}

function MovieCard({
  movie,
  type,
  isSaved,
  isCurrentlySaving,
  onOpenModal,
  onSaveToWatchlist,
  onReviewMovie,
  onDeleteMovie,
}: MovieCardProps) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-all group relative h-full">
      <div
        className="relative aspect-[2/3] shrink-0 bg-gray-100 overflow-hidden cursor-pointer"
        onClick={() => onOpenModal(movie)}
      >
        {movie.poster_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🎬</div>
        )}

        {movie.vote_average && movie.vote_average > 0 ? (
          <div className="absolute top-2 right-2 z-10 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded-md shadow-md">
            ⭐ {movie.vote_average.toFixed(1)}
          </div>
        ) : null}
        <div className="hidden lg:flex absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center text-white font-bold backdrop-blur-sm">
          Dettagli
        </div>
      </div>

      <div className="p-2 md:p-3 flex flex-col flex-1 gap-2 md:gap-3 justify-between">
        <div className="h-[32px] md:h-[36px]">
          <h3
            className="font-bold text-[11px] md:text-sm text-gray-900 line-clamp-2 leading-tight"
            title={movie.title}
          >
            {movie.title}
          </h3>
        </div>

        {type === 'HISTORY' && (
          <div className="bg-gray-50 p-2 rounded-lg text-[10px] md:text-xs border border-gray-100">
            <div className="font-bold text-yellow-500 mb-0.5">Voto: {movie.rating}/10</div>
            <div className="text-gray-500 italic line-clamp-2" title={movie.notes}>
              {movie.notes || 'Nessuna nota'}
            </div>
          </div>
        )}

        <div className="flex gap-1 md:gap-2 shrink-0">
          {(type === 'TMDB' || type === 'ROULETTE') && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSaveToWatchlist(movie);
              }}
              disabled={isSaved || isCurrentlySaving}
              className={`w-full py-1.5 md:py-2 rounded-xl text-[10px] md:text-xs font-bold transition-all ${
                isSaved
                  ? 'bg-green-100 text-green-700 cursor-not-allowed'
                  : isCurrentlySaving
                  ? 'bg-gray-200 text-gray-500 cursor-wait'
                  : 'bg-gray-100 text-gray-700 hover:bg-[var(--rose-dark)] hover:text-white'
              }`}
            >
              {isSaved ? '✓ Salvato' : isCurrentlySaving ? '⏳' : '+ Watchlist'}
            </button>
          )}

          {type === 'WATCHLIST' && (
            <>
              <button
                onClick={() => onReviewMovie(movie)}
                className="flex-1 py-1.5 md:py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-xl text-[10px] md:text-xs font-bold transition-colors"
              >
                ✓ Visto
              </button>
              <button
                onClick={() => onDeleteMovie(movie.id)}
                className="px-2 md:px-3 py-1.5 md:py-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl text-[10px] md:text-xs transition-colors"
              >
                🗑️
              </button>
            </>
          )}

          {type === 'HISTORY' && (
            <button
              onClick={() => onDeleteMovie(movie.id)}
              className="w-full py-1.5 md:py-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl text-[10px] md:text-xs font-bold transition-colors"
            >
              Elimina
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface MovieRowProps {
  title: string;
  movies: MovieItem[];
  type: CardType;
  savedTmdbIds: Set<number>;
  savingId: number | null;
  onOpenModal: (movie: MovieItem) => void;
  onSaveToWatchlist: (movie: MovieItem) => void;
  onReviewMovie: (movie: MovieItem) => void;
  onDeleteMovie: (id: number) => void;
}

function MovieRow({
  title,
  movies,
  type,
  savedTmdbIds,
  savingId,
  onOpenModal,
  onSaveToWatchlist,
  onReviewMovie,
  onDeleteMovie,
}: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo =
        direction === 'left' ? scrollLeft - clientWidth + 150 : scrollLeft + clientWidth - 150;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div className="mb-6 md:mb-8 relative group/row">
      <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4 px-1">{title}</h2>

      <button
        onClick={() => scroll('left')}
        className="hidden md:flex absolute left-[-20px] top-[50%] -translate-y-1/2 z-10 bg-white/90 shadow-md p-3 rounded-full opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-gray-100 border border-gray-200 text-xl text-[var(--rose-dark)]"
      >
        ←
      </button>

      <div
        ref={rowRef}
        className="flex overflow-x-auto gap-3 md:gap-4 pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {movies.map((m) => {
          const tmdbId = type === 'TMDB' || type === 'ROULETTE' ? m.id : m.tmdb_id || m.id;
          return (
            <div key={m.id} className="w-[130px] md:w-[180px] shrink-0 snap-start flex flex-col">
              <MovieCard
                movie={m}
                type={type}
                isSaved={savedTmdbIds.has(tmdbId)}
                isCurrentlySaving={savingId === tmdbId}
                onOpenModal={onOpenModal}
                onSaveToWatchlist={onSaveToWatchlist}
                onReviewMovie={onReviewMovie}
                onDeleteMovie={onDeleteMovie}
              />
            </div>
          );
        })}
      </div>

      <button
        onClick={() => scroll('right')}
        className="hidden md:flex absolute right-[-20px] top-[50%] -translate-y-1/2 z-10 bg-white/90 shadow-md p-3 rounded-full opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-gray-100 border border-gray-200 text-xl text-[var(--rose-dark)]"
      >
        →
      </button>
    </div>
  );
}

export default function CinemaPage() {
  const { showToast, confirmAction } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('ESPLORA');
  const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  // Stati Supabase
  const [watchlist, setWatchlist] = useState<MovieItem[]>([]);
  const [history, setHistory] = useState<MovieItem[]>([]);
  const [savingId, setSavingId] = useState<number | null>(null);

  // Stati Home
  const [homeRows, setHomeRows] = useState<{ trending: MovieItem[]; latest: MovieItem[] }>({
    trending: [],
    latest: [],
  });

  // Stati Ricerca & Paginazione
  const [searchResults, setSearchResults] = useState<MovieItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchPage, setSearchPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGenre, setFilterGenre] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // Modali e Recensioni
  const [selectedMovie, setSelectedMovie] = useState<MovieItem | null>(null);
  const [movieDetails, setMovieDetails] = useState<MovieDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [reviewingMovie, setReviewingMovie] = useState<MovieItem | null>(null);
  const [rating, setRating] = useState<number>(7);
  const [notes, setNotes] = useState('');

  // Roulette (con memoria anti-ripetizione)
  const [rouletteResult, setRouletteResult] = useState<MovieItem | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rouletteGenre, setRouletteGenre] = useState('');
  const [rouletteYear, setRouletteYear] = useState('');
  const [seenWatchlistIds, setSeenWatchlistIds] = useState<number[]>([]);
  const [seenGlobalIds, setSeenGlobalIds] = useState<number[]>([]);

  const savedTmdbIds = new Set<number>([
    ...watchlist.map((w) => w.tmdb_id || w.id),
    ...history.map((h) => h.tmdb_id || h.id),
  ]);

  const refreshMyMovies = async () => {
    const { data } = await supabase
      .from('movies_watchlist')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) {
      const typed = data as MovieItem[];
      setWatchlist(typed.filter((m) => m.status === 'DA_VEDERE'));
      setHistory(typed.filter((m) => m.status === 'VISTO'));
    }
  };

  const executeSearch = async (pageToFetch: number, isAppending: boolean) => {
    if (!API_KEY) return;
    try {
      let url = searchQuery.trim()
        ? `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=it-IT&query=${encodeURIComponent(searchQuery)}&page=${pageToFetch}`
        : `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=it-IT&sort_by=popularity.desc&page=${pageToFetch}`;

      if (!searchQuery.trim()) {
        if (filterGenre) url += `&with_genres=${filterGenre}`;
        if (filterYear) url += `&primary_release_year=${filterYear}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (isAppending) {
        setSearchResults((prev) => [...prev, ...(data.results || [])]);
      } else {
        setSearchResults(data.results || []);
      }
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let ignore = false;

    supabase
      .from('movies_watchlist')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (!ignore && data) {
          const typed = data as MovieItem[];
          setWatchlist(typed.filter((m) => m.status === 'DA_VEDERE'));
          setHistory(typed.filter((m) => m.status === 'VISTO'));
        }
      });

    if (API_KEY) {
      Promise.all([
        fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}&language=it-IT`).then((r) => r.json()),
        fetch(`https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=it-IT`).then((r) => r.json()),
        fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=it-IT&sort_by=popularity.desc&page=1`).then((r) => r.json()),
      ])
        .then(([trend, latest, discover]) => {
          if (!ignore) {
            setHomeRows({
              trending: trend.results || [],
              latest: latest.results || [],
            });
            setSearchResults(discover.results || []);
            setTotalPages(discover.total_pages || 1);
          }
        })
        .catch(console.error);
    }

    return () => {
      ignore = true;
    };
  }, [API_KEY]);

  const saveToWatchlist = async (movie: MovieItem) => {
    const tmdbId = movie.tmdb_id || movie.id;
    setSavingId(tmdbId);
    const { error } = await supabase.from('movies_watchlist').insert([
      {
        tmdb_id: tmdbId,
        title: movie.title,
        poster_path: movie.poster_path,
        status: 'DA_VEDERE',
        genre_ids: movie.genre_ids || [],
      },
    ]);

    if (error?.code !== '23505' && error) {
      showToast('Errore nel salvataggio.', 'error');
    } else {
      showToast(`"${movie.title}" aggiunto alla Watchlist! 🍿`, 'success');
    }
    await refreshMyMovies();
    setSavingId(null);
  };

  const markAsWatched = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingMovie) return;
    await supabase
      .from('movies_watchlist')
      .update({ status: 'VISTO', rating, notes })
      .eq('id', reviewingMovie.id);
    showToast(`Voto salvato per "${reviewingMovie.title}"! ⭐`, 'success');
    setReviewingMovie(null);
    setNotes('');
    refreshMyMovies();
  };

  const deleteMovie = async (id: number) => {
    const ok = await confirmAction('Sicuro di volerlo eliminare?');
    if (!ok) return;
    await supabase.from('movies_watchlist').delete().eq('id', id);
    showToast('Film rimosso', 'info');
    refreshMyMovies();
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchPage(1);

    if (!searchQuery.trim() && !filterGenre && !filterYear) {
      setHasSearched(false);
      await executeSearch(1, false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    await executeSearch(1, false);
    setIsSearching(false);
  };

  const loadMore = async () => {
    if (searchPage >= totalPages) return;
    setIsLoadingMore(true);
    const nextPage = searchPage + 1;
    setSearchPage(nextPage);
    await executeSearch(nextPage, true);
    setIsLoadingMore(false);
  };

  const fetchMovieDetails = async (tmdb_id: number) => {
    if (!API_KEY) return;
    setIsLoadingDetails(true);
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/${tmdb_id}?api_key=${API_KEY}&language=it-IT&append_to_response=credits`
      );
      setMovieDetails(await res.json());
    } catch (err) {
      console.error(err);
    }
    setIsLoadingDetails(false);
  };

  const openModal = (movie: MovieItem) => {
    setSelectedMovie(movie);
    fetchMovieDetails(movie.tmdb_id || movie.id);
  };

  // --- ROULETTE ANTI-RIPETIZIONE ---
  const spinWatchlistRoulette = () => {
    if (watchlist.length === 0) {
      showToast('La watchlist è vuota!', 'error');
      return;
    }
    setIsSpinning(true);

    setTimeout(() => {
      let pool = watchlist.filter((m) => !seenWatchlistIds.includes(m.id));
      let nextSeen = [...seenWatchlistIds];

      if (pool.length === 0) {
        pool =
          watchlist.length > 1 && rouletteResult
            ? watchlist.filter((m) => m.id !== rouletteResult.id)
            : watchlist;
        nextSeen = [];
      }

      const winner = pool[Math.floor(Math.random() * pool.length)];
      setRouletteResult(winner);
      setSeenWatchlistIds([...nextSeen, winner.id]);
      setIsSpinning(false);
    }, 600);
  };

  const spinGlobalRoulette = async () => {
    if (!API_KEY) {
      showToast('Manca NEXT_PUBLIC_TMDB_API_KEY nel file .env.local!', 'error');
      return;
    }
    setIsSpinning(true);

    try {
      const randomSort =
        ROULETTE_SORT_OPTIONS[Math.floor(Math.random() * ROULETTE_SORT_OPTIONS.length)];
      let baseUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=it-IT&sort_by=${randomSort}&vote_count.gte=40`;
      if (rouletteGenre) baseUrl += `&with_genres=${rouletteGenre}`;
      if (rouletteYear) baseUrl += `&primary_release_date.gte=${rouletteYear}-01-01`;

      const firstRes = await fetch(`${baseUrl}&page=1`);
      const firstData = await firstRes.json();
      const maxPages = Math.min(firstData.total_pages || 1, 30);

      if (!firstData.results || firstData.results.length === 0) {
        showToast('Nessun film trovato con questi filtri. Allarga la ricerca!', 'error');
        setIsSpinning(false);
        return;
      }

      const randomPage = Math.floor(Math.random() * maxPages) + 1;
      const pageData =
        randomPage === 1
          ? firstData
          : await (await fetch(`${baseUrl}&page=${randomPage}`)).json();

      const results: MovieItem[] = pageData.results || firstData.results;

      const watchedOrSavedIds = new Set([
        ...history.map((h) => h.tmdb_id || h.id),
        ...watchlist.map((w) => w.tmdb_id || w.id),
        ...seenGlobalIds,
      ]);

      let candidates = results.filter((m) => !watchedOrSavedIds.has(m.id));
      if (candidates.length === 0) {
        candidates = results.filter((m) => m.id !== rouletteResult?.id);
      }

      const winner = candidates[Math.floor(Math.random() * candidates.length)] || results[0];
      setRouletteResult(winner);
      setSeenGlobalIds((prev) => [...prev, winner.id]);
    } catch (err) {
      console.error(err);
    }
    setIsSpinning(false);
  };

  const groupMoviesByCategory = (movies: MovieItem[]) => {
    const groups: { name: string; items: MovieItem[] }[] = [];
    TMDB_GENRES.forEach((g) => {
      const matched = movies.filter((m) => m.genre_ids?.includes(g.id));
      if (matched.length > 0) groups.push({ name: g.name, items: matched });
    });
    const uncategorized = movies.filter((m) => !m.genre_ids || m.genre_ids.length === 0);
    if (uncategorized.length > 0) groups.push({ name: 'Altro', items: uncategorized });
    return groups;
  };

  return (
    <div className="max-w-6xl mx-auto px-3 md:px-4 py-6 md:py-8 min-h-screen">
      <header className="mb-6 md:mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--brand-text)] mb-2 md:mb-3">
          🍿 Serata Cinema
        </h1>
      </header>

      {/* TABS */}
      <div className="grid grid-cols-2 md:flex md:justify-center gap-2 mb-6 md:mb-8 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
        {(['ESPLORA', 'WATCHLIST', 'VISTI', 'ROULETTE'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setRouletteResult(null);
            }}
            className={`w-full px-2 py-3 md:px-5 md:py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${
              activeTab === tab
                ? 'bg-[var(--rose-dark)] text-white shadow-md'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            {tab === 'ESPLORA' && '🔍 Esplora'}
            {tab === 'WATCHLIST' && `📌 Watchlist (${watchlist.length})`}
            {tab === 'VISTI' && `⭐ Visti (${history.length})`}
            {tab === 'ROULETTE' && '🎲 Roulette'}
          </button>
        ))}
      </div>

      {/* --- TAB ESPLORA --- */}
      {activeTab === 'ESPLORA' && (
        <div className="space-y-6">
          <form
            onSubmit={handleSearch}
            className="bg-white p-4 md:p-5 rounded-3xl shadow-sm border border-[var(--rose-light)] flex flex-col md:flex-row md:items-end gap-3 md:gap-4 mb-8 md:mb-10"
          >
            <div className="flex-1 w-full">
              <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase mb-1 block">
                Ricerca
              </label>
              <input
                type="text"
                placeholder="Es. Interstellar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-200 p-2.5 md:p-3 rounded-xl bg-gray-50 outline-none"
              />
            </div>
            <div className="w-full md:w-32">
              <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase mb-1 block">
                Genere
              </label>
              <select
                value={filterGenre}
                onChange={(e) => setFilterGenre(e.target.value)}
                className="w-full border border-gray-200 p-2.5 md:p-3 rounded-xl bg-gray-50 outline-none"
              >
                <option value="">Tutti</option>
                {TMDB_GENRES.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full md:w-24">
              <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase mb-1 block">
                Anno
              </label>
              <input
                type="number"
                placeholder="Es. 2024"
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="w-full border border-gray-200 p-2.5 md:p-3 rounded-xl bg-gray-50 outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="w-full md:w-auto bg-[var(--rose-dark)] text-white px-8 py-3 rounded-xl font-bold hover:bg-opacity-90 transition mt-2 md:mt-0"
            >
              {isSearching ? '⏳' : 'Cerca'}
            </button>
          </form>

          {!hasSearched && (
            <div className="animate-fade-in-up">
              <MovieRow
                title="🔥 In Tendenza"
                movies={homeRows.trending}
                type="TMDB"
                savedTmdbIds={savedTmdbIds}
                savingId={savingId}
                onOpenModal={openModal}
                onSaveToWatchlist={saveToWatchlist}
                onReviewMovie={setReviewingMovie}
                onDeleteMovie={deleteMovie}
              />
              <MovieRow
                title="🎬 Ultime Uscite"
                movies={homeRows.latest}
                type="TMDB"
                savedTmdbIds={savedTmdbIds}
                savingId={savingId}
                onOpenModal={openModal}
                onSaveToWatchlist={saveToWatchlist}
                onReviewMovie={setReviewingMovie}
                onDeleteMovie={deleteMovie}
              />
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 px-1 border-t border-gray-100 pt-6 md:pt-8">
                Tutti i Film
              </h2>
            </div>
          )}

          <div className="animate-fade-in-up">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
              {searchResults.length === 0 ? (
                <p className="col-span-full text-center text-gray-400">Nessun film trovato.</p>
              ) : (
                searchResults.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    type="TMDB"
                    isSaved={savedTmdbIds.has(movie.id)}
                    isCurrentlySaving={savingId === movie.id}
                    onOpenModal={openModal}
                    onSaveToWatchlist={saveToWatchlist}
                    onReviewMovie={setReviewingMovie}
                    onDeleteMovie={deleteMovie}
                  />
                ))
              )}
            </div>

            {searchPage < totalPages && searchResults.length > 0 && (
              <div className="flex justify-center mt-8 md:mt-10">
                <button
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  className="w-full md:w-auto bg-white border-2 border-[var(--rose-light)] text-[var(--brand-text)] font-bold py-3 px-10 rounded-2xl hover:bg-rose-50 transition shadow-sm"
                >
                  {isLoadingMore ? '⏳ Caricamento...' : 'Carica altri risultati'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB WATCHLIST & VISTI --- */}
      {activeTab === 'WATCHLIST' && (
        <div className="animate-fade-in-up space-y-8 md:space-y-12">
          {watchlist.length === 0 ? (
            <p className="text-center text-gray-400 py-10">La tua watchlist è vuota.</p>
          ) : (
            groupMoviesByCategory(watchlist).map((group) => (
              <MovieRow
                key={group.name}
                title={group.name}
                movies={group.items}
                type="WATCHLIST"
                savedTmdbIds={savedTmdbIds}
                savingId={savingId}
                onOpenModal={openModal}
                onSaveToWatchlist={saveToWatchlist}
                onReviewMovie={setReviewingMovie}
                onDeleteMovie={deleteMovie}
              />
            ))
          )}
        </div>
      )}
      {activeTab === 'VISTI' && (
        <div className="animate-fade-in-up space-y-8 md:space-y-12">
          {history.length === 0 ? (
            <p className="text-center text-gray-400 py-10">Non avete ancora segnato film visti.</p>
          ) : (
            groupMoviesByCategory(history).map((group) => (
              <MovieRow
                key={group.name}
                title={group.name}
                movies={group.items}
                type="HISTORY"
                savedTmdbIds={savedTmdbIds}
                savingId={savingId}
                onOpenModal={openModal}
                onSaveToWatchlist={saveToWatchlist}
                onReviewMovie={setReviewingMovie}
                onDeleteMovie={deleteMovie}
              />
            ))
          )}
        </div>
      )}

      {/* --- TAB ROULETTE --- */}
      {activeTab === 'ROULETTE' && (
        <div className="max-w-2xl mx-auto space-y-6 md:space-y-8 text-center animate-fade-in-up">
          <p className="text-sm md:text-base text-gray-500">
            Non sapete cosa guardare? Lasciate decidere al fato (senza doppioni!).
          </p>

          <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-center">
            <button
              onClick={spinWatchlistRoulette}
              disabled={isSpinning}
              className="bg-gray-800 text-white font-bold py-3.5 md:py-4 px-8 rounded-2xl hover:bg-gray-700 transition"
            >
              🎲 Dalla Watchlist
            </button>
            <button
              onClick={spinGlobalRoulette}
              disabled={isSpinning}
              className="bg-[var(--rose-dark)] text-white font-bold py-3.5 md:py-4 px-8 rounded-2xl hover:bg-opacity-90 transition shadow-[var(--rose-light)] shadow-lg"
            >
              🌍 Dal Mondo
            </button>
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs md:text-sm flex flex-col md:flex-row gap-3 md:gap-4 justify-center items-center">
            <span className="text-gray-400 font-bold uppercase w-full md:w-auto text-left md:text-center">
              Filtri &quot;Mondo&quot;:
            </span>
            <div className="flex gap-2 w-full md:w-auto">
              <select
                value={rouletteGenre}
                onChange={(e) => {
                  setRouletteGenre(e.target.value);
                  setSeenGlobalIds([]);
                }}
                className="flex-1 bg-white border border-gray-200 p-2 rounded-lg outline-none font-medium"
              >
                <option value="">Tutti i Generi</option>
                {TMDB_GENRES.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Anno min."
                value={rouletteYear}
                onChange={(e) => {
                  setRouletteYear(e.target.value);
                  setSeenGlobalIds([]);
                }}
                className="w-24 bg-white border border-gray-200 p-2 rounded-lg outline-none font-medium"
              />
            </div>
          </div>

          {isSpinning && <div className="text-5xl md:text-6xl animate-spin my-8 md:my-12">🎲</div>}

          {!isSpinning && rouletteResult && (
            <div className="mt-8 mx-auto w-[180px] md:w-[220px]">
              <h3 className="text-lg md:text-xl font-bold mb-4 text-[var(--brand-text)]">
                Vincitore! 🎉
              </h3>
              <div className="flex flex-col">
                <MovieCard
                  movie={rouletteResult}
                  type={rouletteResult.tmdb_id ? 'WATCHLIST' : 'ROULETTE'}
                  isSaved={savedTmdbIds.has(rouletteResult.tmdb_id || rouletteResult.id)}
                  isCurrentlySaving={savingId === (rouletteResult.tmdb_id || rouletteResult.id)}
                  onOpenModal={openModal}
                  onSaveToWatchlist={saveToWatchlist}
                  onReviewMovie={setReviewingMovie}
                  onDeleteMovie={deleteMovie}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- MODALI --- */}
      {reviewingMovie && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={markAsWatched}
            className="bg-white rounded-3xl p-5 md:p-6 w-full max-w-md shadow-2xl"
          >
            <h3 className="text-lg md:text-xl font-bold mb-4">
              Com&apos;era {reviewingMovie.title}?
            </h3>
            <div className="mb-4">
              <input
                type="range"
                min="1"
                max="10"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full accent-[var(--rose-dark)]"
              />
              <div className="text-center font-black text-2xl text-[var(--rose-dark)] mt-2">
                {rating}/10
              </div>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Recensione privata..."
              className="w-full border border-gray-200 p-3 rounded-xl bg-gray-50 outline-none mb-6 text-sm"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setReviewingMovie(null)}
                className="flex-1 bg-gray-100 text-gray-700 font-bold py-2.5 md:py-3 rounded-xl hover:bg-gray-200"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="flex-1 bg-[var(--rose-dark)] text-white font-bold py-2.5 md:py-3 rounded-xl hover:bg-opacity-90"
              >
                Salva
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedMovie && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedMovie(null);
          }}
        >
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] md:max-h-[85vh] overflow-hidden flex flex-col relative">
            <button
              onClick={() => setSelectedMovie(null)}
              className="absolute top-3 right-3 md:top-4 md:right-4 z-10 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black"
            >
              ✕
            </button>

            {isLoadingDetails ? (
              <div className="p-20 text-center text-gray-400">Caricamento...</div>
            ) : (
              movieDetails && (
                <div className="flex flex-col md:flex-row overflow-y-auto">
                  <div className="w-full h-[220px] md:h-auto md:w-1/3 shrink-0 bg-gray-100 relative">
                    {movieDetails.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`}
                        className="w-full h-full object-cover object-top md:object-center"
                        alt="Poster"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Immagine
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent md:hidden" />
                  </div>

                  <div className="p-5 md:p-6 flex-1 -mt-4 md:mt-0 relative z-10 bg-white md:bg-transparent rounded-t-2xl md:rounded-none">
                    <h2 className="text-xl md:text-2xl font-black mb-2 leading-tight">
                      {movieDetails.title}
                    </h2>
                    <div className="flex flex-wrap gap-2 text-[10px] md:text-xs font-bold text-gray-500 mb-4 md:mb-6">
                      <span className="bg-gray-100 px-2 py-1 rounded-md">
                        {movieDetails.release_date?.substring(0, 4)}
                      </span>
                      <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-md">
                        ⭐ {movieDetails.vote_average?.toFixed(1)}
                      </span>
                      <span className="bg-gray-100 px-2 py-1 rounded-md">
                        {movieDetails.runtime} min
                      </span>
                    </div>

                    <p className="text-xs md:text-sm text-gray-700 mb-4 leading-relaxed">
                      {movieDetails.overview || 'Trama non disponibile.'}
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Regia</p>
                        <p className="text-xs md:text-sm font-semibold mb-3">
                          {movieDetails.credits?.crew?.find((c) => c.job === 'Director')?.name ||
                            'N.D.'}
                        </p>
                      </div>
                    </div>

                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">
                      Cast Principale
                    </p>
                    <div className="flex flex-wrap gap-1.5 md:gap-2">
                      {movieDetails.credits?.cast?.slice(0, 6).map((actor) => (
                        <span
                          key={actor.id}
                          className="text-[10px] md:text-xs bg-gray-50 border border-gray-100 px-2 py-1 rounded-full text-gray-600"
                        >
                          {actor.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
