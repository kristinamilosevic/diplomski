import React from 'react';
import { useTranslation } from 'react-i18next';
import { SearchIcon } from './ui/icons';

interface TitleSearchProps {
  value: string;
  onChange: (value: string) => void;
}

const TitleSearch: React.FC<TitleSearchProps> = ({ value, onChange }) => {
  const { t } = useTranslation();

  return (
    <label className="relative mt-5 block max-w-xl">
      <span className="sr-only">{t('common.searchPlaceholder')}</span>
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t('common.searchPlaceholder')}
        className="field pl-10"
      />
    </label>
  );
};

export default TitleSearch;
