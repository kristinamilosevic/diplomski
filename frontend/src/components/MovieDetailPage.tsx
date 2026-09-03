import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  authApi,
  CatalogMovieDetail,
  moviesApi,
  User,
  watchlistApi,
  WatchlistDetail,
} from '../services/api';
import AppLayout from './AppLayout';
import MovieMediaInfo from './MovieMediaInfo';
import WatchlistEntryPanel from './WatchlistEntryPanel';
import { ArrowLeftIcon } from './ui/icons';

const MovieDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const movieId = Number(useParams().movieId);
  const [user, setUser] = useState<User | null>(() => authApi.getCurrentUser());
  const [movie, setMovie] = useState<CatalogMovieDetail | null>(null);
  const [entry, setEntry] = useState<WatchlistDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authApi.isAuthenticated()) return;
    authApi
      .fetchMe()
      .then(setUser)
      .catch(() => {
      });
  }, []);

  useEffect(() => {
    moviesApi
      .getCatalog(movieId)
      .then(setMovie)
      .catch(() => setError(t('home.detailFailed')))
      .finally(() => setLoading(false));
  }, [movieId, t]);

  useEffect(() => {
    if (user?.role !== 'user') return;
    watchlistApi
      .get(movieId)
      .then(setEntry)
      .catch(() => setEntry(null));
  }, [user?.role, movieId]);

  if (!authApi.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppLayout user={user}>
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-orange-400 sm:text-base"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        {t('common.back')}
      </button>

      {loading && (
        <div className="mt-5 space-y-6">
          <div className="h-72 animate-pulse rounded-xl border border-ink-700 bg-ink-900 sm:h-80" />
          <div className="h-36 animate-pulse rounded-xl border border-ink-700 bg-ink-900" />
          <div className="h-52 animate-pulse rounded-xl border border-ink-700 bg-ink-900" />
        </div>
      )}

      {error && (
        <div className="mt-5 rounded-lg border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-300 sm:text-base">
          {error}
        </div>
      )}

      {movie && (
        <MovieMediaInfo movie={movie.movie} details={movie.details}>
          {entry && <WatchlistEntryPanel item={entry} onSaved={setEntry} />}
        </MovieMediaInfo>
      )}
    </AppLayout>
  );
};

export default MovieDetailPage;
