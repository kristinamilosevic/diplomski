import api from './client';
import type { MovieDetail, StoredMovie } from './moviesApi';

export type WatchlistCategory = 'watched' | 'want_to_watch' | 'currently_watching';

export interface WatchlistAddPayload {
  movie_id: number;
  category: WatchlistCategory;
  rating?: number | null;
  note?: string | null;
}

export interface WatchlistUpdatePayload {
  category: WatchlistCategory;
  rating?: number | null;
  note?: string | null;
}

export interface WatchlistItem {
  id: number;
  movie_id: number;
  category: WatchlistCategory;
  rating: number | null;
  note: string | null;
  created_at: string;
  movie: StoredMovie;
}

export interface WatchlistDetail extends WatchlistItem {
  details: MovieDetail | null;
}

export const watchlistApi = {
  add: async (payload: WatchlistAddPayload): Promise<WatchlistItem> => {
    const response = await api.post<WatchlistItem>('/watchlist', payload);
    return response.data;
  },
  list: async (): Promise<WatchlistItem[]> => {
    const response = await api.get<WatchlistItem[]>('/watchlist');
    return response.data;
  },
  get: async (movieId: number): Promise<WatchlistDetail> => {
    const response = await api.get<WatchlistDetail>(`/watchlist/${movieId}`);
    return response.data;
  },
  update: async (movieId: number, payload: WatchlistUpdatePayload): Promise<WatchlistDetail> => {
    const response = await api.patch<WatchlistDetail>(`/watchlist/${movieId}`, payload);
    return response.data;
  },
};
