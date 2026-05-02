import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { QrCode, ChevronLeft, Crown, ChevronRight } from 'lucide-react';
import { ADMIN_MENU } from '../../const/menu';

type AsideProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

const DefaultAside: React.FC<AsideProps> = ({ isOpen = false, onClose }) => {
  const navigate = useNavigate();

  return (
    <aside
      className={`sidebar-container ${isOpen ? 'is-open' : 'is-collapsed'}`}
      aria-hidden={!isOpen}
    >
      <nav className="sidebar-nav" aria-label="Main navigation">
        <span className="nav-label">Menu</span>
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
              <Icon size={18} strokeWidth={2} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default DefaultAside;
