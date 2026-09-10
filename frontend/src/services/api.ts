export { default } from './client';
export {
  authApi,
  type RegisterData,
  type LoginData,
  type UserRole,
  type User,
  type TokenResponse,
} from './authApi';
export {
  moviesApi,
  type MovieSearchItem,
  type MovieSearchResponse,
  type MovieDetail,
  type StoredMovie,
  type CatalogMovieDetail,
  type ChatRecommendMessage,
  type ChatRecommendResponse,
} from './moviesApi';
export {
  watchlistApi,
  type WatchlistCategory,
  type WatchlistAddPayload,
  type WatchlistUpdatePayload,
  type WatchlistItem,
  type WatchlistDetail,
} from './watchlistApi';
