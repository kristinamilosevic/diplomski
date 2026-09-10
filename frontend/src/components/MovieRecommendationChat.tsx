import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ChatRecommendMessage, moviesApi, StoredMovie } from '../services/api';
import { PLACEHOLDER_POSTER } from '../utils/poster';
import { FilmIcon } from './ui/icons';

type RecommendMode = 'semantic' | 'assistant';

interface ChatTurn {
  role: 'user' | 'assistant';
  text: string;
  movies?: StoredMovie[];
}

const MovieRecommendationChat: React.FC = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<RecommendMode>('semantic');
  const [query, setQuery] = useState('');
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const switchMode = (next: RecommendMode) => {
    setMode(next);
    setTurns([]);
    setError('');
    setQuery('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const message = query.trim();
    if (message.length < 3 || loading) return;

    const nextTurns: ChatTurn[] = [...turns, { role: 'user', text: message }];
    setTurns(nextTurns);
    setQuery('');
    setLoading(true);
    setError('');

    try {
      if (mode === 'semantic') {
        const movies = await moviesApi.recommend(message);
        setTurns([
          ...nextTurns,
          {
            role: 'assistant',
            text: movies.length ? t('recommendations.results') : t('recommendations.noResults'),
            movies,
          },
        ]);
        return;
      }

      const history: ChatRecommendMessage[] = nextTurns.slice(-8).map((turn) => ({
        role: turn.role,
        content: turn.text,
      }));
      const result = await moviesApi.recommendChat(history);
      setTurns([
        ...nextTurns,
        { role: 'assistant', text: result.reply, movies: result.movies },
      ]);
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: unknown } } }).response?.data
        ?.detail;
      setError(typeof detail === 'string' ? detail : t('recommendations.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 sm:bottom-7 sm:right-7">
      {open && (
        <section
          aria-label={t('recommendations.title')}
          className="mb-3 flex h-[min(36rem,calc(100vh-7rem))] w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-xl border border-ink-700 bg-ink-900 shadow-raised sm:w-96"
        >
          <header className="border-b border-ink-700 px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-white">{t('recommendations.title')}</h2>
                <p className="text-xs text-gray-500">
                  {mode === 'semantic'
                    ? t('recommendations.subtitleSemantic')
                    : t('recommendations.subtitleAssistant')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t('recommendations.close')}
                className="rounded-md px-2 py-1 text-xl text-gray-400 hover:bg-ink-800 hover:text-white"
              >
                ×
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => switchMode('semantic')}
                className={`rounded-lg px-2 py-1.5 text-sm ${
                  mode === 'semantic'
                    ? 'bg-orange-600 text-white'
                    : 'border border-ink-700 text-gray-400 hover:text-white'
                }`}
              >
                {t('recommendations.modeSemantic')}
              </button>
              <button
                type="button"
                onClick={() => switchMode('assistant')}
                className={`rounded-lg px-2 py-1.5 text-sm ${
                  mode === 'assistant'
                    ? 'bg-orange-600 text-white'
                    : 'border border-ink-700 text-gray-400 hover:text-white'
                }`}
              >
                {t('recommendations.modeAssistant')}
              </button>
            </div>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            <p className="max-w-[90%] rounded-lg bg-ink-800 px-3 py-2 text-sm text-gray-300">
              {mode === 'semantic'
                ? t('recommendations.greeting')
                : t('recommendations.greetingAssistant')}
            </p>

            {turns.map((turn, index) => (
              <div key={`${turn.role}-${index}`} className="space-y-2">
                <p
                  className={
                    turn.role === 'user'
                      ? 'ml-auto max-w-[90%] rounded-lg bg-orange-600 px-3 py-2 text-sm text-white'
                      : 'max-w-[90%] text-sm text-gray-400'
                  }
                >
                  {turn.text}
                </p>
                {turn.movies?.map((movie) => (
                  <Link
                    key={movie.id}
                    to={`/movies/${movie.id}`}
                    className="flex gap-3 rounded-lg border border-ink-700 bg-ink-850 p-2 transition-colors hover:border-orange-600"
                  >
                    <img
                      src={movie.poster || PLACEHOLDER_POSTER}
                      alt=""
                      className="h-20 w-14 rounded object-cover"
                      onError={(event) => {
                        event.currentTarget.src = PLACEHOLDER_POSTER;
                      }}
                    />
                    <div className="min-w-0 py-1">
                      <h3 className="truncate text-sm font-medium text-white">{movie.title}</h3>
                      <p className="text-xs text-gray-500">
                        {movie.year}
                        {movie.imdb_rating && movie.imdb_rating !== 'N/A'
                          ? ` · ${movie.imdb_rating}`
                          : ''}
                      </p>
                      {movie.genre && (
                        <p className="mt-2 line-clamp-2 text-xs text-gray-400">{movie.genre}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ))}

            {loading && <p className="text-sm text-gray-400">{t('recommendations.thinking')}</p>}
            {error && <p className="text-sm text-red-300">{error}</p>}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 border-t border-ink-700 p-3">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              maxLength={500}
              placeholder={
                mode === 'semantic'
                  ? t('recommendations.placeholder')
                  : t('recommendations.placeholderAssistant')
              }
              aria-label={t('recommendations.placeholder')}
              className="field min-w-0 flex-1"
            />
            <button
              type="submit"
              disabled={query.trim().length < 3 || loading}
              className="btn-primary px-3"
            >
              {t('recommendations.send')}
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={t('recommendations.open')}
        className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-600 text-white shadow-raised transition-transform hover:scale-105 hover:bg-orange-500"
      >
        <FilmIcon className="h-6 w-6" />
      </button>
    </div>
  );
};

export default MovieRecommendationChat;
