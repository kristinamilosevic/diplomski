import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { authApi, User, watchlistApi, WatchlistItem } from '../services/api';
import AppLayout from './AppLayout';
import TitleSearch from './TitleSearch';
import CategoryBadge from './ui/CategoryBadge';
import MovieCard, { MovieCardSkeleton } from './ui/MovieCard';
import StarRating from './ui/StarRating';

const Watchlist: React.FC = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(() => authApi.getCurrentUser());
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!authApi.isAuthenticated()) return;
    authApi
      .fetchMe()
      .then(setUser)
      .catch(() => {
      });
  }, []);

  useEffect(() => {
    if (user?.role !== 'user') return undefined;

    let cancelled = false;
    setLoading(true);
    watchlistApi
      .list()
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch(() => {
        if (!cancelled) setError(t('watchlist.loadFailed'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.role, t]);

  if (!authApi.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (user && user.role !== 'user') {
    return <Navigate to="/" replace />;
  }

  const trimmedQuery = query.trim().toLowerCase();
  const visibleItems = trimmedQuery
    ? items.filter((item) => item.movie.title.toLowerCase().includes(trimmedQuery))
    : items;

  return (
    <AppLayout user={user}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="page-title">{t('watchlist.title')}</h2>
        {!loading && items.length > 0 && (
          <span className="rounded-full border border-ink-700 bg-ink-900 px-2.5 py-0.5 text-sm text-gray-400 sm:text-base">
            {visibleItems.length}
          </span>
        )}
      </div>

      {!loading && items.length > 0 && <TitleSearch value={query} onChange={setQuery} />}

      {error && (
        <div className="mt-5 rounded-lg border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-300 sm:text-base">
          {error}
        </div>
      )}

      {loading && (
        <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {Array.from({ length: 5 }, (_, index) => (
            <MovieCardSkeleton key={index} />
          ))}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <p className="panel mt-6 px-4 py-12 text-center text-sm text-gray-400 sm:text-base">
          {t('watchlist.empty')}
        </p>
      )}

      {!loading && items.length > 0 && visibleItems.length === 0 && (
        <p className="panel mt-6 px-4 py-12 text-center text-sm text-gray-400 sm:text-base">
          {t('common.noSearchResults', { query: query.trim() })}
        </p>
      )}

      {!loading && visibleItems.length > 0 && (
        <ul className="mt-6 grid animate-fade-in grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {visibleItems.map((item) => (
            <li key={item.id} className="flex">
              <MovieCard
                to={`/movies/${item.movie_id}`}
                poster={item.movie.poster}
                title={item.movie.title}
                year={item.movie.year}
                badge={<CategoryBadge category={item.category} />}
                meta={item.rating != null ? <StarRating value={item.rating} /> : undefined}
              />
            </li>
          ))}
        </ul>
      )}
    </AppLayout>
  );
};

export default Watchlist;
