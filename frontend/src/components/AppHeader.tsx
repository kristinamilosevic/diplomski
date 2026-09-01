import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import LanguageSwitcher from './LanguageSwitcher';

const AppHeader: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isAuthenticated = authApi.isAuthenticated();

  const handleLogout = () => {
    authApi.logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-ink-700 bg-ink-900/85 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 md:py-3.5">
        <h1 className="shrink-0 text-lg font-semibold tracking-tight text-orange-500 sm:text-xl">
          {t('common.appName')}
        </h1>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {children}
          <LanguageSwitcher />
          {isAuthenticated && (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg px-2 py-1 text-sm font-medium text-gray-400 transition-colors hover:bg-ink-800 hover:text-orange-400 sm:text-base"
            >
              {t('home.logout')}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
