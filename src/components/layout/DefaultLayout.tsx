import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Menu, X, Bell, Sun, Moon, LogOut, Search } from 'lucide-react';
import { logout } from '../../store/authSlice';
import type { RootState, AppDispatch } from '../../store';
import DefaultAside from './DefaultAside';
import Footer from './Footer';

const DESKTOP_BP = 1024;

const DefaultLayout: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const isSetupMode = !user?.role || Number(user.role) === 0 || !user?.branchid || Number(user.branchid) === 0;

  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= DESKTOP_BP);
  const [sidebarMini, setSidebarMini] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < DESKTOP_BP);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    document.body.classList.add('modern-design');
    return () => {
      document.body.classList.remove('modern-design');
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < DESKTOP_BP;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
      } else if (isSetupMode) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSetupMode]);

  useEffect(() => {
    if (isSetupMode) setSidebarOpen(false);
  }, [isSetupMode]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const layoutClasses = [
    'admin-layout-root',
    'modern-design',
    sidebarOpen && !isSetupMode ? 'sidebar-open' : 'sidebar-closed',
    sidebarMini && !isSetupMode ? 'sidebar-mini' : '',
    isSetupMode ? 'setup-mode' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={layoutClasses}>
      {!isSetupMode && (
        <DefaultAside
          isOpen={sidebarOpen}
          isMini={sidebarMini}
          onClose={() => {
            if (isMobile) setSidebarOpen(false);
          }}
          onToggleMini={() => setSidebarMini((m) => !m)}
        />
      )}

      <div className="admin-wrapper">
        <header className="admin-top-header">
          <div className="header-brand-group">
            {!isSetupMode && (
              <button
                type="button"
                className="nav-toggle-btn"
                onClick={() => setSidebarOpen((open) => !open)}
                aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={sidebarOpen}
              >
                {sidebarOpen ? <X size={22} strokeWidth={2.5} /> : <Menu size={22} strokeWidth={2.5} />}
              </button>
            )}
          </div>

          <div className="header-search-wrap">
            <Search size={16} className="header-search-icon" aria-hidden />
            <input
              type="search"
              className="header-search-input"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search"
            />
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="header-action-btn theme-toggle"
              onClick={toggleTheme}
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button type="button" className="header-action-btn notification-btn" title="Notifications">
              <Bell size={18} />
              <span className="notification-badge" />
            </button>

            <div className="header-divider" />

            <button
              type="button"
              className="header-profile-btn"
              onClick={() => navigate('/admin/profile')}
              title="My Profile"
            >
              <div className="profile-avatar">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4"
                  alt="Profile"
                />
              </div>
              <div className="profile-info">
                <span className="profile-name">{user?.name || user?.username || 'Admin'}</span>
                <span className="profile-role">Restaurant Owner</span>
              </div>
            </button>

            <button
              type="button"
              className="header-action-btn logout-btn"
              onClick={() => dispatch(logout())}
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <main className="admin-content-area">
          {sidebarOpen && !isSetupMode && isMobile && (
            <div
              className="sidebar-overlay"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
          )}
          <div className="page-scroll-container">
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default DefaultLayout;
