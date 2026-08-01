import GiftCard from './components/GiftCard';
import RelationshipStatus from './components/RelationshipStatus';
import EmergencyButton from './components/EmergencyButton'; // 1. Importa il bottone
import { supabase } from './lib/supabase';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { data: vouchers } = await supabase
    .from('vouchers')
    .select('*')
    .eq('is_used', false)
    .order('created_at', { ascending: false });

  const { data: settingsData } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'saldo')
    .single();
    
  const saldoCorrente = settingsData?.value || 0;

  return (
    <main className="min-h-screen pt-8 px-4 pb-24 max-w-6xl mx-auto w-full flex flex-col">
      
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 text-[var(--brand-text)]">
          La tua <span className="text-[var(--rose-dark)]">BabyPal</span>
        </h1>
        <p className="text-sm md:text-base opacity-70">
          Tocca la carta per girarla. Usala saggiamente.
        </p>
      </header>

      {/* Layout a 2 colonne su PC, 1 colonna su Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-start mb-16">
        
        {/* Colonna SX: La Carta e lo Status */}
        <section className="w-full flex justify-center lg:justify-end lg:pr-4">
          <div className="w-full max-w-md">
            <GiftCard saldo={saldoCorrente} />
            <RelationshipStatus />
          </div>
        </section>

        {/* Colonna DX: I Coupon Dinamici */}
        <section className="w-full max-w-md mx-auto lg:mx-0 lg:pl-4">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-[var(--brand-text)]">Voucher Attivabili</h2>
            <span className="text-xs font-bold uppercase text-[var(--rose-dark)] bg-[var(--rose-light)] px-3 py-1 rounded-full shadow-sm">
              {vouchers?.length || 0} Disponibili
            </span>
          </div>
          
          <div className="flex flex-col gap-4">
            {vouchers && vouchers.length > 0 ? (
              <>
                {vouchers.map((voucher) => (
                  <div 
                    key={voucher.id} 
                    className="group relative bg-white rounded-xl shadow-sm border border-gray-100 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[var(--rose-light)] to-[var(--rose-gold)]"></div>
                    
                    <div className="pl-2">
                      <h3 className="font-bold text-lg text-[var(--brand-text)] leading-tight mb-1">
                        {voucher.title}
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        {voucher.description}
                      </p>
                    </div>
                  </div>
                ))}
                
                <div className="mt-2 flex items-center justify-center p-5 gap-2 rounded-xl border-2 border-dashed border-gray-400 bg-transparent opacity-70">
                  <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  <p className="text-sm text-gray-400 font-medium text-center">
                    Altri voucher potrebbero sbloccarsi...
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center p-8 bg-white rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-400">Nessun voucher disponibile al momento.<br/>Attendi il prossimo ricarico!</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* 2. Il Pulsante di Emergenza a fondo pagina */}
      <section className="w-full max-w-md mx-auto mt-12 pt-8 border-t border-gray-200/60">
        <div className="text-center mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Opzioni estreme</p>
        </div>
        <EmergencyButton />
      </section>

    </main>
  );
}