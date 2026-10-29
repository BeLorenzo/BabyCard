import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LiloBot from './components/LiloBot';
import { ToastProvider } from './components/ui/Toast';

export const metadata = {
  title: 'BabyPal | Alessia',
  description: 'La carta prepagata per i tuoi vizi',
};

export default function SecretLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <Navbar />
      <main className="pt-20 flex-grow w-full animate-fade-in-up">
        {children}
      </main>
      <Footer />
      <LiloBot />
    </ToastProvider>
  );
}
