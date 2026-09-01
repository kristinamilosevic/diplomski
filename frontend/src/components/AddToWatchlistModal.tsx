import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { WatchlistCategory } from '../services/api';
import StarRating from './ui/StarRating';

export interface WatchlistFormValues {
  category: WatchlistCategory;
  rating: string;
  note: string;
}

interface AddToWatchlistModalProps {
  title: string;
  submitting: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (values: WatchlistFormValues) => void;
}

const CATEGORIES: WatchlistCategory[] = ['want_to_watch', 'currently_watching', 'watched'];

const AddToWatchlistModal: React.FC<AddToWatchlistModalProps> = ({
  title,
  submitting,
  error,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const [category, setCategory] = useState<WatchlistCategory>('want_to_watch');
  const [rating, setRating] = useState<number | null>(null);
  const [note, setNote] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="watchlist-modal-title"
        className="w-full max-w-md rounded-xl border border-ink-700 bg-ink-900 p-5 text-left shadow-raised sm:p-6"
      >
        <p className="field-hint font-medium">{t('watchlist.addTitle')}</p>
        <h3
          id="watchlist-modal-title"
          className="mt-1 text-xl font-semibold leading-snug text-white sm:text-2xl"
        >
          {title}
        </h3>

        <form
          className="mt-5 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit({ category, rating: rating != null ? String(rating) : '', note });
          }}
        >
          <label className="form-label">
            {t('watchlist.category')}
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as WatchlistCategory)}
              className="field mt-1"
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
            <div className="mt-1">
              <StarRating value={rating} onChange={setRating} />
            </div>
          </div>

          <label className="form-label">
            {t('watchlist.note')}
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
              maxLength={2000}
              className="field mt-1 resize-none"
              placeholder={t('watchlist.notePlaceholder')}
            />
          </label>

          {error && (
            <p className="rounded-lg border border-red-800 bg-red-950 px-3 py-2 text-sm text-red-300 sm:text-base">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} disabled={submitting} className="btn-ghost">
              {t('watchlist.cancel')}
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? t('watchlist.adding') : t('watchlist.add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddToWatchlistModal;
