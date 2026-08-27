import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useParams } from 'react-router-dom';
import { authApi, User, watchlistApi, WatchlistCategory, WatchlistDetail } from '../services/api';
import { PLACEHOLDER_POSTER } from '../utils/poster';
import AppLayout from './AppLayout';

const CATEGORIES: WatchlistCategory[] = ['want_to_watch', 'currently_watching', 'watched'];

const DetailRow: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => {
  if (!value || value === 'N/A') return null;
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-200">{value}</dd>
    </div>
  );
};

const WatchlistDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { movieId } = useParams();
  const [user, setUser] = useState<User | null>(() => authApi.getCurrentUser());
  const [item, setItem] = useState<WatchlistDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [category, setCategory] = useState<WatchlistCategory>('want_to_watch');
  const [rating, setRating] = useState('');
  const [note, setNote] = useState('');

  const parsedId = Number(movieId);

  useEffect(() => {
    if (!authApi.isAuthenticated()) return;
    authApi
      .fetchMe()
      .then(setUser)
      .catch(() => {
      });
  }, []);

  useEffect(() => {
    if (user?.role !== 'user' || !Number.isInteger(parsedId)) return undefined;

    let cancelled = false;
    setLoading(true);
    watchlistApi
      .get(parsedId)
      .then((data) => {
        if (!cancelled) {
          setItem(data);
          setEditing(false);
          setSaveError('');
        }
      })
      .catch(() => {
        if (!cancelled) setError(t('watchlist.detailFailed'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.role, parsedId, t]);

  if (!authApi.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (user && user.role !== 'user') {
    return <Navigate to="/" replace />;
  }

  const details = item?.details;
  const movie = item?.movie;

  const startEditing = () => {
    if (!item) return;
    setCategory(item.category);
    setRating(item.rating != null ? String(item.rating) : '');
    setNote(item.note || '');
    setSaveError('');
    setEditing(true);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!item) return;
    setSaving(true);
    setSaveError('');
    try {
      const updated = await watchlistApi.update(item.movie_id, {
        category,
        rating: rating ? Number(rating) : null,
        note: note.trim() || null,
      });
      setItem(updated);
      setEditing(false);
    } catch {
      setSaveError(t('watchlist.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout user={user}>
      <Link to="/watchlist" className="text-sm text-gray-400 hover:text-orange-400">
        {t('watchlist.back')}
      </Link>

      {loading && <p className="mt-6 text-gray-400">{t('watchlist.loading')}</p>}

      {error && (
        <div className="mt-6 rounded-lg border border-red-500/50 bg-red-900/30 px-4 py-3 text-red-300">
          {error}
        </div>
      )}

      {!loading && item && movie && (
        <article className="mt-6 flex flex-col gap-8 lg:flex-row">
          <img
            src={details?.poster || movie.poster || PLACEHOLDER_POSTER}
            alt={movie.title}
            className="h-auto w-full max-w-xs rounded-lg bg-gray-800 object-cover"
            onError={(event) => {
              event.currentTarget.src = PLACEHOLDER_POSTER;
            }}
          />

          <div className="min-w-0 flex-1 space-y-6">
            <header>
              <h2 className="text-3xl font-bold text-white">
                {details?.title || movie.title}
              </h2>
              <p className="mt-1 text-gray-400">{details?.year || movie.year}</p>
            </header>

            <p className="text-gray-300 leading-relaxed">{details?.plot || movie.plot}</p>

            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailRow label={t('watchlist.fields.genre')} value={details?.genre || movie.genre} />
              <DetailRow label={t('watchlist.fields.type')} value={details?.type || movie.type} />
              <DetailRow label={t('watchlist.fields.runtime')} value={details?.runtime} />
              <DetailRow label={t('watchlist.fields.released')} value={details?.released} />
              <DetailRow label={t('watchlist.fields.director')} value={details?.director} />
              <DetailRow label={t('watchlist.fields.actors')} value={details?.actors} />
              <DetailRow label={t('watchlist.fields.language')} value={details?.language} />
              <DetailRow label={t('watchlist.fields.country')} value={details?.country} />
              <DetailRow label={t('watchlist.fields.imdbRating')} value={details?.imdb_rating} />
              <DetailRow label={t('watchlist.fields.awards')} value={details?.awards} />
            </dl>

            <section className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-orange-400">
                  {t('watchlist.yourEntry')}
                </h3>
                {!editing && (
                  <button
                    type="button"
                    onClick={startEditing}
                    className="text-sm font-medium text-gray-400 hover:text-orange-400"
                  >
                    {t('watchlist.edit')}
                  </button>
                )}
              </div>

              {editing ? (
                <form className="mt-4 space-y-4" onSubmit={handleSave}>
                  <label className="block text-sm text-gray-300">
                    {t('watchlist.category')}
                    <select
                      value={category}
                      onChange={(event) => setCategory(event.target.value as WatchlistCategory)}
                      className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      {CATEGORIES.map((value) => (
                        <option key={value} value={value}>
                          {t(`watchlist.categories.${value}`)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block text-sm text-gray-300">
                    {t('watchlist.rating')}
                    <select
                      value={rating}
                      onChange={(event) => setRating(event.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">{t('watchlist.ratingNone')}</option>
                      {Array.from({ length: 10 }, (_, index) => String(index + 1)).map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block text-sm text-gray-300">
                    {t('watchlist.note')}
                    <textarea
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      rows={3}
                      maxLength={2000}
                      className="mt-1 w-full resize-none rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder={t('watchlist.notePlaceholder')}
                    />
                  </label>

                  {saveError && (
                    <p className="rounded-lg border border-red-500/50 bg-red-900/30 px-3 py-2 text-sm text-red-300">
                      {saveError}
                    </p>
                  )}

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => {
                        setEditing(false);
                        setSaveError('');
                      }}
                      className="rounded-lg px-4 py-2 text-sm font-medium text-gray-400 hover:text-white disabled:opacity-50"
                    >
                      {t('watchlist.cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving ? t('watchlist.saving') : t('watchlist.save')}
                    </button>
                  </div>
                </form>
              ) : (
                <dl className="mt-3 space-y-3">
                  <DetailRow
                    label={t('watchlist.category')}
                    value={t(`watchlist.categories.${item.category}`)}
                  />
                  <DetailRow
                    label={t('watchlist.rating')}
                    value={item.rating != null ? String(item.rating) : t('watchlist.ratingNone')}
                  />
                  <DetailRow
                    label={t('watchlist.note')}
                    value={item.note || t('watchlist.noteEmpty')}
                  />
                </dl>
              )}
            </section>
          </div>
        </article>
      )}
    </AppLayout>
  );
};

export default WatchlistDetailPage;
