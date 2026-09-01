import React from 'react';

type IconProps = { className?: string };

const DEFAULT = 'h-5 w-5';

export const StarIcon: React.FC<IconProps & { filled?: boolean }> = ({
  className = DEFAULT,
  filled = false,
}) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      d="m12 3.6 2.6 5.3 5.9.85-4.25 4.15 1 5.85L12 17.02l-5.25 2.73 1-5.85L3.5 9.75l5.9-.85L12 3.6Z"
      strokeLinejoin="round"
    />
  </svg>
);

export const FilmIcon: React.FC<IconProps> = ({ className = DEFAULT }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
    <rect x="3.5" y="5" width="17" height="14" rx="2" />
    <path d="M8.5 5v14M15.5 5v14M3.5 12h17" strokeLinecap="round" />
  </svg>
);

export const BookmarkIcon: React.FC<IconProps> = ({ className = DEFAULT }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
    <path d="M6.5 4.5h11a1 1 0 0 1 1 1v14l-6.5-3.6-6.5 3.6v-14a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
  </svg>
);

export const PlusIcon: React.FC<IconProps> = ({ className = DEFAULT }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <path d="M12 5.5v13M5.5 12h13" strokeLinecap="round" />
  </svg>
);

export const ArrowLeftIcon: React.FC<IconProps> = ({ className = DEFAULT }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}>
    <path d="M10 5.5 3.5 12l6.5 6.5M4 12h16" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const PencilIcon: React.FC<IconProps> = ({ className = DEFAULT }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
    <path
      d="M4.5 19.5h3l10-10a2.12 2.12 0 0 0-3-3l-10 10v3ZM14.5 6.5l3 3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ClockIcon: React.FC<IconProps> = ({ className = DEFAULT }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 8v4.4l2.8 1.9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CalendarIcon: React.FC<IconProps> = ({ className = DEFAULT }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
    <rect x="4" y="5.5" width="16" height="14" rx="2" />
    <path d="M4 10h16M8.5 3.5v3M15.5 3.5v3" strokeLinecap="round" />
  </svg>
);

export const UserIcon: React.FC<IconProps> = ({ className = DEFAULT }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
    <circle cx="12" cy="8.5" r="3.2" />
    <path d="M5.5 19.2c.8-3.2 3.3-5.2 6.5-5.2s5.7 2 6.5 5.2" strokeLinecap="round" />
  </svg>
);

export const LogoutIcon: React.FC<IconProps> = ({ className = DEFAULT }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
    <path
      d="M10 5.5H6.5A2 2 0 0 0 4.5 7.5v9a2 2 0 0 0 2 2H10M10 12h9.5M16.5 8.5 20 12l-3.5 3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const SearchIcon: React.FC<IconProps> = ({ className = DEFAULT }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4 4" strokeLinecap="round" />
  </svg>
);

export const ExternalLinkIcon: React.FC<IconProps> = ({ className = DEFAULT }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
    <path
      d="M14 5h5v5M19 5l-7.5 7.5M17 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 4 18.5v-10A1.5 1.5 0 0 1 5.5 7H10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
