import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { authApi, moviesApi } from '../services';
import AppLayout from './AppLayout';
import MovieCard, { MovieCardSkeleton } from './ui/MovieCard';

const AdminMovies = () => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [addingId, setAddingId] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!authApi.isAuthenticated()) {
      setAuthChecked(true);
      return;
    }

    authApi
      .fetchMe()
      .then(setUser)
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setAuthChecked(true);
      });
  }, []);

  useEffect(() => {
    if (!successMessage) return undefined;

    const timer = setTimeout(() => setSuccessMessage(''), 4000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const handleSearch = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const data = await moviesApi.search(trimmedQuery);
      setResults(data.results || []);
    } catch (err) {
      setResults([]);
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : t('admin.searchFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (imdbId, title) => {
    setError('');
    setSuccessMessage('');
    setAddingId(imdbId);

    try {
      await moviesApi.add(imdbId);
      setSuccessMessage(t('admin.added', { title }));
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : t('admin.addFailed'));
    } finally {
      setAddingId(null);
    }
  };

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-400 sm:text-base">
        {t('admin.loading')}
      </div>
    );
  }

  if (!authApi.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <AppLayout user={user}>
      <h2 className="page-title">{t('admin.addMovies')}</h2>
      <p className="mt-2 max-w-[65ch] text-sm text-gray-400 sm:text-base">{t('admin.hint')}</p>

      <form onSubmit={handleSearch} className="mt-5 flex max-w-3xl flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('admin.searchPlaceholder')}
          className="field flex-1"
        />
        <button type="submit" disabled={loading || !query.trim()} className="btn-primary px-6">
          {loading ? t('admin.searching') : t('admin.search')}
        </button>
      </form>

      {error && (
        <div className="mt-5 rounded-lg border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-300 sm:text-base">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mt-5 animate-fade-in rounded-lg border border-emerald-800 bg-emerald-950 px-4 py-3 text-sm text-emerald-300 sm:text-base">
          {successMessage}
        </div>
      )}

      {loading && (
        <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {Array.from({ length: 5 }, (_, index) => (
            <MovieCardSkeleton key={index} />
          ))}
        </div>
      )}

      {!loading && hasSearched && results.length === 0 && (
        <p className="panel mt-6 px-4 py-12 text-center text-sm text-gray-400 sm:text-base">
          {t('admin.noResults', { query: query.trim() })}
        </p>
      )}

      {!loading && results.length > 0 && (
        <ul className="mt-6 grid animate-fade-in grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {results.map((movie) => (
            <li key={movie.imdb_id} className="flex">
              <MovieCard
                poster={movie.poster}
                title={movie.title}
                year={movie.year}
                action={
                  <button
                    type="button"
                    onClick={() => handleAdd(movie.imdb_id, movie.title)}
                    disabled={addingId === movie.imdb_id}
                    className="btn-primary w-full"
                  >
                    {addingId === movie.imdb_id ? t('admin.adding') : t('admin.add')}
                  </button>
                }
              />
            </li>
          ))}
        </ul>
      )}
    </AppLayout>
  );
};

export default AdminMovies;
