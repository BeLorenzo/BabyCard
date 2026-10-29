'use server';

import { BookSearchResult } from '../home-s3gr3ta-2026/lib/types';

interface GoogleBookItem {
  id?: string;
  volumeInfo?: {
    title?: string;
    authors?: string[];
    imageLinks?: {
      thumbnail?: string;
    };
  };
}

interface OpenLibraryDoc {
  key?: string;
  title?: string;
  author_name?: string[];
  cover_i?: number;
}

export async function searchBooks(query: string): Promise<{ results: BookSearchResult[]; error?: string }> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { results: [] };
  }

  const apiKey = process.env.GOOGLE_BOOKS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY;

  // 1. Prova prima con Google Books API se la chiave è presente
  if (apiKey) {
    try {
      const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(trimmed)}&maxResults=10&key=${apiKey}`;
      const res = await fetch(url);

      if (res.ok) {
        const data = await res.json();
        if (data.items && Array.isArray(data.items) && data.items.length > 0) {
          const results: BookSearchResult[] = (data.items as GoogleBookItem[]).map((item) => ({
            key: item.id || Math.random().toString(),
            title: item.volumeInfo?.title || 'Titolo sconosciuto',
            author_name: item.volumeInfo?.authors || ['Autore sconosciuto'],
            cover_url: item.volumeInfo?.imageLinks?.thumbnail
              ? item.volumeInfo.imageLinks.thumbnail.replace('http:', 'https:')
              : '',
          }));
          return { results };
        }
      }
    } catch (err) {
      console.warn("Google Books fallito, tento il fallback su OpenLibrary:", err);
    }
  }

  // 2. Fallback su OpenLibrary se Google Books fallisce o la chiave non è configurata
  try {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(trimmed)}&limit=10`;
    const res = await fetch(url);

    if (res.ok) {
      const data = await res.json();
      if (data.docs && Array.isArray(data.docs) && data.docs.length > 0) {
        const validBooks = (data.docs as OpenLibraryDoc[]).filter((b) => Boolean(b.title));
        const results: BookSearchResult[] = validBooks.map((item, idx) => ({
          key: item.key || `ol-${idx}`,
          title: item.title || 'Titolo sconosciuto',
          author_name: item.author_name || ['Autore sconosciuto'],
          cover_url: item.cover_i ? `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg` : '',
        }));
        return { results };
      }
    }
    return { results: [] };
  } catch (err) {
    console.error("Errore ricerca libri:", err);
    return { results: [], error: 'Errore di connessione durante la ricerca.' };
  }
}
