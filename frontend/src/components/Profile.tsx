import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate } from 'react-router-dom';
import { authApi, User } from '../services/api';
import { translateApiDetail } from '../utils/apiError';
import AppLayout from './AppLayout';
import { LogoutIcon, UserIcon } from './ui/icons';

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(() => authApi.getCurrentUser());
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authApi.isAuthenticated()) return;
    authApi
      .fetchMe()
      .then(setUser)
      .catch(() => { });
  }, []);

  if (!authApi.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const closePasswordForm = () => {
    setChangingPassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
  };

  const handleLogout = () => {
    authApi.logout();
    navigate('/login', { replace: true });
  };

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError(t('validation.allFieldsRequired'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('validation.passwordsMismatch'));
      return;
    }

    if (newPassword.length < 6) {
      setError(t('validation.passwordMinLength'));
      return;
    }

    setSaving(true);

    try {
      await authApi.changePassword(currentPassword, newPassword);
      closePasswordForm();
      setSuccess(t('profile.passwordChanged'));
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: unknown } } }).response?.data?.detail;
      setError(translateApiDetail(detail, t, 'errors.passwordChangeFailed'));
    } finally {
      setSaving(false);
    }
  };

  const roleLabel =
    user?.role === 'admin' ? t('home.roleAdmin') : t('home.roleUser');

  return (
    <AppLayout user={user}>
      <div className="mx-auto w-full max-w-xl">
        <h2 className="page-title text-center">{t('profile.title')}</h2>

        <section className="panel mt-6 p-7 sm:p-9">
          <div className="mb-8 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/20 shadow-soft">
              <UserIcon className="h-10 w-10" />
            </div>
          </div>

          <dl className="space-y-4">
            <div className="rounded-xl border border-ink-700 bg-ink-800/60 p-4 shadow-soft sm:p-5">
              <dt className="field-hint">{t('profile.name')}</dt>
              <dd className="mt-2 break-all text-sm text-white sm:text-base">
                {user?.email}
              </dd>
            </div>

            <div className="rounded-xl border border-ink-700 bg-ink-800/60 p-4 shadow-soft sm:p-5">
              <dt className="field-hint">{t('profile.role')}</dt>
              <dd className="mt-2 text-sm capitalize text-white sm:text-base">
                {roleLabel}
              </dd>
            </div>
          </dl>
        </section>

        {success && !changingPassword && (
          <p className="mt-5 rounded-lg border border-emerald-800 bg-emerald-950 px-3 py-2 text-center text-sm text-emerald-300 sm:text-base">
            {success}
          </p>
        )}

        {changingPassword ? (
          <section className="panel mt-6 p-5 sm:p-6">
            <h3 className="text-center text-base font-semibold tracking-tight text-white sm:text-lg">
              {t('profile.changePassword')}
            </h3>

            <form className="mt-5 space-y-4" onSubmit={handleChangePassword}>
              <label className="form-label">
                {t('profile.currentPassword')}
                <input
                  type="password"
                  autoComplete="current-password"
                  className="field mt-1.5"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                />
              </label>

              <label className="form-label">
                {t('profile.newPassword')}
                <input
                  type="password"
                  autoComplete="new-password"
                  className="field mt-1.5"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                />
              </label>

              <label className="form-label">
                {t('profile.confirmPassword')}
                <input
                  type="password"
                  autoComplete="new-password"
                  className="field mt-1.5"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </label>

              {error && (
                <p className="rounded-lg border border-red-800 bg-red-950 px-3 py-2 text-sm text-red-300 sm:text-base">
                  {error}
                </p>
              )}

              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={closePasswordForm}
                  className="btn-ghost"
                >
                  {t('profile.cancel')}
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary"
                >
                  {saving
                    ? t('profile.saving')
                    : t('profile.savePassword')}
                </button>
              </div>
            </form>
          </section>
        ) : (
          <p className="mt-8 text-center text-sm text-gray-300 sm:text-base">
            {t('profile.changePasswordQuestion')}{' '}
            <button
              type="button"
              onClick={() => {
                setSuccess('');
                setChangingPassword(true);
              }}
              className="font-medium text-orange-400 transition-colors hover:text-orange-300"
            >
              {t('profile.changePasswordYes')}
            </button>
          </p>
        )}

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-medium text-white shadow-soft transition-colors hover:bg-orange-500 sm:text-base"
          >
            <LogoutIcon className="h-5 w-5" />
            {t('home.logout')}
          </button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;