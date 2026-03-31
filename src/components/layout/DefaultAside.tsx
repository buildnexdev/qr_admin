import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LogOut, QrCode } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import { ADMIN_MENU } from '../../const/menu';

const DefaultAside: React.FC = () => {
  const dispatch = useDispatch();

  return (
    <aside className="sidebar">
      <Link to="/" className="logo-link">
        <div className="logo">
          <QrCode size={28} strokeWidth={2.5} />
          <span>Nammaqr</span>
        </div>
      </Link>
      
      <nav>
        <div className="nav-label">Navigation</div>
        {ADMIN_MENU.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink 
              key={item.path}
              to={item.path} 
              end={item.path === '/'}
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              <Icon size={20} /> 
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button onClick={() => dispatch(logout())} className="sidebar-btn logout">
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default DefaultAside;
