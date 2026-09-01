import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { authApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import AppHeader from './AppHeader';
import { translateApiDetail } from '../utils/apiError';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (authApi.isAuthenticated()) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError(t('validation.allFieldsRequired'));
      return;
    }

    setLoading(true);

    try {
      await authApi.login({ email, password });
      navigate('/');
    } catch (err: any) {
      if (err.response?.data?.detail) {
        setError(translateApiDetail(err.response.data.detail, t, 'errors.loginFailed'));
      } else {
        setError(t('errors.loginFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md animate-fade-in">
          <div className="panel p-6 shadow-raised sm:p-7">
            <h2 className="text-center text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {t('login.title')}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-400 sm:text-base">
              {t('login.subtitle')}
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <label className="form-label">
                {t('login.emailLabel')}
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="field mt-1"
                  placeholder={t('login.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>

              <label className="form-label">
                {t('login.passwordLabel')}
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="field mt-1"
                  placeholder={t('login.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>

              {error && (
                <p className="rounded-lg border border-red-800 bg-red-950 px-3 py-2 text-sm text-red-300 sm:text-base">
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? t('login.submitting') : t('login.submit')}
              </button>
            </form>
          </div>

          <p className="mt-5 text-center text-sm text-gray-400 sm:text-base">
            {t('login.noAccount')}{' '}
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="font-medium text-orange-400 transition-colors hover:text-orange-300"
            >
              {t('login.registerLink')}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
