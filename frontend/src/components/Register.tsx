import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { authApi, UserRole } from '../services/api';
import LanguageSwitcher from './LanguageSwitcher';
import { translateApiDetail } from '../utils/apiError';

const Register: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const roleRef = useRef<UserRole>('user');

  const toggleRole = () => {
    const next: UserRole = roleRef.current === 'user' ? 'admin' : 'user';
    roleRef.current = next;
    setRole(next);
  };
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password || !confirmPassword) {
      setError(t('validation.allFieldsRequired'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('validation.passwordsMismatch'));
      return;
    }

    if (password.length < 6) {
      setError(t('validation.passwordMinLength'));
      return;
    }

    setLoading(true);

    try {
      await authApi.register({ email, password, role: roleRef.current });
      setSuccess(t('register.success'));
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      roleRef.current = 'user';
      setRole('user');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      if (err.response?.data?.detail) {
        setError(translateApiDetail(err.response.data.detail, t));
      } else {
        setError(t('errors.registerFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <LanguageSwitcher />
      </div>
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-4xl font-extrabold text-orange-500 drop-shadow-lg">
            {t('register.title')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">{t('register.subtitle')}</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-lg shadow-lg border border-gray-700 bg-gray-800 overflow-hidden divide-y divide-gray-700">
            <div>
              <label htmlFor="email" className="sr-only">
                {t('register.emailLabel')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-4 py-3 border-0 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:text-sm transition-all"
                placeholder={t('register.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                {t('register.passwordLabel')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-4 py-3 border-0 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:text-sm transition-all"
                placeholder={t('register.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">
                {t('register.confirmLabel')}
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-4 py-3 border-0 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:text-sm transition-all"
                placeholder={t('register.confirmPlaceholder')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="p-1.5 bg-gray-900/50">
              <button
                type="button"
                role="switch"
                aria-checked={role === 'admin'}
                aria-label={t('register.roleLabel')}
                onClick={toggleRole}
                className="relative flex h-11 w-full cursor-pointer items-stretch rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800"
              >
                <span
                  className={`pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-md transition-transform duration-200 ease-out ${
                    role === 'user'
                      ? 'translate-x-0 bg-orange-500 shadow'
                      : 'translate-x-full bg-amber-600 shadow'
                  }`}
                  aria-hidden
                />
                <span
                  className={`relative z-10 flex flex-1 items-center justify-center text-sm font-semibold transition-colors ${
                    role === 'user' ? 'text-white' : 'text-gray-500'
                  }`}
                >
                  {t('register.roleUser')}
                </span>
                <span
                  className={`relative z-10 flex flex-1 items-center justify-center text-sm font-semibold transition-colors ${
                    role === 'admin' ? 'text-white' : 'text-gray-500'
                  }`}
                >
                  {t('register.roleAdmin')}
                </span>
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-900/30 border border-red-500/50 p-4 backdrop-blur-sm">
              <div className="text-sm text-red-300 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}

          {success && (
            <div className="rounded-lg bg-green-900/30 border border-green-500/50 p-4 backdrop-blur-sm">
              <div className="text-sm text-green-300 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {success}
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-500/30"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('register.submitting')}
                </span>
              ) : (
                t('register.submit')
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-400">
              {t('register.hasAccount')}{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="font-medium text-orange-500 hover:text-orange-400 transition-colors"
              >
                {t('register.loginLink')}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
