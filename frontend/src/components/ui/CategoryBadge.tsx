import React from 'react';
import { useTranslation } from 'react-i18next';
import { WatchlistCategory } from '../../services/api';

const STYLES: Record<WatchlistCategory, { pill: string; dot: string }> = {
  want_to_watch: { pill: 'border-sky-800 bg-sky-950/90 text-sky-300', dot: 'bg-sky-400' },
  currently_watching: {
    pill: 'border-amber-800 bg-amber-950/90 text-amber-300',
    dot: 'bg-amber-400',
  },
  watched: { pill: 'border-emerald-800 bg-emerald-950/90 text-emerald-300', dot: 'bg-emerald-400' },
};

const CategoryBadge: React.FC<{ category: WatchlistCategory }> = ({ category }) => {
  const { t } = useTranslation();
  const style = STYLES[category];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium sm:text-sm ${style.pill}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {t(`watchlist.categories.${category}`)}
    </span>
  );
};

export default CategoryBadge;
