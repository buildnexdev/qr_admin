import React from 'react';
import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import { ADMIN_MENU } from '../../const/menu';

type AsideProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

const DefaultAside: React.FC<AsideProps> = ({ isOpen = false, onClose }) => {

  return (
    <aside
      className={`sidebar-container ${isOpen ? 'is-open' : 'is-collapsed'}`}
      aria-hidden={!isOpen}
    >
      <div className="sidebar-drawer-header">
        <span className="sidebar-drawer-title">Menu</span>
        <button
          type="button"
          className="sidebar-close-btn"
          onClick={() => onClose?.()}
          aria-label="Close menu"
        >
          <X size={20} strokeWidth={2.5} />
        </button>
      </div>
      <nav className="sidebar-nav">
        {ADMIN_MENU.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `sidebar-nav-link${isActive ? ' sidebar-nav-link--active' : ''}`
              }
              onClick={() => onClose?.()}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default DefaultAside;
