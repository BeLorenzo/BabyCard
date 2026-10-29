export type Voucher = {
  id: number;
  title: string;
  description: string;
  is_used: boolean;
  created_at?: string;
};

export type BookFormat = 'EPUB' | 'AUDIO';
export type BookLanguage = 'IT' | 'EN';
export type BookStatus = 'PENDING' | 'READY';

export type BookRequest = {
  id: number;
  title: string;
  author: string;
  cover_url: string;
  format: BookFormat | string;
  language: BookLanguage | string;
  status: BookStatus | string;
  download_url: string;
  created_at?: string;
};

export type BookSearchResult = {
  key: string;
  title: string;
  author_name: string[];
  cover_url: string;
};

export type WishlistItem = {
  id: number;
  title: string;
  description: string | null;
  category: string;
  is_completed: boolean;
  priority: number;
  created_at?: string;
};
