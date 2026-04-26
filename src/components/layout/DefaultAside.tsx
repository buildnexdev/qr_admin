import React from 'react';
import { NavLink } from 'react-router-dom';
import { ADMIN_MENU } from '../../const/menu';

type AsideProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

const DefaultAside: React.FC<AsideProps> = ({ isOpen = false, onClose }) => {

  return (
    <aside
      className={`sidebar-container ${isOpen ? 'is-open' : 'is-collapsed'}`}
    >
      <nav className="sidebar-nav">
        <div className="nav-label" style={{ marginTop: '0' }}>Menu</div>
        {ADMIN_MENU.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) => isActive ? 'active' : ''}
              style={{ padding: '10px 14px', fontSize: '0.9rem' }}
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
