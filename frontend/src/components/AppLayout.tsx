import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { User } from '../services/api';
import AppHeader from './AppHeader';
import LanguageSwitcher from './LanguageSwitcher';
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

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <AppHeader />

      <div className="flex min-h-0 w-full flex-1 flex-col md:flex-row">
        <aside className="flex shrink-0 flex-col border-b border-ink-700 px-3 py-4 md:w-40 md:overflow-y-auto md:border-b-0 md:border-r md:py-5 lg:w-44 xl:w-48">
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
          <div className="mt-4 md:mt-auto md:pt-5">
            <LanguageSwitcher />
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8">
          <div className="mx-auto w-full max-w-[110rem]">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
