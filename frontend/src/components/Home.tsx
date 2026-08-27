import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import {
  authApi,
  moviesApi,
  StoredMovie,
  User,
  watchlistApi,
} from '../services/api';
import { PLACEHOLDER_POSTER } from '../utils/poster';
import AddToWatchlistModal, { WatchlistFormValues } from './AddToWatchlistModal';
import AppLayout from './AppLayout';

const Home: React.FC = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(() => authApi.getCurrentUser());
  const [movies, setMovies] = useState<StoredMovie[]>([]);
  const [watchlistIds, setWatchlistIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingMovie, setAddingMovie] = useState<StoredMovie | null>(null);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  const role = user?.role;
  const isAdmin = role === 'admin';
  const isUser = role === 'user';

  useEffect(() => {
    if (!authApi.isAuthenticated()) return;
    authApi
      .fetchMe()
      .then(setUser)
      .catch(() => {
      });
  }, []);

  useEffect(() => {
    if (!role) return undefined;

    let cancelled = false;
    setLoading(true);
    setError('');

    const request = role === 'admin' ? moviesApi.listMine() : moviesApi.listAll();
    const extras = role === 'user' ? watchlistApi.list() : Promise.resolve([]);

    Promise.all([request, extras])
      .then(([data, watchlist]) => {
        if (cancelled) return;
        setMovies(data);
        setWatchlistIds(new Set(watchlist.map((item) => item.movie_id)));
      })
      .catch(() => {
        if (!cancelled) setError(t('home.loadFailed'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [role, t]);

  const handleAdd = async (values: WatchlistFormValues) => {
    if (!addingMovie) return;
    setAdding(true);
    setAddError('');

    try {
      const rating = values.rating ? Number(values.rating) : null;
      await watchlistApi.add({
        movie_id: addingMovie.id,
        category: values.category,
        rating,
        note: values.note.trim() || null,
      });
      setWatchlistIds((current) => new Set(current).add(addingMovie.id));
      setAddingMovie(null);
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: unknown } } }).response?.data?.detail;
      setAddError(typeof detail === 'string' ? detail : t('watchlist.addFailed'));
    } finally {
      setAdding(false);
    }
  };

  if (!authApi.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppLayout user={user}>
      <h2 className="text-2xl font-bold text-white">
        {isAdmin ? t('home.myMovies') : t('home.allMovies')}
      </h2>

      {error && (
        <div className="mt-6 rounded-lg border border-red-500/50 bg-red-900/30 px-4 py-3 text-red-300">
          {error}
        </div>
      )}

      {loading && <p className="mt-6 text-gray-400">{t('home.loadingMovies')}</p>}

      {!loading && !error && movies.length === 0 && (
        <p className="mt-6 text-gray-500">
          {isAdmin ? t('home.emptyAdmin') : t('home.emptyUser')}
        </p>
      )}

      {!loading && movies.length > 0 && (
        <ul className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {movies.map((movie) => {
            const saved = watchlistIds.has(movie.id);
            return (
              <li
                key={movie.id}
                className="flex flex-col overflow-hidden rounded-lg border border-gray-800 bg-gray-800/60"
              >
                <img
                  src={movie.poster || PLACEHOLDER_POSTER}
                  alt={movie.title}
                  className="h-64 w-full bg-gray-700 object-cover"
                  onError={(event) => {
                    event.currentTarget.src = PLACEHOLDER_POSTER;
                  }}
                />
                <div className="flex flex-1 flex-col gap-3 p-3">
                  <div className="flex-1">
                    <p className="font-medium leading-snug text-white">{movie.title}</p>
                    <p className="mt-1 text-sm text-gray-400">{movie.year}</p>
                  </div>
                  {isUser && (
                    <button
                      type="button"
                      disabled={saved}
                      onClick={() => {
                        setAddError('');
                        setAddingMovie(movie);
                      }}
                      className="w-full rounded-lg bg-orange-500 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-400"
                    >
                      {saved ? t('watchlist.added') : t('watchlist.add')}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {addingMovie && (
        <AddToWatchlistModal
          title={addingMovie.title}
          submitting={adding}
          error={addError}
          onClose={() => {
            if (!adding) setAddingMovie(null);
          }}
          onSubmit={handleAdd}
        />
      )}
    </AppLayout>
  );
};

export default Home;
