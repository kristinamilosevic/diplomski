import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { watchlistApi, WatchlistCategory, WatchlistDetail } from '../services/api';
import CategoryBadge from './ui/CategoryBadge';
import StarRating from './ui/StarRating';
import { BookmarkIcon, PencilIcon } from './ui/icons';

const CATEGORIES: WatchlistCategory[] = ['want_to_watch', 'currently_watching', 'watched'];

interface WatchlistEntryPanelProps {
  item: WatchlistDetail;
  onSaved: (item: WatchlistDetail) => void;
}

const WatchlistEntryPanel: React.FC<WatchlistEntryPanelProps> = ({ item, onSaved }) => {
  const { t, i18n } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [category, setCategory] = useState(item.category);
  const [rating, setRating] = useState(item.rating);
  const [note, setNote] = useState(item.note || '');

  const openEditor = () => {
    setCategory(item.category);
    setRating(item.rating);
    setNote(item.note || '');
    setError('');
    setEditing(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      onSaved(
        await watchlistApi.update(item.movie_id, { category, rating, note: note.trim() || null }),
      );
      setEditing(false);
    } catch {
      setError(t('watchlist.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const addedOn = new Date(item.created_at).toLocaleDateString(i18n.language, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <section className="panel overflow-hidden border-l-2 border-l-orange-500 shadow-raised">
      <div className="flex items-center justify-between gap-3 border-b border-ink-700 bg-ink-850 px-5 py-4 sm:px-6">
        <h3 className="flex items-center gap-2.5 text-lg font-semibold tracking-tight text-white sm:text-xl">
          <BookmarkIcon className="h-5 w-5 text-orange-400" />
          {t('watchlist.yourEntry')}
        </h3>
        {!editing && (
          <button
            type="button"
            onClick={openEditor}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-ink-600 px-3 py-1.5 text-sm font-medium text-gray-300 transition-colors hover:border-orange-500 hover:bg-ink-800 hover:text-orange-400 sm:text-base"
          >
            <PencilIcon className="h-4 w-4" />
            {t('watchlist.edit')}
          </button>
        )}
      </div>

      <div className="p-5 sm:p-6">
        {editing ? (
          <form className="space-y-5" onSubmit={handleSubmit}>
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

            {error && (
              <p className="rounded-lg border border-red-800 bg-red-950 px-3 py-2 text-sm text-red-300 sm:text-base">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  setEditing(false);
                  setError('');
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
                {item.note || <span className="text-gray-500">{t('watchlist.noteEmpty')}</span>}
              </dd>
            </div>
            <p className="border-t border-ink-800 pt-3 text-xs text-gray-500 sm:col-span-2 sm:text-sm">
              {t('watchlist.savedOn', { date: addedOn })}
            </p>
          </dl>
        )}
      </div>
    </section>
  );
};

export default WatchlistEntryPanel;
