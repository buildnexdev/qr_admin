import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { LogOut, QrCode, User, BadgeCheck, Sun, Moon } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';
import type { RootState } from '../../store';
import { ADMIN_MENU } from '../../const/menu';

type AsideProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

const DefaultAside: React.FC<AsideProps> = ({ isOpen = false, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <>
      <style>{`
        .profile-menu-btn {
          background: transparent;
          border: none;
          color: #f8fafc;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px 14px;
          cursor: pointer;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 600;
          transition: background 0.2s;
          width: 100%;
          text-align: left;
        }
        .profile-menu-btn:hover {
          background: rgba(161, 161, 170, 0.15);
        }
        .user-card-menu {
          background: var(--surface, #18181b);
          border-radius: 12px;
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .user-card-menu:hover {
          background: var(--card-hov, #27272a);
        }
        .menu-wrapper {
          background: var(--card, #09090b);
          border-radius: 16px;
          border: 1px solid var(--border, rgba(255,255,255,0.06));
          padding: 8px;
          display: flex;
          flex-direction: column;
          margin-top: auto;
          flex-shrink: 0;
        }
      `}</style>
    <aside
      className={`sidebar${isOpen ? ' sidebar--open' : ''}`}
      style={{ width: '220px', padding: '24px 16px', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'var(--bg, #0b0f19)' }}
    >
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
              onClick={() => onClose?.()}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="menu-wrapper">
        {/* User Card */}
        <div className="user-card-menu" onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}>
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4" 
            alt="Lavanya" 
            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} 
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: theme === 'dark' ? '#f8fafc' : '#0f172a', fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.name || user?.username || 'Lavanya'}
              </span>
              <BadgeCheck size={16} fill="#3b82f6" color={theme === 'dark' ? "#18181b" : "#fff"} />
            </div>
            <span style={{ color: '#71717a', fontSize: '0.75rem', fontWeight: 500, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {(user as any)?.phone || '9952954413'}
            </span>
          </div>
        </div>

        {isProfileMenuOpen && (
          <div style={{ animation: 'fadeDown 0.2s ease-out' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '12px' }}>
              <button
                className="profile-menu-btn"
                onClick={() => {
                  navigate('/profile');
                  setIsProfileMenuOpen(false);
                  onClose?.();
                }}
              >
                <User size={20} color={theme === 'dark' ? "#e4e4e7" : "#0f172a"} strokeWidth={1.8} />
                <span style={{ letterSpacing: '0.3px', color: theme === 'dark' ? '#f8fafc' : '#0f172a' }}>Profile</span>
              </button>
              <button className="profile-menu-btn" onClick={toggleTheme}>
                {theme === 'dark' ? (
                  <>
                    <Sun size={20} color="#facc15" strokeWidth={1.8} />
                    <span style={{ letterSpacing: '0.3px' }}>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon size={20} color="#6366f1" strokeWidth={1.8} />
                    <span style={{ letterSpacing: '0.3px', color: '#0f172a' }}>Dark Mode</span>
                  </>
                )}
              </button>
            </div>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '8px 0' }}></div>

            <button onClick={() => dispatch(logout())} className="profile-menu-btn">
              <LogOut size={20} color={theme === 'dark' ? "#e4e4e7" : "#0f172a"} strokeWidth={1.8} />
              <span style={{ letterSpacing: '0.3px', color: theme === 'dark' ? '#f8fafc' : '#0f172a' }}>Logout</span>
            </button>
          </div>
        )}
      </div>
    </aside>
    </>
  );
};

export default DefaultAside;
