import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LogOut, QrCode, User } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';
import type { RootState } from '../../store';
import { ADMIN_MENU } from '../../const/menu';

const DefaultAside: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <aside className="sidebar" style={{ width: '220px', padding: '24px 16px', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Link to="/" className="logo-link" style={{ flexShrink: 0, marginBottom: '24px' }}>
        <div className="logo">
          <QrCode size={28} strokeWidth={2.5} />
          <span>Nammaqr</span>
        </div>
      </Link>

      <nav style={{ flex: 1, overflowY: 'auto', paddingRight: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div className="nav-label" style={{ marginTop: '0' }}>Menu</div>
        {ADMIN_MENU.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => isActive ? 'active' : ''}
              style={{ padding: '10px 14px', fontSize: '0.9rem' }}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer" style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* User Card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <User size={18} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {user?.name || user?.username || 'Admin'}
            </span>
            <span style={{ color: '#a1a1aa', fontSize: '0.75rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {(user as any)?.phone || '+91 9894101918'}
            </span>
          </div>
        </div>

        <button onClick={() => dispatch(logout())} className="sidebar-btn logout" style={{ padding: '10px 16px', fontSize: '0.9rem', width: '100%', margin: 0 }}>
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default DefaultAside;
