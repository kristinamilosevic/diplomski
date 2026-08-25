import api from './client';

export interface MovieSearchItem {
  title: string;
  year: string;
  imdb_id: string;
  type: string;
  poster: string | null;
}

export interface MovieSearchResponse {
  results: MovieSearchItem[];
  total: number;
}

export interface MovieDetail {
  title: string;
  year: string;
  rated: string | null;
  released: string | null;
  runtime: string | null;
  genre: string | null;
  director: string | null;
  writer: string | null;
  actors: string | null;
  plot: string | null;
  language: string | null;
  country: string | null;
  awards: string | null;
  poster: string | null;
  imdb_id: string;
  imdb_rating: string | null;
  imdb_votes: string | null;
  type: string | null;
  box_office: string | null;
  production: string | null;
}

export interface StoredMovie {
  id: number;
  imdb_id: string;
  title: string;
  year: string;
  poster: string | null;
  type: string | null;
  genre: string | null;
  plot: string | null;
  created_at: string;
}

export const moviesApi = {
  search: async (query: string, page = 1): Promise<MovieSearchResponse> => {
    const response = await api.get<MovieSearchResponse>('/movies/search', {
      params: { query: query.trim(), page },
    });
    return response.data;
  },
  getById: async (imdbId: string): Promise<MovieDetail> => {
    const response = await api.get<MovieDetail>(`/movies/${imdbId}`);
    return response.data;
  },
  add: async (imdbId: string): Promise<StoredMovie> => {
    const response = await api.post<StoredMovie>('/movies/add', { imdb_id: imdbId });
    return response.data;
  },
  listMine: async (): Promise<StoredMovie[]> => {
    const response = await api.get<StoredMovie[]>('/movies/mine');
    return response.data;
  },
  listAll: async (): Promise<StoredMovie[]> => {
    const response = await api.get<StoredMovie[]>('/movies');
    return response.data;
  },
};
