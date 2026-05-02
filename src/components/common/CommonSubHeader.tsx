import React, { type ReactNode } from 'react';
import { type LucideIcon, Search, Plus } from 'lucide-react';
import './CommonSubHeader.scss';

export interface StatProp {
  label: string;
  value: string | number;
  color?: 'green' | 'red' | 'blue' | 'orange' | 'default';
}

export interface CommonSubHeaderProps {
  // Left side
  icon: LucideIcon;
  title: ReactNode;
  totalLabel?: string;
  totalCount?: number | string;
  
  // Center
  stats?: StatProp[];
  centerContent?: ReactNode;
  
  // Right side
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  
  addButtonText?: string;
  onAddClick?: () => void;
  AddIcon?: LucideIcon;
}

const CommonSubHeader: React.FC<CommonSubHeaderProps> = ({
  icon: Icon,
  title,
  totalLabel,
  totalCount,
  stats,
  centerContent,
  searchPlaceholder = 'Search...',
  searchValue,
  onSearchChange,
  addButtonText,
  onAddClick,
  AddIcon = Plus
}) => {
  return (
    <header className="common-sub-header">
      {/* LEFT */}
      <div className="csh-left">
        <div className="csh-icon-box"><Icon size={20}/></div>
        <div className="csh-title-area">
          <h1>{title}</h1>
          {(totalLabel !== undefined || totalCount !== undefined) && (
            <p className="csh-subtitle">
              {totalLabel} {totalCount !== undefined && <strong>{String(totalCount).padStart(2, '0')}</strong>}
            </p>
          )}
        </div>
      </div>

      {/* CENTER */}
      <div className="csh-center">
        {centerContent ? (
          centerContent
        ) : stats && stats.length > 0 ? (
          <div className="csh-stats">
            {stats.map((s, idx) => (
              <div key={idx} className={`csh-stat-item csh-stat-${s.color || 'default'}`}>
                <span className="stat-val">{s.value}</span>
                <span className="stat-lbl">{s.label}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* RIGHT */}
      <div className="csh-right">
        {onSearchChange && (
          <div className="csh-search-wrap">
            <Search size={16}/>
            <input 
              value={searchValue || ''} 
              onChange={e => onSearchChange(e.target.value)} 
              placeholder={searchPlaceholder}
            />
          </div>
        )}
        
        {onAddClick && addButtonText && (
          <button className="btn-csh-add" onClick={onAddClick}>
            <AddIcon size={18}/>
            <span>{addButtonText}</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default CommonSubHeader;
