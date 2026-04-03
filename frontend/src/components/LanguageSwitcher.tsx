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

  return (
    <div
      className={`inline-flex rounded-md border border-gray-600 bg-gray-800/80 p-0.5 text-xs font-medium ${className}`}
      role="group"
      aria-label={t('common.language')}
    >
      <button
        type="button"
        onClick={() => setLang('en')}
        className={`rounded px-2 py-1 transition-colors ${
          active('en')
            ? 'bg-orange-500/90 text-white'
            : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        {t('common.en')}
      </button>
      <button
        type="button"
        onClick={() => setLang('sr')}
        className={`rounded px-2 py-1 transition-colors ${
          active('sr')
            ? 'bg-orange-500/90 text-white'
            : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        {t('common.sr')}
      </button>
    </div>
  );
};

export default LanguageSwitcher;
