'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

type WishlistItem = {
  id: number;
  title: string;
  description: string | null;
  category: string;
  is_completed: boolean; 
  priority: number; // Nuova colonna
  created_at?: string;
};

export default function Wishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("Tutto");
  const [isLoading, setIsLoading] = useState(true);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', description: '', category: '', priority: 1 });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('wishlist')
      .select('*')
      // L'ordinamento principale lo facciamo lato client per renderlo reattivo alle modifiche al volo
      .order('created_at', { ascending: false });
    
    if (!error && data) setItems(data);
    setIsLoading(false);
  };

  const uniqueCategories = Array.from(new Set(items.map(item => item.category))).filter(Boolean);
  const filterCategories = ["Tutto", ...uniqueCategories];

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.title) return;

    const finalCategory = newItem.category.trim() || 'Generale';

    const { data, error } = await supabase
      .from('wishlist')
      .insert([{ 
        title: newItem.title, 
        description: newItem.description, 
        category: finalCategory,
        priority: newItem.priority
      }])
      .select();

    if (!error && data) {
      setItems([data[0] as WishlistItem, ...items]);
      setNewItem({ title: '', description: '', category: '', priority: 1 });
      setIsAdding(false);
      setActiveCategory("Tutto"); 
    }
  };

  const toggleDone = async (id: number, currentStatus: boolean) => {
    setItems(items.map(item => item.id === id ? { ...item, is_completed: !currentStatus } : item));
    await supabase.from('wishlist').update({ is_completed: !currentStatus }).eq('id', id);
  };

  // Nuova funzione per cambiare la priorità al volo
  const updatePriority = async (id: number, newPriority: number) => {
    setItems(items.map(item => item.id === id ? { ...item, priority: newPriority } : item));
    await supabase.from('wishlist').update({ priority: newPriority }).eq('id', id);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Sicura di voler cancellare questa voce?")) return;
    
    setItems(items.filter(item => item.id !== id));
    await supabase.from('wishlist').delete().eq('id', id);
  };

  // Filtriamo e ORDiniAMO localmente (prima i non completati, poi per priorità alta, poi data)
  const filteredAndSortedItems = items
    .filter(item => activeCategory === "Tutto" || item.category === activeCategory)
    .sort((a, b) => {
      if (a.is_completed !== b.is_completed) return a.is_completed ? 1 : -1;
      if ((a.priority || 1) !== (b.priority || 1)) return (b.priority || 1) - (a.priority || 1);
      return 0; 
    });

  return (
    <div className="max-w-4xl mx-auto px-4 w-full pb-12">
      
      <header className="mb-8 mt-4 text-center md:text-left">
        <h1 className="text-3xl font-extrabold text-[var(--brand-text)] tracking-tight">Wishlist</h1>
        <p className="text-sm text-gray-500 mt-1">Cose che probabilmente ci dimenticheremo.</p>
      </header>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {filterCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                activeCategory === cat 
                  ? 'bg-[var(--rose-dark)] text-white' 
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-[var(--rose-light)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="px-5 py-2 bg-[var(--brand-text)] text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors"
        >
          {isAdding ? "Annulla" : "+ Aggiungi Voce"}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-white p-5 rounded-2xl shadow-sm border border-[var(--rose-light)] mb-8 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Titolo</label>
              <input 
                type="text" 
                required
                value={newItem.title}
                onChange={e => setNewItem({...newItem, title: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--rose-light)]"
                placeholder="Es. Prenotare hotel per il weekend"
              />
            </div>
            
            <div className="col-span-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Categoria</label>
              <input 
                type="text"
                list="category-suggestions"
                required
                value={newItem.category}
                onChange={e => setNewItem({...newItem, category: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--rose-light)]"
                placeholder="Es. Spesa..."
              />
              <datalist id="category-suggestions">
                {uniqueCategories.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>

            <div className="col-span-1">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Priorità</label>
              <select 
                value={newItem.priority}
                onChange={e => setNewItem({...newItem, priority: Number(e.target.value)})}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--rose-light)]"
              >
                <option value={1}>Bassa</option>
                <option value={2}>Media</option>
                <option value={3}>Alta 🔥</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descrizione (Opzionale)</label>
            <textarea 
              value={newItem.description}
              onChange={e => setNewItem({...newItem, description: e.target.value})}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--rose-light)]"
              placeholder="Dettagli aggiuntivi..."
              rows={2}
            />
          </div>
          <button type="submit" className="self-end px-6 py-2 bg-[var(--rose-dark)] text-white text-sm font-bold rounded-lg hover:bg-[var(--rose-gold)] transition-colors">
            Salva nella lista
          </button>
        </form>
      )}

      <div className="flex flex-col gap-3">
        {isLoading ? (
          <p className="text-center text-sm text-gray-400 py-8">Caricamento desideri...</p>
        ) : filteredAndSortedItems.length === 0 ? (
          <div className="text-center bg-white p-8 rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-500">Nessun elemento in questa categoria.</p>
          </div>
        ) : (
          filteredAndSortedItems.map(item => (
            <div 
              key={item.id} 
              className={`bg-white rounded-xl p-4 shadow-sm border transition-all flex gap-4 ${
                item.is_completed ? 'border-gray-100 opacity-60' : 'border-gray-200 hover:border-[var(--rose-light)]'
              }`}
            >
              <div className="pt-1">
                <input 
                  type="checkbox" 
                  checked={item.is_completed} 
                  onChange={() => toggleDone(item.id, item.is_completed)}
                  className="w-5 h-5 accent-[var(--rose-dark)] rounded cursor-pointer"
                />
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1 gap-2">
                  <div className="flex gap-2 items-center flex-wrap">
                    <span className="text-[10px] font-bold text-[var(--rose-dark)] uppercase tracking-wider bg-[var(--rose-light)]/20 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                    
                    {/* Selettore Priorità Inline */}
                    <select
                      value={item.priority || 1}
                      onChange={(e) => updatePriority(item.id, Number(e.target.value))}
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded cursor-pointer appearance-none text-center outline-none ${
                        item.priority === 3 ? 'bg-red-100 text-red-600' :
                        item.priority === 2 ? 'bg-orange-100 text-orange-600' :
                        'bg-gray-100 text-gray-500'
                      }`}
                    >
                      <option value={1}>Priorità: Bassa</option>
                      <option value={2}>Priorità: Media</option>
                      <option value={3}>Priorità: Alta 🔥</option>
                    </select>
                  </div>
                  
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="text-[10px] uppercase font-bold text-red-400 hover:text-red-600 tracking-wider shrink-0"
                  >
                    Elimina
                  </button>
                </div>
                
                <h3 className={`font-bold text-lg mt-1 ${item.is_completed ? 'line-through text-gray-400' : 'text-[var(--brand-text)]'}`}>
                  {item.title}
                </h3>
                
                {item.description && (
                  <p className={`text-sm mt-1 leading-relaxed ${item.is_completed ? 'text-gray-400' : 'text-gray-600'}`}>
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}