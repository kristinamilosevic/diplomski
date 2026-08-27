import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { WatchlistCategory } from '../services/api';

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
  const [rating, setRating] = useState('');
  const [note, setNote] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="watchlist-modal-title"
        className="w-full max-w-md rounded-lg border border-gray-700 bg-gray-900 p-5 text-left shadow-xl"
      >
        <h3 id="watchlist-modal-title" className="text-lg font-semibold text-white">
          {t('watchlist.addTitle')}
        </h3>
        <p className="mt-1 text-sm text-gray-400">{title}</p>

        <form
          className="mt-4 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit({ category, rating, note });
          }}
        >
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

          {error && (
            <p className="rounded-lg border border-red-500/50 bg-red-900/30 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-400 hover:text-white"
            >
              {t('watchlist.cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? t('watchlist.adding') : t('watchlist.add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddToWatchlistModal;
