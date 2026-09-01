import React from 'react';
import { useTranslation } from 'react-i18next';
import type { AppLanguage } from '../i18n';

const LanguageSwitcher: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { i18n, t } = useTranslation();

  const setLang = (lng: AppLanguage) => {
    void i18n.changeLanguage(lng);
  };

  const active = (lng: AppLanguage) =>
    i18n.resolvedLanguage === lng || i18n.language.startsWith(lng);

  const buttonClass = (lng: AppLanguage) =>
    `rounded px-2 py-1 text-xs font-medium transition-colors sm:text-sm ${
      active(lng) ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-gray-200'
    }`;

  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-md border border-ink-700 bg-ink-850 p-0.5 ${className}`}
      role="group"
      aria-label={t('common.language')}
    >
      <button type="button" onClick={() => setLang('en')} className={buttonClass('en')}>
        {t('common.en')}
      </button>
      <button type="button" onClick={() => setLang('sr')} className={buttonClass('sr')}>
        {t('common.sr')}
      </button>
    </div>
  );
};

export default LanguageSwitcher;
