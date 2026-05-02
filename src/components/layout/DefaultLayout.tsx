import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Menu, X, QrCode, Bell, Sun, Moon, LogOut } from 'lucide-react';
import { logout } from '../../store/authSlice';
import type { RootState, AppDispatch } from '../../store';
import DefaultAside from './DefaultAside';
import Footer from './Footer';

const DefaultLayout: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  // Setup mode check
  const isSetupMode = !user?.role || Number(user.role) === 0 || !user?.branchid || Number(user.branchid) === 0;

  // Overlay drawer: closed by default so main area stays full width; toggle with header button
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    const handleResize = () => {
      if (isSetupMode) setSidebarOpen(false);
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

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className={`admin-layout-root ${sidebarOpen && !isSetupMode ? 'sidebar-open' : 'sidebar-closed'} ${isSetupMode ? 'setup-mode' : ''}`}>
      <style>{`
        .setup-mode .admin-content-area {
          margin-left: 0 !important;
          width: 100% !important;
          max-width: 100% !important;
          padding-left: 1rem !important;
        }
      `}</style>
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
          <div className="header-logo" onClick={() => navigate(isSetupMode ? '/admin/company' : '/admin')} style={{ cursor: 'pointer' }}>
            <QrCode size={26} strokeWidth={2.5} className="logo-icon" />
            <span className="logo-text">Namma<span>Qr</span></span>
          </div>
        </div>

        <div className="header-actions">
          <button className="header-action-btn theme-toggle" onClick={toggleTheme} title="Toggle Theme">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <button className="header-action-btn notification-btn" title="Notifications">
            <Bell size={20} />
            <span className="notification-badge" />
          </button>

          <div className="header-divider" />

          <button className="header-profile-btn" onClick={() => navigate('/admin/profile')} title="My Profile">
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

          <button className="header-action-btn logout-btn" onClick={() => dispatch(logout())} title="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <div className="admin-main-view">
        {!isSetupMode && (
          <DefaultAside isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}
        
        <main className="admin-content-area">
          {sidebarOpen && !isSetupMode && (
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
