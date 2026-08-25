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
    <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <h1 className="text-xl font-bold text-orange-500 shrink-0">{t('common.appName')}</h1>
        <div className="flex items-center gap-3 shrink-0">
          {children}
          <LanguageSwitcher />
          {isAuthenticated && (
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm font-medium text-gray-400 hover:text-orange-400 transition-colors"
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
