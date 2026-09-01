import React from 'react';
import { useTranslation } from 'react-i18next';
import { StarIcon } from './icons';

const MAX = 5;

interface StarRatingProps {
  value: number | null;
  onChange?: (value: number | null) => void;
}

const StarRating: React.FC<StarRatingProps> = ({ value, onChange }) => {
  const { t } = useTranslation();

  if (!onChange) {
    if (value == null) {
      return <span className="text-sm text-gray-500 sm:text-base">{t('watchlist.ratingNone')}</span>;
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-amber-400 sm:text-base">
        <StarIcon filled className="h-4 w-4 sm:h-[1.125rem] sm:w-[1.125rem]" />
        <span className="font-medium">
          {value}
          <span className="text-gray-500">/{MAX}</span>
        </span>
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center">
        {Array.from({ length: MAX }, (_, index) => index + 1).map((star) => {
          const filled = value != null && star <= value;
          return (
            <button
              key={star}
              type="button"
              aria-label={`${t('watchlist.rating')} ${star}`}
              onClick={() => onChange(value === star ? null : star)}
              className="p-0.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-orange-500"
            >
              <StarIcon
                filled={filled}
                className={`h-5 w-5 sm:h-6 sm:w-6 ${filled ? 'text-amber-400' : 'text-ink-600'}`}
              />
            </button>
          );
        })}
      </div>

      <span className="text-sm text-gray-400 sm:text-base">
        {value != null ? `${value}/${MAX}` : t('watchlist.ratingNone')}
      </span>
    </div>
  );
};

export default StarRating;
