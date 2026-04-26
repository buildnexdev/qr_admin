import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Menu, QrCode, Bell, Sun, Moon, LogOut } from 'lucide-react';
import { logout } from '../../store/authSlice';
import type { RootState, AppDispatch } from '../../store';
import DefaultAside from './DefaultAside';

const DefaultLayout: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  // Default to open on desktop, closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 992);
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
      if (window.innerWidth < 992) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <div className={`admin-layout-root ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <header className="admin-top-header">
        <div className="header-brand-group">
          <button 
            className="nav-toggle-btn" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle Sidebar"
          >
            <Menu size={22} strokeWidth={2.5} />
          </button>
          <div className="header-logo" onClick={() => navigate('/admin')} style={{ cursor: 'pointer' }}>
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
        <DefaultAside isOpen={sidebarOpen} onClose={() => { if(window.innerWidth < 992) setSidebarOpen(false); }} />
        
        <main className="admin-content-area">
          {window.innerWidth < 992 && sidebarOpen && (
            <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
          )}
          <div className="page-scroll-container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DefaultLayout;
