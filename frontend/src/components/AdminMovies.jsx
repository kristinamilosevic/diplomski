import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { authApi, moviesApi } from '../services';
import { PLACEHOLDER_POSTER } from '../utils/poster';
import AppLayout from './AppLayout';

const AdminMovies = () => {
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
      setError(typeof detail === 'string' ? detail : 'Failed to search movies.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (imdbId, title) => {
    setError('');
    setSuccessMessage('');
    setAddingId(imdbId);

    try {
      const added = await moviesApi.add(imdbId);
      const addedAt = added.created_at
        ? new Date(added.created_at).toLocaleString()
        : null;
      setSuccessMessage(
        addedAt
          ? `"${title}" was added to the database (${addedAt}).`
          : `"${title}" was added to the database.`
      );
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Failed to add movie.');
    } finally {
      setAddingId(null);
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-400">
        Loading...
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
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Add Movies</h2>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search movies by title..."
            className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="rounded-lg bg-orange-500 px-6 py-3 font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && (
          <div className="rounded-lg border border-red-500/50 bg-red-900/30 px-4 py-3 text-red-300">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="rounded-lg border border-green-500/50 bg-green-900/30 px-4 py-3 text-green-300">
            {successMessage}
          </div>
        )}

        {loading && (
          <div className="text-center text-gray-400 py-12">Searching movies...</div>
        )}

        {!loading && hasSearched && results.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            No movies found for &quot;{query.trim()}&quot;.
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {results.map((movie) => (
              <article
                key={movie.imdb_id}
                className="rounded-lg border border-gray-800 bg-gray-800/60 overflow-hidden flex flex-col"
              >
                <img
                  src={movie.poster || PLACEHOLDER_POSTER}
                  alt={movie.title}
                  className="w-full h-72 object-cover bg-gray-700"
                  onError={(event) => {
                    event.currentTarget.src = PLACEHOLDER_POSTER;
                  }}
                />
                <div className="p-4 flex flex-col flex-1 gap-3">
                  <div className="flex-1">
                    <h2 className="font-semibold text-white leading-snug">{movie.title}</h2>
                    <p className="text-sm text-gray-400 mt-1">{movie.year}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAdd(movie.imdb_id, movie.title)}
                    disabled={addingId === movie.imdb_id}
                    className="w-full rounded-lg bg-orange-500 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                  >
                    {addingId === movie.imdb_id ? 'Adding...' : 'Add'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default AdminMovies;
