'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { sendBookRequestAlert } from '../../../actions/notify';
import { BookFormat, BookLanguage, BookRequest, BookSearchResult } from '../../lib/types';
import { useToast } from '../ui/Toast';
import BookSearchForm from './BookSearchForm';
import BookCatalog from './BookCatalog';

export default function BookLibreria() {
  const { showToast, confirmAction } = useToast();
  const [requests, setRequests] = useState<BookRequest[]>([]);

  const refreshRequests = async () => {
    const { data } = await supabase
      .from('book_requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setRequests(data as BookRequest[]);
  };

  useEffect(() => {
    let ignore = false;
    supabase
      .from('book_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (!ignore && data) setRequests(data as BookRequest[]);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const saveToDatabaseAndNotify = async (
    title: string,
    author: string,
    cover_url: string,
    format: BookFormat,
    language: BookLanguage
  ) => {
    const { error } = await supabase
      .from('book_requests')
      .insert([{ title, author, cover_url, format, language, status: 'PENDING' }]);

    if (error) {
      showToast('Errore nel salvataggio della richiesta.', 'error');
    } else {
      showToast(`Richiesta inviata per "${title}"!`, 'success');
      const textMessage = `📚 *Nuova Richiesta Libro!*\n\n*Titolo:* ${title}\n*Autore:* ${author}\n*Formato:* ${format}\n*Lingua:* ${language}`;
      sendBookRequestAlert(textMessage).catch(console.error);
      refreshRequests();
    }
  };

  const handleAddRequest = async (book: BookSearchResult, format: BookFormat, language: BookLanguage) => {
    const title = book.title;
    const author = book.author_name[0] || 'Autore sconosciuto';
    const cover_url = book.cover_url || '';
    await saveToDatabaseAndNotify(title, author, cover_url, format, language);
  };

  const handleAddManualRequest = async (title: string, format: BookFormat, language: BookLanguage) => {
    await saveToDatabaseAndNotify(title, 'Autore non specificato', '', format, language);
  };

  const deleteRequest = async (id: number) => {
    const ok = await confirmAction('Sicuro di voler eliminare questo libro?');
    if (!ok) return;
    const { error } = await supabase.from('book_requests').delete().eq('id', id);
    if (!error) {
      showToast('Libro rimosso dalla lista', 'info');
      refreshRequests();
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
      <BookSearchForm
        onAddRequest={handleAddRequest}
        onAddManualRequest={handleAddManualRequest}
      />
      <BookCatalog
        requests={requests}
        onDelete={deleteRequest}
      />
    </div>
  );
}
