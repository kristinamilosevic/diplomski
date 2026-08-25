import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { authApi, moviesApi, StoredMovie, User } from '../services/api';
import { PLACEHOLDER_POSTER } from '../utils/poster';
import AppLayout from './AppLayout';

const Home: React.FC = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(() => authApi.getCurrentUser());
  const [movies, setMovies] = useState<StoredMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const role = user?.role;
  const isAdmin = role === 'admin';

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
    request
      .then((data) => {
        if (!cancelled) setMovies(data);
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
          {movies.map((movie) => (
            <li
              key={movie.id}
              className="overflow-hidden rounded-lg border border-gray-800 bg-gray-800/60"
            >
              <img
                src={movie.poster || PLACEHOLDER_POSTER}
                alt={movie.title}
                className="h-64 w-full bg-gray-700 object-cover"
                onError={(event) => {
                  event.currentTarget.src = PLACEHOLDER_POSTER;
                }}
              />
              <div className="p-3">
                <p className="font-medium leading-snug text-white">{movie.title}</p>
                <p className="mt-1 text-sm text-gray-400">{movie.year}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AppLayout>
  );
};

export default Home;
