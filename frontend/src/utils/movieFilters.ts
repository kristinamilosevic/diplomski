import type { StoredMovie } from '../services/moviesApi';

export type MovieSort =
  | 'added'
  | 'year_desc'
  | 'year_asc'
  | 'rating_desc'
  | 'rating_asc'
  | 'title_asc';

export interface MovieFilters {
  genre: string | null;
  type: string | null;
  sort: MovieSort;
}

export const EMPTY_MOVIE_FILTERS: MovieFilters = {
  genre: null,
  type: null,
  sort: 'added',
};

export const hasActiveFilters = (filters: MovieFilters): boolean =>
  filters.genre != null || filters.type != null || filters.sort !== 'added';

export const parseGenres = (genre?: string | null): string[] => {
  if (!genre || genre === 'N/A') return [];
  return genre
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
};

export const collectGenres = (movies: StoredMovie[]): string[] => {
  const unique = new Set<string>();
  movies.forEach((movie) => {
    parseGenres(movie.genre).forEach((value) => unique.add(value));
  });
  return Array.from(unique).sort((a, b) => a.localeCompare(b));
};

export const collectTypes = (movies: StoredMovie[]): string[] => {
  const unique = new Set<string>();
  movies.forEach((movie) => {
    if (movie.type && movie.type !== 'N/A') unique.add(movie.type);
  });
  return Array.from(unique).sort((a, b) => a.localeCompare(b));
};

export const movieMatchesFilters = (movie: StoredMovie, filters: MovieFilters): boolean => {
  if (filters.genre && !parseGenres(movie.genre).includes(filters.genre)) return false;
  if (filters.type && movie.type !== filters.type) return false;
  return true;
};

export const movieMatchesTitle = (movie: StoredMovie, query: string): boolean => {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return true;
  return movie.title.toLowerCase().includes(trimmed);
};

const yearValue = (year: string): number => {
  const match = year.match(/\d{4}/);
  return match ? Number(match[0]) : 0;
};

const ratingValue = (rating: string | null): number => {
  if (!rating || rating === 'N/A') return -1;
  const parsed = Number.parseFloat(rating);
  return Number.isFinite(parsed) ? parsed : -1;
};

export const sortMovies = (movies: StoredMovie[], sort: MovieSort): StoredMovie[] => {
  const copy = [...movies];
  copy.sort((a, b) => {
    switch (sort) {
      case 'year_desc':
        return yearValue(b.year) - yearValue(a.year);
      case 'year_asc':
        return yearValue(a.year) - yearValue(b.year);
      case 'rating_desc':
        return ratingValue(b.imdb_rating) - ratingValue(a.imdb_rating);
      case 'rating_asc':
        return ratingValue(a.imdb_rating) - ratingValue(b.imdb_rating);
      case 'title_asc':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });
  return copy;
};
