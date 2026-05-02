import type { FC } from 'react';

export type EmptyIllustrationVariant = 'company' | 'search';

type Props = {
  variant?: EmptyIllustrationVariant;
};

/** Lightweight SVG empty states with CSS-driven motion (no extra assets). */
const EmptyTableIllustration: FC<Props> = ({ variant = 'company' }) => {
  if (variant === 'search') {
    return (
      <svg
        className="empty-table-visual empty-table-visual--search"
        viewBox="0 0 200 140"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id="search-glass" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>
        <ellipse className="empty-table-visual__shadow" cx="100" cy="118" rx="42" ry="6" fill="rgba(15,23,42,0.08)" />
        <g className="empty-table-visual__search-group">
          <circle cx="88" cy="72" r="36" fill="none" stroke="url(#search-glass)" strokeWidth="8" strokeLinecap="round" />
          <path
            d="M114 98 L132 118"
            stroke="url(#search-glass)"
            strokeWidth="8"
            strokeLinecap="round"
          />
        </g>
        <g className="empty-table-visual__dots" opacity="0.45">
          <circle cx="52" cy="38" r="3" fill="#94a3b8" />
          <circle cx="148" cy="44" r="2.5" fill="#94a3b8" />
          <circle cx="160" cy="28" r="2" fill="#cbd5e1" />
        </g>
      </svg>
    );
  }

  return (
    <svg
      className="empty-table-visual empty-table-visual--company"
      viewBox="0 0 200 140"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="co-b1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id="co-b2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <ellipse className="empty-table-visual__shadow" cx="100" cy="124" rx="62" ry="7" fill="rgba(15,23,42,0.07)" />
      <g className="empty-table-visual__cloud">
        <path
          d="M38 48 Q48 32 64 38 Q72 24 92 30 Q108 22 124 34 Q142 28 152 44 Q168 40 162 58 Q168 68 156 72 L44 72 Q28 68 32 54 Q30 48 38 48Z"
          fill="#e2e8f0"
          opacity="0.95"
        />
      </g>
      <g className="empty-table-visual__building empty-table-visual__building--left">
        <rect x="44" y="58" width="46" height="62" rx="6" fill="url(#co-b1)" />
        <rect x="52" y="68" width="10" height="10" rx="2" fill="rgba(255,255,255,0.35)" />
        <rect x="68" y="68" width="10" height="10" rx="2" fill="rgba(255,255,255,0.45)" />
        <rect x="52" y="84" width="10" height="10" rx="2" fill="rgba(255,255,255,0.3)" />
        <rect x="68" y="84" width="10" height="10" rx="2" fill="rgba(255,255,255,0.25)" />
        <rect x="52" y="100" width="10" height="10" rx="2" fill="rgba(255,255,255,0.35)" />
        <rect x="68" y="100" width="10" height="10" rx="2" fill="rgba(255,255,255,0.3)" />
      </g>
      <g className="empty-table-visual__building empty-table-visual__building--right">
        <rect x="104" y="44" width="56" height="76" rx="6" fill="url(#co-b2)" />
        <rect x="114" y="56" width="12" height="12" rx="2" fill="rgba(255,255,255,0.4)" />
        <rect x="132" y="56" width="12" height="12" rx="2" fill="rgba(255,255,255,0.35)" />
        <rect x="114" y="76" width="12" height="12" rx="2" fill="rgba(255,255,255,0.3)" />
        <rect x="132" y="76" width="12" height="12" rx="2" fill="rgba(255,255,255,0.45)" />
        <rect x="114" y="96" width="12" height="12" rx="2" fill="rgba(255,255,255,0.28)" />
        <rect x="132" y="96" width="12" height="12" rx="2" fill="rgba(255,255,255,0.35)" />
        <rect x="123" y="112" width="18" height="8" rx="2" fill="rgba(15,23,42,0.25)" />
      </g>
      <circle className="empty-table-visual__sun" cx="168" cy="36" r="14" fill="#fbbf24" opacity="0.9" />
    </svg>
  );
};

export default EmptyTableIllustration;
