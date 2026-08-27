import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { User } from '../services/api';
import AppHeader from './AppHeader';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-orange-500/15 text-orange-400'
      : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
  }`;

interface AppLayoutProps {
  user: User | null;
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ user, children }) => {
  const { t } = useTranslation();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <AppHeader />

      <div className="flex flex-1 flex-col md:flex-row">
        <aside className="border-b border-gray-800 px-4 py-4 md:w-60 md:shrink-0 md:border-b-0 md:border-r md:py-6">

          <nav className="space-y-1">
            <NavLink to="/" end className={navLinkClass}>
              {t('nav.movies')}
            </NavLink>
            {!isAdmin && (
              <NavLink to="/watchlist" className={navLinkClass}>
                {t('nav.watchlist')}
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/admin/movies" className={navLinkClass}>
                {t('nav.manageMovies')}
              </NavLink>
            )}
          </nav>
        </aside>

        <main className="flex-1 px-4 py-6 text-left sm:px-6">{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;
