import React from 'react';
import { Search, Plus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface CommonHeaderProps {
  title: string;
  icon: LucideIcon;
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onAddClick?: () => void;
  addButtonLabel?: string;
}

const CommonHeader: React.FC<CommonHeaderProps> = ({
  title,
  icon: Icon,
  searchPlaceholder = 'Search...',
  searchValue,
  onSearchChange,
  onAddClick,
  addButtonLabel,
}) => {
  const restTitle = title.includes(' ') ? title.substring(title.indexOf(' ') + 1) : '';

  return (
    <header className="app-header app-header--responsive flex-shrink-0 sticky-top z-3">
      <div className="app-header__brand d-flex align-items-center gap-3 min-w-0">
        <div className="header-icon-box d-flex align-items-center justify-content-center flex-shrink-0">
          <Icon size={20} />
        </div>
        <div className="d-flex flex-column gap-1 min-w-0">
          <h2 className="header-title text-truncate">
            <em>{title.split(' ')[0]}</em>
            {restTitle ? <span className="header-title-rest"> {restTitle}</span> : null}
          </h2>
        </div>
      </div>

      <div className="app-header__search">
        <div className="position-relative d-flex align-items-center">
          <Search size={16} className="position-absolute ms-3 app-header__search-icon" aria-hidden />
          <input
            type="search"
            placeholder={searchPlaceholder}
            className="dark-input ps-5 w-100"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            enterKeyHint="search"
          />
        </div>
      </div>

      <div className="app-header__actions">
        {onAddClick && addButtonLabel ? (
          <button type="button" onClick={onAddClick} className="btn-premium">
            <Plus size={18} /> <span className="app-header__add-label">{addButtonLabel}</span>
          </button>
        ) : null}
      </div>
    </header>
  );
};

export default CommonHeader;
