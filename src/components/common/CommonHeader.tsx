import React from 'react';
import { Search, Plus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface CommonHeaderProps {
  title: string;
  icon: LucideIcon;
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onAddClick: () => void;
  addButtonLabel: string;
}

const CommonHeader: React.FC<CommonHeaderProps> = ({
  title, icon: Icon, searchPlaceholder = "Search...", searchValue, onSearchChange, onAddClick, addButtonLabel
}) => {
  return (
    <header className="app-header d-flex align-items-center justify-content-between flex-shrink-0 sticky-top z-3">
      <div className="d-flex align-items-center gap-3">
        <div className="header-icon-box d-flex align-items-center justify-content-center">
          <Icon size={20} />
        </div>
        <div className="d-flex flex-column gap-1">
          <h2 className="header-title">
            <em>{title.split(' ')[0]}</em> {title.substring(title.indexOf(' ') + 1)}
          </h2>
        </div>
      </div>

      <div className="flex-grow-1 mx-5" style={{ maxWidth: '450px' }}>
        <div className="position-relative d-flex align-items-center">
          <Search size={16} className="position-absolute ms-3 text-muted" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="dark-input ps-5"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="d-flex align-items-center">
        <button onClick={onAddClick} className="btn-premium">
          <Plus size={18} /> {addButtonLabel}
        </button>
      </div>
    </header>
  );
};

export default CommonHeader;
