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
import AddToWatchlistModal, { WatchlistFormValues } from './AddToWatchlistModal';
import AppLayout from './AppLayout';
import TitleSearch from './TitleSearch';
import MovieCard, { MovieCardSkeleton } from './ui/MovieCard';

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
  const [query, setQuery] = useState('');

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

  const trimmedQuery = query.trim().toLowerCase();
  const visibleMovies = trimmedQuery
    ? movies.filter((movie) => movie.title.toLowerCase().includes(trimmedQuery))
    : movies;

  return (
    <AppLayout user={user}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="page-title">{isAdmin ? t('home.myMovies') : t('home.allMovies')}</h2>
        {!loading && movies.length > 0 && (
          <span className="rounded-full border border-ink-700 bg-ink-900 px-2.5 py-0.5 text-sm text-gray-400 sm:text-base">
            {visibleMovies.length}
          </span>
        )}
      </div>

      {!loading && movies.length > 0 && <TitleSearch value={query} onChange={setQuery} />}

      {error && (
        <div className="mt-5 rounded-lg border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-300 sm:text-base">
          {error}
        </div>
      )}

      {loading && (
        <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {Array.from({ length: 12 }, (_, index) => (
            <MovieCardSkeleton key={index} />
          ))}
        </div>
      )}

      {!loading && !error && movies.length === 0 && (
        <p className="panel mt-6 px-4 py-12 text-center text-sm text-gray-400 sm:text-base">
          {isAdmin ? t('home.emptyAdmin') : t('home.emptyUser')}
        </p>
      )}

      {!loading && movies.length > 0 && visibleMovies.length === 0 && (
        <p className="panel mt-6 px-4 py-12 text-center text-sm text-gray-400 sm:text-base">
          {t('common.noSearchResults', { query: query.trim() })}
        </p>
      )}

      {!loading && visibleMovies.length > 0 && (
        <ul className="mt-6 grid animate-fade-in grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {visibleMovies.map((movie) => {
            const saved = watchlistIds.has(movie.id);
            return (
              <li key={movie.id} className="flex">
                <MovieCard
                  poster={movie.poster}
                  title={movie.title}
                  year={movie.year}
                  action={
                    isUser ? (
                      <button
                        type="button"
                        disabled={saved}
                        onClick={() => {
                          setAddError('');
                          setAddingMovie(movie);
                        }}
                        className={
                          saved
                            ? 'w-full rounded-lg border border-ink-700 bg-ink-850 py-2 text-sm text-gray-400 sm:text-base md:py-2.5'
                            : 'btn-primary w-full'
                        }
                      >
                        {saved ? t('watchlist.added') : t('watchlist.add')}
                      </button>
                    ) : undefined
                  }
                />
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
