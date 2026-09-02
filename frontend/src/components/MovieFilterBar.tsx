import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  EMPTY_MOVIE_FILTERS,
  MovieFilters,
  MovieSort,
  hasActiveFilters,
} from '../utils/movieFilters';
import { FilterIcon } from './ui/icons';

interface MovieFilterBarProps {
  children: React.ReactNode;
  filters: MovieFilters;
  onChange: (filters: MovieFilters) => void;
  open: boolean;
  onToggle: () => void;
  genres: string[];
  types: string[];
}

const SORTS: MovieSort[] = [
  'added',
  'year_desc',
  'year_asc',
  'rating_desc',
  'rating_asc',
  'title_asc',
];

const pillClass = (selected: boolean) =>
  `rounded-lg border px-3.5 py-2 text-sm font-medium transition-all ${
    selected
      ? 'border-orange-500/50 bg-orange-500/15 text-orange-400 shadow-soft'
      : 'border-ink-700 bg-ink-850 text-gray-400 hover:border-ink-600 hover:bg-ink-800 hover:text-gray-200'
  }`;

const MovieFilterBar: React.FC<MovieFilterBarProps> = ({
  children,
  filters,
  onChange,
  open,
  onToggle,
  genres,
  types,
}) => {
  const { t } = useTranslation();
  const active = hasActiveFilters(filters);

  return (
    <div className="mt-5">
      <div className="flex w-full items-start gap-3">
        <div className="min-w-0 flex-1 [&>label]:mt-0 [&>label]:max-w-none">
          {children}
        </div>

        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-label={t('common.filter')}
          className={`relative flex h-[2.625rem] w-[2.625rem] shrink-0 items-center justify-center rounded-lg border transition-all md:h-[2.875rem] md:w-[2.875rem] ${
            active || open
              ? 'border-orange-500/50 bg-orange-500/10 text-orange-400'
              : 'border-ink-700 bg-ink-850 text-gray-400 hover:border-ink-600 hover:bg-ink-800 hover:text-gray-200'
          }`}
        >
          <FilterIcon className="h-5 w-5" />

          {active && (
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-orange-500" />
          )}
        </button>
      </div>

      {open && (
        <div className="mt-3 overflow-hidden rounded-2xl border border-ink-700 bg-ink-900/95 shadow-raised backdrop-blur">
          <div className="flex items-center justify-between border-b border-ink-800 px-5 py-4 sm:px-6">
            <p className="text-sm font-semibold text-white sm:text-base">
              {t('common.filter')}
            </p>

            {active && (
              <button
                type="button"
                onClick={() => onChange(EMPTY_MOVIE_FILTERS)}
                className="text-sm font-medium text-orange-400 transition-colors hover:text-orange-300"
              >
                {t('common.clearFilters')}
              </button>
            )}
          </div>

          <div className="divide-y divide-ink-800">
            <section className="p-5 sm:p-6">
              <h3 className="text-sm font-medium text-gray-200">
                {t('common.sort')}
              </h3>

              <div className="mt-3">
                <select
                  value={filters.sort}
                  onChange={(event) =>
                    onChange({
                      ...filters,
                      sort: event.target.value as MovieSort,
                    })
                  }
                  className="field w-full"
                >
                  {SORTS.map((value) => (
                    <option key={value} value={value}>
                      {t(`common.sorts.${value}`)}
                    </option>
                  ))}
                </select>
              </div>
            </section>

            <section className="p-5 sm:p-6">
              <h3 className="text-sm font-medium text-gray-200">
                {t('common.type')}
              </h3>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...filters,
                      type: null,
                    })
                  }
                  className={pillClass(filters.type == null)}
                >
                  {t('common.allTypes')}
                </button>

                {types.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      onChange({
                        ...filters,
                        type: value,
                      })
                    }
                    className={`${pillClass(filters.type === value)} capitalize`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </section>

            <section className="p-5 sm:p-6">
              <h3 className="text-sm font-medium text-gray-200">
                {t('common.genre')}
              </h3>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...filters,
                      genre: null,
                    })
                  }
                  className={pillClass(filters.genre == null)}
                >
                  {t('common.allGenres')}
                </button>

                {genres.map((genre) => (
                  <button
                    key={genre}
                    type="button"
                    onClick={() =>
                      onChange({
                        ...filters,
                        genre,
                      })
                    }
                    className={pillClass(filters.genre === genre)}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieFilterBar;