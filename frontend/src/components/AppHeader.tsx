import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { authApi } from '../services/api';
import LanguageSwitcher from './LanguageSwitcher';
import { UserIcon } from './ui/icons';

const AppHeader: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const email = authApi.isAuthenticated() ? authApi.getCurrentUser()?.email : null;

  return (
    <header className="sticky top-0 z-30 border-b border-ink-700 bg-ink-900/85 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 md:py-3.5">
        <h1 className="shrink-0 text-lg font-semibold tracking-tight text-orange-500 sm:text-xl">
          {t('common.appName')}
        </h1>

        <div className="flex min-w-0 shrink items-center gap-2 sm:gap-3">
          {children}
          {!email && <LanguageSwitcher />}
          {email && (
            <NavLink
              to="/profile"
              title={email}
              aria-label={t('profile.title')}
              className={({ isActive }) =>
                `flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                  isActive
                    ? 'bg-ink-800 text-orange-400'
                    : 'text-gray-400 hover:bg-ink-800 hover:text-orange-400'
                }`
              }
            >
              <UserIcon className="h-5 w-5" />
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
