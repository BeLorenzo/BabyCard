import BookLibreria from '../components/BookLibreria'; // Adatta il percorso per risalire alla cartella components

export const metadata = {
  title: 'Libreria Condivisa | BabyPal',
};

export default function LibreriaPage() {
  return (
    <main className="min-h-screen pt-12 px-4 pb-24 max-w-7xl mx-auto w-full">
      <header className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 text-[var(--brand-text)]">
          La <span className="text-[var(--rose-dark)]">Libreria</span> della Baby
        </h1>
        <p className="text-sm md:text-base opacity-70 max-w-md mx-auto">
          Cerca un titolo, fai la richiesta e attendi che il file magico appaia su Telegram/WhatsApp.
        </p>
      </header>

      <BookLibreria />
    </main>
  );
}