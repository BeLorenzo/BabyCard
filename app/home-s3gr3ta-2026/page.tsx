import GiftCard from './components/GiftCard';
import RelationshipStatus from './components/RelationshipStatus';
import EmergencyButton from './components/EmergencyButton';
import { supabase } from './lib/supabase';
import { Voucher } from './lib/types';

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

  // Lette lato server: funzionano sia senza NEXT_PUBLIC_ (nessun warning Vercel!) sia con NEXT_PUBLIC_
  const cardSignature =
    process.env.CARD_SIGNATURE || process.env.NEXT_PUBLIC_CARD_SIGNATURE || 'Baby';
  const cardPhone =
    process.env.CARD_PHONE || process.env.NEXT_PUBLIC_CARD_PHONE || '+39 ••• •••••••';
  const cardNumber =
    process.env.CARD_NUMBER || process.env.NEXT_PUBLIC_CARD_NUMBER || '•••• •••• •••• ••••';
  const cardHolderFull =
    process.env.CARD_HOLDER_FULL || process.env.NEXT_PUBLIC_CARD_HOLDER_FULL || 'Bella Baby';

  return (
    <div className="pt-8 px-4 pb-24 max-w-6xl mx-auto w-full flex flex-col">
      <header className="text-center mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/80 border border-[var(--rose-light)] text-[var(--rose-dark)] text-[11px] font-bold uppercase tracking-widest mb-3">
          ✨ Portale Privato VIP
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 text-[var(--brand-text)]">
          La tua <span className="text-[var(--rose-dark)]">BabyPal</span>
        </h1>
        <p className="text-sm md:text-base text-gray-500 font-medium">
          Tocca la carta per girarla. Usala saggiamente.
        </p>
      </header>

      {/* Layout a 2 colonne su PC, 1 colonna su Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-10 items-start mb-16">
        {/* Colonna SX: La Carta e lo Status */}
        <section className="w-full flex justify-center lg:justify-end lg:pr-4">
          <div className="w-full max-w-md">
            <GiftCard
              saldo={saldoCorrente}
              cardSignature={cardSignature}
              cardPhone={cardPhone}
              cardNumber={cardNumber}
              cardHolderFull={cardHolderFull}
            />
            <RelationshipStatus />
          </div>
        </section>

        {/* Colonna DX: I Coupon Dinamici (Stile Ticket Luxury) */}
        <section className="w-full max-w-md mx-auto lg:mx-0 lg:pl-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-extrabold text-[var(--brand-text)] flex items-center gap-2">
              🎟️ Voucher Attivi
            </h2>
            <span className="text-xs font-extrabold uppercase text-[var(--rose-dark)] bg-rose-100/80 border border-[var(--rose-light)] px-3.5 py-1 rounded-full shadow-xs">
              {vouchers?.length || 0} Disponibili
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {vouchers && vouchers.length > 0 ? (
              <>
                {(vouchers as Voucher[]).map((voucher, idx) => (
                  <div
                    key={voucher.id}
                    className="group relative flex items-stretch bg-white rounded-2xl shadow-sm border border-rose-200/90 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-500/10 hover:border-rose-300"
                  >
                    {/* Bordino laterale metallico rose/purple */}
                    <div className="w-2.5 shrink-0 rounded-l-2xl bg-gradient-to-b from-pink-400 via-[var(--rose-dark)] to-purple-900" />

                    {/* Corpo principale del biglietto */}
                    <div className="flex-1 p-5 pl-4 pr-4 flex flex-col justify-between relative overflow-hidden">
                      {/* Filigrana decorativa sullo sfondo */}
                      <span className="pointer-events-none select-none absolute -bottom-3 -right-1 text-6xl font-black text-rose-500/[0.04] tracking-tighter">
                        VIP
                      </span>

                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400">
                          <span className="text-[var(--rose-dark)]">✦</span> COUPON #{String(idx + 1).padStart(2, '0')}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Valido
                        </span>
                      </div>

                      <div>
                        <h3 className="font-extrabold text-lg text-[var(--brand-text)] leading-snug mb-1 group-hover:text-[var(--rose-dark)] transition-colors">
                          {voucher.title}
                        </h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                          {voucher.description}
                        </p>
                      </div>
                    </div>

                    {/* Linea tratteggiata di strappo + Intagli semicircolari */}
                    <div className="relative flex flex-col items-center justify-center">
                      {/* Intaglio superiore */}
                      <div className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-5 h-2.5 rounded-b-full bg-[var(--brand-bg)] border-x border-b border-rose-200/90 group-hover:border-rose-300 transition-colors z-10" />
                      
                      {/* Perforazione verticale */}
                      <div className="h-full border-l-2 border-dashed border-rose-200/90 my-2" />
                      
                      {/* Icona forbici sulla linea di taglio */}
                      <span className="absolute top-1/2 -translate-y-1/2 bg-white px-0.5 text-[10px] text-rose-300 select-none">
                        ✂
                      </span>

                      {/* Intaglio inferiore */}
                      <div className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-5 h-2.5 rounded-t-full bg-[var(--brand-bg)] border-x border-t border-rose-200/90 group-hover:border-rose-300 transition-colors z-10" />
                    </div>

                    {/* Talloncino laterale (Ticket Stub) con Barcode */}
                    <div className="w-20 shrink-0 rounded-r-2xl bg-gradient-to-b from-rose-50/90 via-pink-50/40 to-rose-100/70 flex flex-col items-center justify-center p-2.5 gap-2 select-none">
                      {/* Barcode simulato */}
                      <div className="flex items-center justify-center gap-[2px] h-9 opacity-60 group-hover:opacity-90 transition-opacity">
                        <span className="w-[2px] h-full bg-rose-950 rounded-full" />
                        <span className="w-[1px] h-full bg-rose-950 rounded-full" />
                        <span className="w-[3px] h-full bg-rose-950 rounded-full" />
                        <span className="w-[1px] h-full bg-rose-950 rounded-full" />
                        <span className="w-[2px] h-full bg-rose-950 rounded-full" />
                        <span className="w-[4px] h-full bg-rose-950 rounded-full" />
                        <span className="w-[1px] h-full bg-rose-950 rounded-full" />
                        <span className="w-[2px] h-full bg-rose-950 rounded-full" />
                        <span className="w-[1px] h-full bg-rose-950 rounded-full" />
                        <span className="w-[3px] h-full bg-rose-950 rounded-full" />
                      </div>
                      <span className="text-[9px] font-mono font-extrabold tracking-widest text-[var(--rose-dark)] uppercase">
                        VIP PASS
                      </span>
                    </div>
                  </div>
                ))}

                <div className="mt-2 flex items-center justify-center p-4 gap-2 rounded-2xl border-2 border-dashed border-gray-300/80 bg-white/40">
                  <span className="text-base">✨</span>
                  <p className="text-xs text-gray-400 font-semibold text-center">
                    Altri voucher potrebbero sbloccarsi...
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center p-8 bg-white/80 rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-400 text-sm font-medium">
                  Nessun voucher disponibile al momento.
                  <br />
                  Attendi il prossimo ricarico!
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Il Pulsante di Emergenza a fondo pagina */}
      <section className="w-full max-w-md mx-auto mt-12 pt-8 border-t border-gray-200/60">
        <div className="text-center mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Opzioni estreme
          </p>
        </div>
        <EmergencyButton />
      </section>
    </div>
  );
}
