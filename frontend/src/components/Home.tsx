import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router-dom';
import { authApi, User } from '../services/api';
import LanguageSwitcher from './LanguageSwitcher';

const Home: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(() => authApi.getCurrentUser());

  useEffect(() => {
    if (!authApi.isAuthenticated()) return;
    authApi
      .fetchMe()
      .then(setUser)
      .catch(() => {
      });
  }, []);

  if (!authApi.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    authApi.logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-xl font-bold text-orange-500 shrink-0">{t('common.appName')}</h1>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <LanguageSwitcher />
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm font-medium text-gray-400 hover:text-orange-400 transition-colors"
            >
              {t('home.logout')}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full text-center space-y-6">
          <h2 className="text-3xl font-extrabold text-white drop-shadow-lg">{t('home.welcome')}</h2>
          <p className="text-gray-400 text-base leading-relaxed">
            {t('home.signedInAs')}{' '}
            <span className="text-orange-400 font-medium">{user?.email}</span>
            {user?.role && (
              <>
                {' '}
                <span className="text-gray-600" aria-hidden>
                  ·
                </span>{' '}
                <span
                  className={
                    user.role === 'admin'
                      ? 'text-amber-400/95 font-medium'
                      : 'text-gray-400'
                  }
                >
                  {t('home.rolePrefix')}{' '}
                  {user.role === 'admin' ? t('home.roleAdmin') : t('home.roleUser')}
                </span>
              </>
            )}
          </p>
          <p className="text-sm text-gray-500">{t('home.placeholder')}</p>
        </div>
      </main>
    </div>
  );
};

export default Home;
