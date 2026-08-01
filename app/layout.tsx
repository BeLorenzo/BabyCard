// app/layout.tsx
import './globals.css'
import Navbar from './home-s3gr3ta-2026/components/Navbar'
import Footer from './home-s3gr3ta-2026/components/Footer'
import LiloBot from './home-s3gr3ta-2026/components/LiloBot'

export const metadata = {
  title: 'BabyPal | Alessia',
  description: 'La carta prepagata per i tuoi vizi',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      {/* Aggiunto flex flex-col per gestire l'altezza e spingere il footer giù */}
      <body className="min-h-screen font-sans flex flex-col">
        
        <Navbar />
        
        {/* flex-grow fa sì che il contenuto spinga il footer sul fondo anche se la pagina è mezza vuota */}
        <main className="pt-20 flex-grow w-full">
          {children}
        </main>

        <Footer />
        
        {/* Lilo Bot fisso in basso a destra (fluttuerà sopra il footer) */}
        <LiloBot />
      </body>
    </html>
  )
}