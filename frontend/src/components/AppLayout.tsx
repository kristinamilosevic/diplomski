import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { User } from '../services/api';
import AppHeader from './AppHeader';
import { BookmarkIcon, FilmIcon, PlusIcon } from './ui/icons';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2.5 rounded-lg border-l-2 px-3 py-2 text-sm font-medium leading-snug transition-colors xl:text-base ${
    isActive
      ? 'border-orange-500 bg-ink-800 text-orange-400'
      : 'border-transparent text-gray-400 hover:bg-ink-850 hover:text-gray-200'
  }`;

interface AppLayoutProps {
  user: User | null;
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ user, children }) => {
  const { t } = useTranslation();
  const isAdmin = user?.role === 'admin';
  const initial = user?.email?.charAt(0).toUpperCase() ?? '?';

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />

      <div className="flex w-full flex-1 flex-col md:flex-row">
        <aside className="border-b border-ink-700 px-3 py-4 md:w-40 md:shrink-0 md:border-b-0 md:border-r md:py-5 lg:w-44 xl:w-48">
          <div className="mb-5 flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-800 text-xs font-semibold text-orange-400">
              {initial}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white" title={user?.email}>
                {user?.email}
              </p>
              {user?.role && (
                <p className="text-xs text-gray-500">
                  {isAdmin ? t('home.roleAdmin') : t('home.roleUser')}
                </p>
              )}
            </div>
          </div>

          <nav className="space-y-1">
            <NavLink to="/" end className={navLinkClass}>
              <FilmIcon className="h-4 w-4 shrink-0 xl:h-[1.125rem] xl:w-[1.125rem]" />
              {t('nav.movies')}
            </NavLink>
            {!isAdmin && (
              <NavLink to="/watchlist" className={navLinkClass}>
                <BookmarkIcon className="h-4 w-4 shrink-0 xl:h-[1.125rem] xl:w-[1.125rem]" />
                {t('nav.watchlist')}
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/admin/movies" className={navLinkClass}>
                <PlusIcon className="h-4 w-4 shrink-0 xl:h-[1.125rem] xl:w-[1.125rem]" />
                {t('nav.manageMovies')}
              </NavLink>
            )}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8">
          <div className="mx-auto w-full max-w-[110rem]">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
