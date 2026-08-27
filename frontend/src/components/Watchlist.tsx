import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate } from 'react-router-dom';
import { authApi, User, watchlistApi, WatchlistItem } from '../services/api';
import { PLACEHOLDER_POSTER } from '../utils/poster';
import AppLayout from './AppLayout';

const Watchlist: React.FC = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(() => authApi.getCurrentUser());
  const [items, setItems] = useState<WatchlistItem[]>([]);
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

  return (
    <AppLayout user={user}>
      <h2 className="text-2xl font-bold text-white">{t('watchlist.title')}</h2>

      {error && (
        <div className="mt-6 rounded-lg border border-red-500/50 bg-red-900/30 px-4 py-3 text-red-300">
          {error}
        </div>
      )}

      {loading && <p className="mt-6 text-gray-400">{t('watchlist.loading')}</p>}

      {!loading && !error && items.length === 0 && (
        <p className="mt-6 text-gray-500">{t('watchlist.empty')}</p>
      )}

      {!loading && items.length > 0 && (
        <ul className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                to={`/watchlist/${item.movie_id}`}
                className="block overflow-hidden rounded-lg border border-gray-800 bg-gray-800/60 transition-colors hover:border-orange-500/60"
              >
                <img
                  src={item.movie.poster || PLACEHOLDER_POSTER}
                  alt={item.movie.title}
                  className="h-64 w-full bg-gray-700 object-cover"
                  onError={(event) => {
                    event.currentTarget.src = PLACEHOLDER_POSTER;
                  }}
                />
                <div className="p-3">
                  <p className="font-medium leading-snug text-white">{item.movie.title}</p>
                  <p className="mt-1 text-sm text-gray-400">{item.movie.year}</p>
                  <p className="mt-1 text-xs text-orange-400">
                    {t(`watchlist.categories.${item.category}`)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppLayout>
  );
};

export default Watchlist;
