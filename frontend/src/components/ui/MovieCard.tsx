import React from 'react';
import { Link } from 'react-router-dom';
import { PLACEHOLDER_POSTER } from '../../utils/poster';

interface MovieCardProps {
  poster: string | null;
  title: string;
  year: string;
  to?: string;
  badge?: React.ReactNode;
  meta?: React.ReactNode;
  action?: React.ReactNode;
}

const MovieCard: React.FC<MovieCardProps> = ({ poster, title, year, to, badge, meta, action }) => (
  <article className="group relative flex w-full flex-col overflow-hidden rounded-xl border border-ink-700 bg-ink-900 shadow-soft transition duration-200 hover:border-ink-600 hover:shadow-raised">
    <div className="relative overflow-hidden">
      <img
        src={poster || PLACEHOLDER_POSTER}
        alt={title}
        loading="lazy"
        className="aspect-[2/3] w-full bg-ink-800 object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        onError={(event) => {
          event.currentTarget.src = PLACEHOLDER_POSTER;
        }}
      />
      {badge && <div className="absolute left-2 top-2">{badge}</div>}
    </div>

    <div className="flex flex-1 flex-col gap-3 p-3 sm:p-4">
      <div className="flex-1">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white sm:text-base">
          {title}
        </h3>
        <p className="mt-0.5 text-xs text-gray-400 sm:text-sm">{year}</p>
        {meta && <div className="mt-2">{meta}</div>}
      </div>
      {action && <div className="relative z-20">{action}</div>}
    </div>

    {to && (
      <Link to={to} aria-label={title} className="absolute inset-0 z-10">
        <span className="sr-only">{title}</span>
      </Link>
    )}
  </article>
);

export const MovieCardSkeleton: React.FC = () => (
  <div className="w-full overflow-hidden rounded-xl border border-ink-700 bg-ink-900">
    <div className="aspect-[2/3] w-full animate-pulse bg-ink-800" />
    <div className="space-y-2 p-3 sm:p-4">
      <div className="h-4 w-3/4 animate-pulse rounded bg-ink-800" />
      <div className="h-3 w-1/3 animate-pulse rounded bg-ink-800" />
    </div>
  </div>
);

export default MovieCard;
