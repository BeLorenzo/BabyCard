'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

const TMDB_TV_GENRES = [
  { id: 10759, name: 'Azione & Avventura' }, { id: 16, name: 'Animazione' }, { id: 35, name: 'Commedia' },
  { id: 80, name: 'Crime' }, { id: 18, name: 'Dramma' }, { id: 9648, name: 'Mistero' },
  { id: 10765, name: 'Sci-Fi & Fantasy' }, { id: 99, name: 'Documentario' }
];

type TabType = 'ESPLORA' | 'WATCHLIST' | 'IN_CORSO' | 'ARCHIVIO' | 'ROULETTE';
type ModalTab = 'INFO' | 'EPISODI';

export default function TvPage() {
  const [activeTab, setActiveTab] = useState<TabType>('ESPLORA');
  const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  // Stati Supabase
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [inProgress, setInProgress] = useState<any[]>([]);
  const [archived, setArchived] = useState<any[]>([]);
  const [savingId, setSavingId] = useState<number | null>(null);

  // Stati Home & Ricerca
  const [homeRows, setHomeRows] = useState({ trending: [], airing: [] });
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchPage, setSearchPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGenre, setFilterGenre] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // Modale Dettagli & Episodi
  const [selectedTv, setSelectedTv] = useState<any | null>(null);
  const [tvDetails, setTvDetails] = useState<any | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [modalTab, setModalTab] = useState<ModalTab>('INFO');
  
  // Gestione Stagioni/Episodi
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [seasonEpisodes, setSeasonEpisodes] = useState<any[]>([]);
  const [isLoadingSeason, setIsLoadingSeason] = useState(false);

  // Recensioni & Archiviazione
  const [reviewingTv, setReviewingTv] = useState<any | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'VISTO' | 'ABBANDONATA'>('VISTO');
  const [rating, setRating] = useState<number>(7);
  const [notes, setNotes] = useState('');

  // Roulette
  const [rouletteResult, setRouletteResult] = useState<any | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rouletteGenre, setRouletteGenre] = useState('');
  const [rouletteYear, setRouletteYear] = useState('');

  // 1. BLOCCO DELLO SCORRIMENTO DELLO SFONDO QUANDO IL MODALE È APERTO
  useEffect(() => {
    if (selectedTv || reviewingTv) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedTv, reviewingTv]);

  useEffect(() => {
    fetchHomeData();
    executeSearch(1, false); 
    fetchMyTvShows();
  }, []);

  // --- SUPABASE FUNZIONI ---
  const fetchMyTvShows = async () => {
    const { data } = await supabase.from('tv_watchlist').select('*').order('created_at', { ascending: false });
    if (data) {
      setWatchlist(data.filter(m => m.status === 'DA_VEDERE'));
      setInProgress(data.filter(m => m.status === 'IN_CORSO'));
      setArchived(data.filter(m => m.status === 'VISTO' || m.status === 'ABBANDONATA'));
    }
  };

  const saveToWatchlist = async (tv: any) => {
    setSavingId(tv.id);
    const { error } = await supabase.from('tv_watchlist').insert([{
      tmdb_id: tv.id,
      title: tv.name,
      poster_path: tv.poster_path,
      status: 'DA_VEDERE',
      genre_ids: tv.genre_ids || [],
      watched_episodes: []
    }]);

    if (error?.code !== '23505' && error) alert('Errore nel salvataggio.');
    await fetchMyTvShows();
    setSavingId(null);
  };

  const changeStatus = async (id: number, newStatus: string) => {
    await supabase.from('tv_watchlist').update({ status: newStatus }).eq('id', id);
    fetchMyTvShows();
  };

  const markAsArchived = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingTv) return;
    await supabase.from('tv_watchlist').update({ 
      status: reviewStatus, 
      rating, 
      notes 
    }).eq('id', reviewingTv.id);
    
    setReviewingTv(null);
    setNotes('');
    fetchMyTvShows();
  };

  const deleteTvShow = async (id: number) => {
    if (!confirm('Sicuro di volerla eliminare? Tutte le spunte degli episodi andranno perse.')) return;
    await supabase.from('tv_watchlist').delete().eq('id', id);
    fetchMyTvShows();
    setSelectedTv(null);
  };

  // --- GESTIONE EPISODI (Spunte) ---
  const toggleEpisode = async (seasonNum: number, epNum: number) => {
    const myTv = [...watchlist, ...inProgress, ...archived].find(t => t.tmdb_id === selectedTv.id || t.id === selectedTv.id);
    if (!myTv) return;

    let updatedStatus = myTv.status;
    if (myTv.status === 'DA_VEDERE') {
      updatedStatus = 'IN_CORSO';
    }

    const epCode = `S${seasonNum}E${epNum}`;
    const currentWatched = myTv.watched_episodes || [];
    const isWatched = currentWatched.includes(epCode);
    
    const newWatched = isWatched 
      ? currentWatched.filter((code: string) => code !== epCode)
      : [...currentWatched, epCode];

    await supabase.from('tv_watchlist')
      .update({ watched_episodes: newWatched, status: updatedStatus })
      .eq('id', myTv.id);
    
    fetchMyTvShows();
  };

  // --- TMDB FUNZIONI ---
  const fetchHomeData = async () => {
    if (!API_KEY) return;
    try {
      const [trendRes, airingRes] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/trending/tv/week?api_key=${API_KEY}&language=it-IT`),
        fetch(`https://api.themoviedb.org/3/tv/on_the_air?api_key=${API_KEY}&language=it-IT`)
      ]);
      const [trend, airing] = await Promise.all([trendRes.json(), airingRes.json()]);
      setHomeRows({ trending: trend.results || [], airing: airing.results || [] });
    } catch (err) { console.error(err); }
  };

  const executeSearch = async (pageToFetch: number, isAppending: boolean) => {
    try {
      let url = searchQuery.trim() 
        ? `https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&language=it-IT&query=${encodeURIComponent(searchQuery)}&page=${pageToFetch}`
        : `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&language=it-IT&sort_by=popularity.desc&page=${pageToFetch}`;
      
      if (!searchQuery.trim()) {
        if (filterGenre) url += `&with_genres=${filterGenre}`;
        if (filterYear) url += `&first_air_date_year=${filterYear}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      
      if (isAppending) setSearchResults(prev => [...prev, ...(data.results || [])]);
      else setSearchResults(data.results || []);
      setTotalPages(data.total_pages || 1);
    } catch (err) { console.error(err); }
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

  const fetchTvDetails = async (tmdb_id: number) => {
    setIsLoadingDetails(true);
    try {
      const res = await fetch(`https://api.themoviedb.org/3/tv/${tmdb_id}?api_key=${API_KEY}&language=it-IT&append_to_response=credits`);
      const data = await res.json();
      setTvDetails(data);
      
      const defaultSeason = data.seasons?.find((s:any) => s.season_number === 1)?.season_number || data.seasons?.[0]?.season_number || 1;
      setSelectedSeason(defaultSeason);
      fetchSeasonEpisodes(tmdb_id, defaultSeason);
      
    } catch (err) { console.error(err); }
    setIsLoadingDetails(false);
  };

  const fetchSeasonEpisodes = async (tmdb_id: number, seasonNum: number) => {
    setIsLoadingSeason(true);
    try {
      const res = await fetch(`https://api.themoviedb.org/3/tv/${tmdb_id}/season/${seasonNum}?api_key=${API_KEY}&language=it-IT`);
      const data = await res.json();
      setSeasonEpisodes(data.episodes || []);
    } catch (err) { console.error(err); }
    setIsLoadingSeason(false);
  };

  const handleSeasonChange = (seasonNum: number) => {
    setSelectedSeason(seasonNum);
    fetchSeasonEpisodes(selectedTv.tmdb_id || selectedTv.id, seasonNum);
  };

  const openModal = (tv: any) => {
    setSelectedTv(tv);
    setModalTab('INFO');
    fetchTvDetails(tv.tmdb_id || tv.id);
  };

  // --- ROULETTE FUNZIONI ---
  const spinGlobalRoulette = async () => {
    setIsSpinning(true);
    try {
      const randomPage = Math.floor(Math.random() * 50) + 1;
      let url = `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&language=it-IT&page=${randomPage}&vote_count.gte=10`;
      if (rouletteGenre) url += `&with_genres=${rouletteGenre}`;
      if (rouletteYear) url += `&first_air_date_year=${rouletteYear}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.results?.length > 0) setRouletteResult(data.results[Math.floor(Math.random() * data.results.length)]);
      else alert("Nessuna serie trovata. Allarga i filtri.");
    } catch (err) { console.error(err); }
    setIsSpinning(false);
  };

  const groupByCategory = (items: any[]) => {
    const groups: { name: string, items: any[] }[] = [];
    TMDB_TV_GENRES.forEach(g => {
      const matched = items.filter(i => i.genre_ids?.includes(g.id));
      if (matched.length > 0) groups.push({ name: g.name, items: matched });
    });
    const uncategorized = items.filter(i => !i.genre_ids || i.genre_ids.length === 0);
    if (uncategorized.length > 0) groups.push({ name: 'Altro', items: uncategorized });
    return groups;
  };

  // --- COMPONENTI UI ---
  const TvCard = ({ tv, type }: { tv: any, type: 'TMDB' | 'WATCHLIST' | 'IN_CORSO' | 'ARCHIVIO' | 'ROULETTE' }) => {
    const tmdbId = (type === 'TMDB' || type === 'ROULETTE') ? tv.id : tv.tmdb_id;
    const isSaved = watchlist.some(w => w.tmdb_id === tmdbId) || inProgress.some(i => i.tmdb_id === tmdbId) || archived.some(a => a.tmdb_id === tmdbId);
    const isCurrentlySaving = savingId === tmdbId;
    const tvTitle = tv.name || tv.title;

    return (
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-all group relative h-full">
        <div className="relative aspect-[2/3] shrink-0 bg-gray-100 overflow-hidden cursor-pointer" onClick={() => openModal(tv)}>
          {tv.poster_path ? (
            <img src={`https://image.tmdb.org/t/p/w500${tv.poster_path}`} alt={tvTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : <div className="w-full h-full flex items-center justify-center text-4xl">📺</div>}
          
          {tv.vote_average > 0 && (
            <div className="absolute top-2 right-2 z-10 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded-md shadow-md">
              ⭐ {tv.vote_average.toFixed(1)}
            </div>
          )}
          <div className="hidden lg:flex absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center text-white font-bold backdrop-blur-sm">Dettagli</div>
        </div>

        <div className="p-2 md:p-3 flex flex-col flex-1 gap-2 md:gap-3 justify-between">
          <div className="h-[32px] md:h-[36px]">
            <h3 className="font-bold text-[11px] md:text-sm text-gray-900 line-clamp-2 leading-tight" title={tvTitle}>{tvTitle}</h3>
          </div>
          
          {(type === 'TMDB' || type === 'ROULETTE') && (
            <div className="flex shrink-0 mt-auto">
              <button onClick={(e) => { e.stopPropagation(); saveToWatchlist(tv); }} disabled={isSaved || isCurrentlySaving} className={`w-full py-1.5 md:py-2 rounded-xl text-[10px] md:text-xs font-bold transition-all ${isSaved ? 'bg-green-100 text-green-700 cursor-not-allowed' : isCurrentlySaving ? 'bg-gray-200 text-gray-500 cursor-wait' : 'bg-gray-100 text-gray-700 hover:bg-[var(--rose-dark)] hover:text-white'}`}>
                {isSaved ? '✓ In Lista' : isCurrentlySaving ? '⏳' : '+ Watchlist'}
              </button>
            </div>
          )}
            
          {type === 'WATCHLIST' && (
            <div className="flex gap-1 md:gap-2 shrink-0 mt-auto">
              <button onClick={(e) => { e.stopPropagation(); openModal(tv); }} className="flex-1 py-1.5 md:py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-[10px] md:text-xs font-bold transition-colors">▶ Episodi</button>
              <button onClick={(e) => { e.stopPropagation(); deleteTvShow(tv.id); }} className="px-2 md:px-3 py-1.5 md:py-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl text-[10px] md:text-xs transition-colors">🗑️</button>
            </div>
          )}

          {type === 'IN_CORSO' && (
            <div className="flex flex-col gap-1 shrink-0 mt-auto">
              <button onClick={(e) => { e.stopPropagation(); setReviewingTv(tv); }} className="w-full bg-[var(--rose-dark)] text-white py-1.5 rounded-xl text-[10px] md:text-xs font-bold transition-colors mb-1">Archivia</button>
            </div>
          )}
            
          {type === 'ARCHIVIO' && (
            <div className="flex flex-col shrink-0 mt-auto">
              <div className={`p-1.5 rounded-lg text-[10px] mb-2 border text-center font-bold ${tv.status === 'VISTO' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                {tv.status === 'VISTO' ? '✓ FINITA' : '⨯ ABBANDONATA'}
              </div>
              {tv.rating > 0 && <div className="text-[10px] text-yellow-500 font-bold mb-1 text-center">Voto: {tv.rating}/10</div>}
              <button onClick={(e) => { e.stopPropagation(); deleteTvShow(tv.id); }} className="w-full py-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl text-[10px] font-bold transition-colors">Elimina</button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const TvRow = ({ title, items, type }: { title: string, items: any[], type: any }) => {
    const rowRef = useRef<HTMLDivElement>(null);
    const scroll = (direction: 'left' | 'right') => {
      if (rowRef.current) {
        const { scrollLeft, clientWidth } = rowRef.current;
        const scrollTo = direction === 'left' ? scrollLeft - clientWidth + 150 : scrollLeft + clientWidth - 150;
        rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
      }
    };
    if (!items || items.length === 0) return null;
    return (
      <div className="mb-6 md:mb-8 relative group/row">
        <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4 px-1">{title}</h2>
        <button onClick={() => scroll('left')} className="hidden md:flex absolute left-[-20px] top-[50%] -translate-y-1/2 z-10 bg-white/90 shadow-md p-3 rounded-full opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-gray-100 border border-gray-200 text-xl text-[var(--rose-dark)]">←</button>
        <div ref={rowRef} className="flex overflow-x-auto gap-3 md:gap-4 pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {items.map(m => (
            <div key={m.id} className="w-[130px] md:w-[180px] shrink-0 snap-start flex flex-col">
              <TvCard tv={m} type={type} />
            </div>
          ))}
        </div>
        <button onClick={() => scroll('right')} className="hidden md:flex absolute right-[-20px] top-[50%] -translate-y-1/2 z-10 bg-white/90 shadow-md p-3 rounded-full opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-gray-100 border border-gray-200 text-xl text-[var(--rose-dark)]">→</button>
      </div>
    );
  };

  const currentTvInDb = selectedTv ? [...watchlist, ...inProgress, ...archived].find(t => t.tmdb_id === selectedTv.id || t.id === selectedTv.id) : null;

  return (
    <div className="max-w-6xl mx-auto px-3 md:px-4 py-6 md:py-8 min-h-screen">
      <header className="mb-6 md:mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--brand-text)] mb-2 md:mb-3">📺 Divano & Serie TV</h1>
      </header>

      {/* TABS PRINCIPALI */}
      <div className="grid grid-cols-2 md:flex md:justify-center gap-2 mb-6 md:mb-8 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
        {(['ESPLORA', 'WATCHLIST', 'IN_CORSO', 'ARCHIVIO', 'ROULETTE'] as TabType[]).map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setRouletteResult(null); }}
            className={`w-full px-2 py-3 md:px-5 md:py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${
              activeTab === tab ? 'bg-[var(--rose-dark)] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            {tab === 'ESPLORA' && '🔍 Esplora'}
            {tab === 'WATCHLIST' && `📌 Watchlist (${watchlist.length})`}
            {tab === 'IN_CORSO' && `⏳ In Corso (${inProgress.length})`}
            {tab === 'ARCHIVIO' && `🗃️ Archivio (${archived.length})`}
            {tab === 'ROULETTE' && `🎲 Roulette`}
          </button>
        ))}
      </div>

      {/* --- TAB ESPLORA --- */}
      {activeTab === 'ESPLORA' && (
        <div className="space-y-6">
          <form onSubmit={handleSearch} className="bg-white p-4 md:p-5 rounded-3xl shadow-sm border border-[var(--rose-light)] flex flex-col md:flex-row md:items-end gap-3 md:gap-4 mb-8 md:mb-10">
            <div className="flex-1 w-full">
              <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase mb-1 block">Cerca Serie</label>
              <input type="text" placeholder="Es. Breaking Bad..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full border border-gray-200 p-2.5 md:p-3 rounded-xl bg-gray-50 outline-none" />
            </div>
            <div className="w-full md:w-32">
              <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase mb-1 block">Genere</label>
              <select value={filterGenre} onChange={(e) => setFilterGenre(e.target.value)} className="w-full border border-gray-200 p-2.5 md:p-3 rounded-xl bg-gray-50 outline-none">
                <option value="">Tutti</option>
                {TMDB_TV_GENRES.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div className="w-full md:w-24">
              <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase mb-1 block">Anno</label>
              <input type="number" placeholder="Es. 2024" value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="w-full border border-gray-200 p-2.5 md:p-3 rounded-xl bg-gray-50 outline-none" />
            </div>
            <button type="submit" disabled={isSearching} className="w-full md:w-auto bg-[var(--rose-dark)] text-white px-8 py-3 rounded-xl font-bold hover:bg-opacity-90 transition mt-2 md:mt-0">
              {isSearching ? '⏳' : 'Cerca'}
            </button>
          </form>

          {!hasSearched && (
            <div className="animate-fade-in-up">
              <TvRow title="🔥 Serie in Tendenza" items={homeRows.trending} type="TMDB" />
              <TvRow title="📺 In Onda Ora" items={homeRows.airing} type="TMDB" />
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 px-1 border-t border-gray-100 pt-6 md:pt-8">Tutte le Serie</h2>
            </div>
          )}

          <div className="animate-fade-in-up">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
              {searchResults.length === 0 ? <p className="col-span-full text-center text-gray-400">Nessuna serie trovata.</p> : searchResults.map(tv => <TvCard key={tv.id} tv={tv} type="TMDB" />)}
            </div>
            {searchPage < totalPages && searchResults.length > 0 && (
              <div className="flex justify-center mt-8 md:mt-10">
                <button onClick={loadMore} disabled={isLoadingMore} className="w-full md:w-auto bg-white border-2 border-[var(--rose-light)] text-[var(--brand-text)] font-bold py-3 px-10 rounded-2xl hover:bg-rose-50 transition shadow-sm">
                  {isLoadingMore ? '⏳ Caricamento...' : 'Carica altri risultati'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB LISTE --- */}
      {activeTab === 'WATCHLIST' && (
        <div className="animate-fade-in-up space-y-8 md:space-y-12">
          {watchlist.length === 0 ? <p className="text-center text-gray-400 py-10">La tua watchlist è vuota.</p> : groupByCategory(watchlist).map(group => <TvRow key={group.name} title={group.name} items={group.items} type="WATCHLIST" />)}
        </div>
      )}
      {activeTab === 'IN_CORSO' && (
        <div className="animate-fade-in-up space-y-8 md:space-y-12">
          {inProgress.length === 0 ? <p className="text-center text-gray-400 py-10">Nessuna serie in corso.</p> : groupByCategory(inProgress).map(group => <TvRow key={group.name} title={group.name} items={group.items} type="IN_CORSO" />)}
        </div>
      )}
      {activeTab === 'ARCHIVIO' && (
        <div className="animate-fade-in-up space-y-8 md:space-y-12">
          {archived.length === 0 ? <p className="text-center text-gray-400 py-10">Archivio vuoto.</p> : groupByCategory(archived).map(group => <TvRow key={group.name} title={group.name} items={group.items} type="ARCHIVIO" />)}
        </div>
      )}

      {/* --- TAB ROULETTE --- */}
      {activeTab === 'ROULETTE' && (
        <div className="max-w-2xl mx-auto space-y-6 md:space-y-8 text-center animate-fade-in-up">
          <p className="text-sm md:text-base text-gray-500">Quale serie iniziamo oggi?</p>
          
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-center">
            <button onClick={() => {
              if(watchlist.length === 0) return alert("La watchlist è vuota!");
              setIsSpinning(true); setTimeout(() => { setRouletteResult(watchlist[Math.floor(Math.random() * watchlist.length)]); setIsSpinning(false); }, 800);
            }} disabled={isSpinning} className="bg-gray-800 text-white font-bold py-3.5 md:py-4 px-8 rounded-2xl hover:bg-gray-700 transition">
              🎲 Dalla Watchlist
            </button>
            <button onClick={spinGlobalRoulette} disabled={isSpinning} className="bg-[var(--rose-dark)] text-white font-bold py-3.5 md:py-4 px-8 rounded-2xl hover:bg-opacity-90 transition shadow-[var(--rose-light)] shadow-lg">
              🌍 Dal Mondo
            </button>
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs md:text-sm flex flex-col md:flex-row gap-3 md:gap-4 justify-center items-center">
            <span className="text-gray-400 font-bold uppercase w-full md:w-auto text-left md:text-center">Filtri "Mondo":</span>
            <div className="flex gap-2 w-full md:w-auto">
              <select value={rouletteGenre} onChange={(e) => setRouletteGenre(e.target.value)} className="flex-1 bg-white border border-gray-200 p-2 rounded-lg outline-none font-medium">
                <option value="">Tutti i Generi</option>
                {TMDB_TV_GENRES.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
              <input type="number" placeholder="Anno min." value={rouletteYear} onChange={(e) => setRouletteYear(e.target.value)} className="w-24 bg-white border border-gray-200 p-2 rounded-lg outline-none font-medium" />
            </div>
          </div>

          {isSpinning && <div className="text-5xl md:text-6xl animate-spin my-8 md:my-12">🎲</div>}
          
          {!isSpinning && rouletteResult && (
            <div className="mt-8 mx-auto w-[180px] md:w-[220px]">
              <h3 className="text-lg md:text-xl font-bold mb-4 text-[var(--brand-text)]">Vincitore! 🎉</h3>
              <div className="flex flex-col">
                <TvCard tv={rouletteResult} type={rouletteResult.tmdb_id ? 'WATCHLIST' : 'ROULETTE'} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- MODALE ARCHIVIAZIONE --- */}
      {reviewingTv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setReviewingTv(null)}></div>
          <form onSubmit={markAsArchived} className="bg-white rounded-3xl p-5 md:p-6 w-full max-w-md shadow-2xl relative z-10">
            <h3 className="text-lg md:text-xl font-bold mb-4 line-clamp-1">Archivia: {reviewingTv.title || reviewingTv.name}</h3>
            <div className="flex gap-2 mb-4">
              <button type="button" onClick={() => setReviewStatus('VISTO')} className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${reviewStatus === 'VISTO' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>✓ Finita</button>
              <button type="button" onClick={() => setReviewStatus('ABBANDONATA')} className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${reviewStatus === 'ABBANDONATA' ? 'bg-red-100 border-red-500 text-red-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>⨯ Abbandonata</button>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-700 mb-2">Voto (1-10)</label>
              <input type="range" min="1" max="10" value={rating} onChange={(e) => setRating(Number(e.target.value))} className="w-full accent-[var(--rose-dark)]" />
              <div className="text-center font-black text-2xl text-[var(--rose-dark)] mt-2">{rating}/10</div>
            </div>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Note..." className="w-full border border-gray-200 p-3 rounded-xl bg-gray-50 outline-none mb-6 text-sm" />
            <div className="flex gap-3">
              <button type="button" onClick={() => setReviewingTv(null)} className="flex-1 bg-gray-100 text-gray-700 font-bold py-2.5 md:py-3 rounded-xl hover:bg-gray-200">Annulla</button>
              <button type="submit" className="flex-1 bg-[var(--rose-dark)] text-white font-bold py-2.5 md:py-3 rounded-xl hover:bg-opacity-90">Salva in Archivio</button>
            </div>
          </form>
        </div>
      )}

      {/* --- MODALE DETTAGLI & EPISODI (RISOLTO LO SCORRIMENTO MOBILE) --- */}
      {selectedTv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4">
          
          {/* Sfondo cliccabile separato */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedTv(null)}></div>
          
          {/* Contenitore principale del modale (Altezza Fissa su mobile per non sforare) */}
          <div className="bg-white rounded-2xl w-full max-w-4xl h-[95vh] md:h-[85vh] flex flex-col relative overflow-hidden z-10 shadow-2xl">
            
            {/* Header Fluttuante */}
            <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-3 md:p-4 bg-gradient-to-b from-black/70 to-transparent">
              <div className="flex bg-white/20 backdrop-blur-md p-1 rounded-xl">
                <button onClick={() => setModalTab('INFO')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${modalTab === 'INFO' ? 'bg-white text-black' : 'text-white hover:bg-white/20'}`}>INFO</button>
                {currentTvInDb && (
                  <button onClick={() => setModalTab('EPISODI')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${modalTab === 'EPISODI' ? 'bg-white text-black' : 'text-white hover:bg-white/20'}`}>EPISODI</button>
                )}
              </div>
              <button onClick={() => setSelectedTv(null)} className="w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black backdrop-blur-md">✕</button>
            </div>

            {isLoadingDetails ? (
              <div className="flex-1 p-20 flex items-center justify-center text-gray-400">Caricamento...</div>
            ) : tvDetails && modalTab === 'INFO' ? (
              
              // LAYOUT INFO (Scorrimento abilitato)
              <div className="flex flex-col md:flex-row h-full overflow-y-auto">
                <div className="w-full h-[300px] md:h-full md:w-[40%] shrink-0 bg-gray-100 relative">
                  {tvDetails.poster_path ? (
                    <img src={`https://image.tmdb.org/t/p/w500${tvDetails.poster_path}`} className="w-full h-full object-cover object-top md:object-center" alt="Poster" />
                  ) : <div className="w-full h-full flex items-center justify-center text-gray-400">No Immagine</div>}
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent md:hidden" />
                </div>
                
                <div className="p-6 md:p-8 flex-1 -mt-8 md:mt-0 relative z-10 bg-white md:bg-transparent rounded-t-3xl md:rounded-none flex flex-col">
                  <h2 className="text-2xl md:text-3xl font-black mb-3 leading-tight pt-2 md:pt-0">{tvDetails.name}</h2>
                  <div className="flex flex-wrap gap-2 text-[10px] md:text-xs font-bold text-gray-500 mb-6">
                    <span className="bg-gray-100 px-2 py-1 rounded-md">{tvDetails.first_air_date?.substring(0, 4)}</span>
                    <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-md">⭐ {tvDetails.vote_average?.toFixed(1)}</span>
                    <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md">{tvDetails.number_of_seasons} Stagioni</span>
                    <span className="bg-gray-100 px-2 py-1 rounded-md">{tvDetails.number_of_episodes} Ep. Totali</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-6 leading-relaxed flex-1 pb-10 md:pb-0">{tvDetails.overview || 'Trama non disponibile.'}</p>
                  
                  {currentTvInDb && (
                     <button onClick={() => deleteTvShow(currentTvInDb.id)} className="mt-auto w-full md:w-auto self-start text-xs font-bold text-red-500 hover:text-red-700 py-2">
                       Rimuovi dalla libreria
                     </button>
                  )}
                </div>
              </div>

            ) : tvDetails && modalTab === 'EPISODI' && currentTvInDb ? (
              
              // LAYOUT EPISODI (Risolto il problema Flexbox min-h-0)
              <div className="flex flex-col h-full bg-gray-50 pt-16">
                {/* Selettore Stagione (Fisso in alto) */}
                <div className="bg-white border-b border-gray-200 p-3 md:p-4 shrink-0 overflow-x-auto whitespace-nowrap flex gap-2 [&::-webkit-scrollbar]:hidden snap-x">
                  {tvDetails.seasons?.filter((s:any) => s.season_number > 0).map((s:any) => (
                    <button 
                      key={s.id} 
                      onClick={() => handleSeasonChange(s.season_number)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors shrink-0 snap-start ${selectedSeason === s.season_number ? 'bg-[var(--rose-dark)] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      Stagione {s.season_number}
                    </button>
                  ))}
                </div>

                {/* Lista Episodi (Scorrevole) - IMPORTANTE: min-h-0 permette al flex di calcolare lo scroll */}
                <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-3 min-h-0 pb-24">
                  {isLoadingSeason ? (
                    <div className="text-center text-gray-400 py-10">Caricamento episodi...</div>
                  ) : seasonEpisodes.map(ep => {
                    const epCode = `S${selectedSeason}E${ep.episode_number}`;
                    const isWatched = (currentTvInDb.watched_episodes || []).includes(epCode);
                    
                    return (
                      <div key={ep.id} className={`bg-white border rounded-2xl p-3 md:p-4 flex gap-3 md:gap-4 transition-all ${isWatched ? 'border-green-200 bg-green-50/30' : 'border-gray-100 hover:border-[var(--rose-light)]'}`}>
                        <div className="hidden sm:block w-32 h-20 bg-gray-200 rounded-lg shrink-0 overflow-hidden relative">
                           {ep.still_path ? <img src={`https://image.tmdb.org/t/p/w300${ep.still_path}`} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Img</div>}
                           <div className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">E{ep.episode_number}</div>
                        </div>
                        
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <h4 className={`font-bold text-sm md:text-base leading-tight pr-2 ${isWatched ? 'text-gray-500' : 'text-gray-900'}`}>
                              <span className="sm:hidden text-[var(--rose-dark)] mr-1">E{ep.episode_number}.</span>
                              {ep.name}
                            </h4>
                            <button 
                              onClick={() => toggleEpisode(selectedSeason, ep.episode_number)}
                              className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${isWatched ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300 text-transparent hover:border-[var(--rose-dark)]'}`}
                            >
                              ✓
                            </button>
                          </div>
                          <p className={`text-xs line-clamp-2 md:line-clamp-3 pr-8 ${isWatched ? 'text-gray-400' : 'text-gray-500'}`}>{ep.overview || 'Trama non disponibile.'}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}