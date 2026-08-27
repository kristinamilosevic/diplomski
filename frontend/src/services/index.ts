export { default as api } from './client';
export { authApi } from './authApi';
export type {
  RegisterData,
  LoginData,
  UserRole,
  User,
  TokenResponse,
} from './authApi';
export { moviesApi } from './moviesApi';
export type {
  MovieSearchItem,
  MovieSearchResponse,
  MovieDetail,
  StoredMovie,
} from './moviesApi';
export { watchlistApi } from './watchlistApi';
export type {
  WatchlistCategory,
  WatchlistAddPayload,
  WatchlistUpdatePayload,
  WatchlistItem,
  WatchlistDetail,
} from './watchlistApi';
