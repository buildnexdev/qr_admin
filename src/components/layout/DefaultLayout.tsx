import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import DefaultAside from './DefaultAside';
import Footer from './Footer';

const DefaultLayout: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="admin-container">
      <DefaultAside />
      <main className="content" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'transparent' }}>
        <div className="page-wrapper" style={{ flex: 1, overflowY: 'auto', background: 'transparent', display: 'flex', flexDirection: 'column' }}>
          <Outlet />
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default DefaultLayout;
