import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { authApi, UserRole } from '../services/api';
import AppHeader from './AppHeader';
import { translateApiDetail } from '../utils/apiError';

const ROLES: UserRole[] = ['user', 'admin'];

const Register: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const roleRef = useRef<UserRole>('user');

  const selectRole = (next: UserRole) => {
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
      selectRole('user');
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
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md animate-fade-in">
          <div className="panel p-6 shadow-raised sm:p-7">
            <h2 className="text-center text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {t('register.title')}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-400 sm:text-base">
              {t('register.subtitle')}
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <label className="form-label">
                {t('register.emailLabel')}
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="field mt-1"
                  placeholder={t('register.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>

              <label className="form-label">
                {t('register.passwordLabel')}
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="field mt-1"
                  placeholder={t('register.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>

              <label className="form-label">
                {t('register.confirmLabel')}
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="field mt-1"
                  placeholder={t('register.confirmPlaceholder')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </label>

              <div className="form-label">
                {t('register.roleLabel')}
                <div
                  className="mt-1 flex gap-1 rounded-lg border border-ink-700 bg-ink-850 p-1"
                  role="group"
                  aria-label={t('register.roleLabel')}
                >
                  {ROLES.map((value) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={role === value}
                      onClick={() => selectRole(value)}
                      className={`flex-1 rounded px-3 py-2 text-sm font-medium transition-colors sm:text-base ${
                        role === value
                          ? 'bg-orange-600 text-white'
                          : 'text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      {value === 'user' ? t('register.roleUser') : t('register.roleAdmin')}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="rounded-lg border border-red-800 bg-red-950 px-3 py-2 text-sm text-red-300 sm:text-base">
                  {error}
                </p>
              )}

              {success && (
                <p className="animate-fade-in rounded-lg border border-emerald-800 bg-emerald-950 px-3 py-2 text-sm text-emerald-300 sm:text-base">
                  {success}
                </p>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? t('register.submitting') : t('register.submit')}
              </button>
            </form>
          </div>

          <p className="mt-5 text-center text-sm text-gray-400 sm:text-base">
            {t('register.hasAccount')}{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="font-medium text-orange-400 transition-colors hover:text-orange-300"
            >
              {t('register.loginLink')}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Register;
