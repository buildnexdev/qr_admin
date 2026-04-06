import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Menu } from 'lucide-react';
import type { RootState } from '../../store';
import DefaultAside from './DefaultAside';
import Footer from './Footer';

const DefaultLayout: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 992px)');
    const closeOnWide = () => {
      if (mq.matches) setSidebarOpen(false);
    };
    mq.addEventListener('change', closeOnWide);
    return () => mq.removeEventListener('change', closeOnWide);
  }, []);

  useEffect(() => {
    if (!sidebarOpen) return;
    document.body.classList.add('admin-nav-open');
    return () => document.body.classList.remove('admin-nav-open');
  }, [sidebarOpen]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="admin-container">
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          role="presentation"
          aria-hidden
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <DefaultAside isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="content" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'transparent' }}>
        <button
          type="button"
          className="mobile-nav-toggle"
          aria-label="Open navigation menu"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={22} strokeWidth={2} />
        </button>
        <div className="page-wrapper" style={{ flex: 1, overflowY: 'auto', background: 'transparent', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Outlet />
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default DefaultLayout;
