import React from 'react';
import { useTranslation } from 'react-i18next';
import { MovieDetail, StoredMovie } from '../services/api';
import { PLACEHOLDER_POSTER } from '../utils/poster';
import { CalendarIcon, ClockIcon, ExternalLinkIcon, StarIcon } from './ui/icons';

const hasValue = (value?: string | null): value is string => Boolean(value && value !== 'N/A');

const Chip: React.FC<{ icon?: React.ReactNode; children: React.ReactNode }> = ({
  icon,
  children,
}) => (
  <span className="inline-flex items-center gap-1.5 rounded-md border border-ink-700 bg-ink-900/70 px-2 py-1 text-xs text-gray-300 sm:text-sm">
    {icon}
    {children}
  </span>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="panel p-5 sm:p-6">
    <h3 className="text-base font-semibold tracking-tight text-white sm:text-lg">{title}</h3>
    <div className="mt-4">{children}</div>
  </section>
);

const CreditRow: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => {
  if (!hasValue(value)) return null;
  return (
    <div className="flex flex-col gap-1 border-b border-ink-800 py-3 first:pt-0 last:border-0 last:pb-0 sm:flex-row sm:gap-5">
      <dt className="field-hint sm:w-32 sm:shrink-0 sm:pt-1">{label}</dt>
      <dd className="text-sm leading-relaxed text-gray-200 sm:text-base">{value}</dd>
    </div>
  );
};

interface MovieMediaInfoProps {
  movie: StoredMovie;
  details: MovieDetail | null;
  children?: React.ReactNode;
}

const MovieMediaInfo: React.FC<MovieMediaInfoProps> = ({ movie, details, children }) => {
  const { t } = useTranslation();
  const poster = details?.poster || movie.poster;
  const plot = details?.plot || movie.plot;
  const runtime = details?.runtime;
  const rated = details?.rated;
  const imdbRating = details?.imdb_rating;
  const imdbVotes = details?.imdb_votes;
  const type = details?.type || movie.type;
  const genres = (details?.genre || movie.genre || '')
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value && value !== 'N/A');

  return (
    <div className="mt-5 animate-fade-in">
      <header className="relative overflow-hidden rounded-xl border border-ink-700 shadow-raised">
        {hasValue(poster) && (
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
            {hasValue(type) && (
              <span className="w-fit rounded-md border border-ink-700 bg-ink-900/70 px-2 py-0.5 text-xs capitalize text-gray-400 sm:text-sm">
                {type}
              </span>
            )}

            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl">
              {details?.title || movie.title}
            </h2>

            <div className="mt-3 flex flex-wrap gap-2">
              <Chip icon={<CalendarIcon className="h-3.5 w-3.5 text-gray-500" />}>
                {details?.year || movie.year}
              </Chip>
              {hasValue(runtime) && (
                <Chip icon={<ClockIcon className="h-3.5 w-3.5 text-gray-500" />}>{runtime}</Chip>
              )}
              {hasValue(rated) && <Chip>{rated}</Chip>}
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

            {hasValue(imdbRating) && (
              <div className="mt-5 flex">
                <div className="rounded-lg border border-amber-800/70 bg-amber-950/40 px-3 py-2">
                  <p className="text-[0.7rem] uppercase tracking-wide text-gray-500 sm:text-xs">
                    {t('watchlist.fields.imdbRating')}
                  </p>
                  <div className="mt-0.5 flex items-baseline gap-1.5">
                    <span className="text-lg font-semibold leading-none text-white sm:text-xl">
                      <span className="inline-flex items-center gap-1.5">
                        <StarIcon filled className="h-4 w-4 text-amber-400" />
                        {imdbRating}
                      </span>
                    </span>
                    <span className="text-xs text-gray-500">
                      {hasValue(imdbVotes) ? `${imdbVotes} ${t('watchlist.imdbVotes')}` : '/10'}
                    </span>
                  </div>
                </div>
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
            {hasValue(plot) ? plot : <span className="text-gray-500">{t('watchlist.noPlot')}</span>}
          </p>
        </Section>

        {children}

        {(hasValue(details?.director) || hasValue(details?.writer) || hasValue(details?.actors)) && (
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
  );
};

export default MovieMediaInfo;
