import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useParams } from 'react-router-dom';
import { authApi, User, watchlistApi, WatchlistCategory, WatchlistDetail } from '../services/api';
import { PLACEHOLDER_POSTER } from '../utils/poster';
import AppLayout from './AppLayout';
import CategoryBadge from './ui/CategoryBadge';
import StarRating from './ui/StarRating';
import {
  ArrowLeftIcon,
  BookmarkIcon,
  CalendarIcon,
  ClockIcon,
  ExternalLinkIcon,
  PencilIcon,
  StarIcon,
} from './ui/icons';

const CATEGORIES: WatchlistCategory[] = ['want_to_watch', 'currently_watching', 'watched'];

const filled = (value?: string | null): value is string => Boolean(value && value !== 'N/A');

const MetaChip: React.FC<{ icon?: React.ReactNode; children: React.ReactNode }> = ({
  icon,
  children,
}) => (
  <span className="inline-flex items-center gap-1.5 rounded-md border border-ink-700 bg-ink-900/70 px-2 py-1 text-xs text-gray-300 sm:text-sm">
    {icon}
    {children}
  </span>
);

const ScoreCard: React.FC<{
  label: string;
  value: React.ReactNode;
  hint?: string;
  accent?: boolean;
}> = ({ label, value, hint, accent = false }) => (
  <div
    className={`rounded-lg border px-3 py-2 ${
      accent ? 'border-amber-800/70 bg-amber-950/40' : 'border-ink-700 bg-ink-900/70'
    }`}
  >
    <p className="text-[0.7rem] uppercase tracking-wide text-gray-500 sm:text-xs">{label}</p>
    <div className="mt-0.5 flex items-baseline gap-1.5">
      <span className="text-lg font-semibold leading-none text-white sm:text-xl">{value}</span>
      {hint && <span className="text-xs text-gray-500">{hint}</span>}
    </div>
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="panel p-5 sm:p-6">
    <h3 className="text-base font-semibold tracking-tight text-white sm:text-lg">{title}</h3>
    <div className="mt-4">{children}</div>
  </section>
);

const CreditRow: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => {
  if (!filled(value)) return null;
  return (
    <div className="flex flex-col gap-1 border-b border-ink-800 py-3 first:pt-0 last:border-0 last:pb-0 sm:flex-row sm:gap-5">
      <dt className="field-hint sm:w-32 sm:shrink-0 sm:pt-1">{label}</dt>
      <dd className="text-sm leading-relaxed text-gray-200 sm:text-base">{value}</dd>
    </div>
  );
};

const WatchlistDetailPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { movieId } = useParams();
  const [user, setUser] = useState<User | null>(() => authApi.getCurrentUser());
  const [item, setItem] = useState<WatchlistDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [category, setCategory] = useState<WatchlistCategory>('want_to_watch');
  const [rating, setRating] = useState<number | null>(null);
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
  const poster = details?.poster || movie?.poster;
  const plot = details?.plot || movie?.plot;
  const runtime = details?.runtime;
  const rated = details?.rated;
  const imdbRating = details?.imdb_rating;
  const imdbVotes = details?.imdb_votes;
  const genres = (details?.genre || movie?.genre || '')
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value && value !== 'N/A');

  const startEditing = () => {
    if (!item) return;
    setCategory(item.category);
    setRating(item.rating);
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
        rating,
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
      <Link
        to="/watchlist"
        className="inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-orange-400 sm:text-base"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        {t('watchlist.back')}
      </Link>

      {loading && (
        <div className="mt-5 space-y-6">
          <div className="h-72 animate-pulse rounded-xl border border-ink-700 bg-ink-900 sm:h-80" />
          <div className="h-36 animate-pulse rounded-xl border border-ink-700 bg-ink-900" />
          <div className="h-52 animate-pulse rounded-xl border border-ink-700 bg-ink-900" />
          <div className="h-44 animate-pulse rounded-xl border border-ink-700 bg-ink-900" />
        </div>
      )}

      {error && (
        <div className="mt-5 rounded-lg border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-300 sm:text-base">
          {error}
        </div>
      )}

      {!loading && item && movie && (
        <div className="mt-5 animate-fade-in">
          <header className="relative overflow-hidden rounded-xl border border-ink-700 shadow-raised">
            {filled(poster) && (
              <div
                aria-hidden="true"
                className="absolute inset-0 scale-125 bg-cover bg-center opacity-30 blur-2xl"
                style={{ backgroundImage: `url(${poster})` }}
              />
            )}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-br from-ink-950/95 via-ink-950/85 to-ink-900/70"
            />

            <div className="relative flex flex-col gap-5 p-5 sm:flex-row sm:gap-7 sm:p-7">
              <img
                src={poster || PLACEHOLDER_POSTER}
                alt={movie.title}
                className="mx-auto w-36 shrink-0 rounded-lg border border-ink-700 bg-ink-850 object-cover shadow-raised sm:mx-0 sm:w-44 lg:w-52"
                onError={(event) => {
                  event.currentTarget.src = PLACEHOLDER_POSTER;
                }}
              />

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex flex-wrap items-center gap-2">
                  <CategoryBadge category={item.category} />
                  {filled(details?.type || movie.type) && (
                    <span className="rounded-md border border-ink-700 bg-ink-900/70 px-2 py-0.5 text-xs capitalize text-gray-400 sm:text-sm">
                      {details?.type || movie.type}
                    </span>
                  )}
                </div>

                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl">
                  {details?.title || movie.title}
                </h2>

                <div className="mt-3 flex flex-wrap gap-2">
                  <MetaChip icon={<CalendarIcon className="h-3.5 w-3.5 text-gray-500" />}>
                    {details?.year || movie.year}
                  </MetaChip>
                  {filled(runtime) && (
                    <MetaChip icon={<ClockIcon className="h-3.5 w-3.5 text-gray-500" />}>
                      {runtime}
                    </MetaChip>
                  )}
                  {filled(rated) && <MetaChip>{rated}</MetaChip>}
                </div>

                {genres.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {genres.map((genre) => (
                      <li
                        key={genre}
                        className="rounded-full border border-orange-900/60 bg-orange-950/40 px-2.5 py-0.5 text-xs font-medium text-orange-300 sm:text-sm"
                      >
                        {genre}
                      </li>
                    ))}
                  </ul>
                )}

                {filled(imdbRating) && (
                  <div className="mt-5 flex">
                    <ScoreCard
                      accent
                      label={t('watchlist.fields.imdbRating')}
                      value={
                        <span className="inline-flex items-center gap-1.5">
                          <StarIcon filled className="h-4 w-4 text-amber-400" />
                          {imdbRating}
                        </span>
                      }
                      hint={
                        filled(imdbVotes) ? `${imdbVotes} ${t('watchlist.imdbVotes')}` : '/10'
                      }
                    />
                  </div>
                )}

                <a
                  href={`https://www.imdb.com/title/${movie.imdb_id}/`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-medium text-gray-400 transition-colors hover:text-orange-400 sm:text-base"
                >
                  <ExternalLinkIcon className="h-4 w-4" />
                  {t('watchlist.imdbLink')}
                </a>
              </div>
            </div>
          </header>

          <div className="mt-6 space-y-6">
            <Section title={t('watchlist.storyline')}>
              <p className="text-sm leading-relaxed text-gray-300 sm:text-base">
                {filled(plot) ? (
                  plot
                ) : (
                  <span className="text-gray-500">{t('watchlist.noPlot')}</span>
                )}
              </p>
            </Section>

            <section className="panel overflow-hidden border-l-2 border-l-orange-500 shadow-raised">
              <div className="flex items-center justify-between gap-3 border-b border-ink-700 bg-ink-850 px-5 py-4 sm:px-6">
                <h3 className="flex items-center gap-2.5 text-lg font-semibold tracking-tight text-white sm:text-xl">
                  <BookmarkIcon className="h-5 w-5 text-orange-400" />
                  {t('watchlist.yourEntry')}
                </h3>
                {!editing && (
                  <button
                    type="button"
                    onClick={startEditing}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-ink-600 px-3 py-1.5 text-sm font-medium text-gray-300 transition-colors hover:border-orange-500 hover:bg-ink-800 hover:text-orange-400 sm:text-base"
                  >
                    <PencilIcon className="h-4 w-4" />
                    {t('watchlist.edit')}
                  </button>
                )}
              </div>

              <div className="p-5 sm:p-6">
                {editing ? (
                  <form className="space-y-5" onSubmit={handleSave}>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <label className="form-label">
                        {t('watchlist.category')}
                        <select
                          value={category}
                          onChange={(event) => setCategory(event.target.value as WatchlistCategory)}
                          className="field mt-1.5"
                        >
                          {CATEGORIES.map((value) => (
                            <option key={value} value={value}>
                              {t(`watchlist.categories.${value}`)}
                            </option>
                          ))}
                        </select>
                      </label>

                      <div className="form-label">
                        {t('watchlist.rating')}
                        <div className="mt-2.5">
                          <StarRating value={rating} onChange={setRating} />
                        </div>
                      </div>

                      <label className="form-label sm:col-span-2">
                        {t('watchlist.note')}
                        <textarea
                          value={note}
                          onChange={(event) => setNote(event.target.value)}
                          rows={3}
                          maxLength={2000}
                          className="field mt-1.5 resize-none"
                          placeholder={t('watchlist.notePlaceholder')}
                        />
                      </label>
                    </div>

                    {saveError && (
                      <p className="rounded-lg border border-red-800 bg-red-950 px-3 py-2 text-sm text-red-300 sm:text-base">
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
                        className="btn-ghost"
                      >
                        {t('watchlist.cancel')}
                      </button>
                      <button type="submit" disabled={saving} className="btn-primary">
                        {saving ? t('watchlist.saving') : t('watchlist.save')}
                      </button>
                    </div>
                  </form>
                ) : (
                  <dl className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <dt className="field-hint">{t('watchlist.category')}</dt>
                      <dd className="mt-1.5">
                        <CategoryBadge category={item.category} />
                      </dd>
                    </div>
                    <div>
                      <dt className="field-hint">{t('watchlist.rating')}</dt>
                      <dd className="mt-1.5">
                        <StarRating value={item.rating} />
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="field-hint">{t('watchlist.note')}</dt>
                      <dd className="mt-1.5 max-w-[75ch] whitespace-pre-line text-sm leading-relaxed text-gray-200 sm:text-base">
                        {item.note || (
                          <span className="text-gray-500">{t('watchlist.noteEmpty')}</span>
                        )}
                      </dd>
                    </div>
                    <p className="border-t border-ink-800 pt-3 text-xs text-gray-500 sm:col-span-2 sm:text-sm">
                      {t('watchlist.savedOn', {
                        date: new Date(item.created_at).toLocaleDateString(i18n.language, {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        }),
                      })}
                    </p>
                  </dl>
                )}
              </div>
            </section>

            {(filled(details?.director) || filled(details?.writer) || filled(details?.actors)) && (
              <Section title={t('watchlist.credits')}>
                <dl>
                  <CreditRow label={t('watchlist.fields.director')} value={details?.director} />
                  <CreditRow label={t('watchlist.fields.writer')} value={details?.writer} />
                  <CreditRow label={t('watchlist.fields.actors')} value={details?.actors} />
                </dl>
              </Section>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default WatchlistDetailPage;
