import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import DefaultAside from './DefaultAside';
import Header from './Header';
import Footer from './Footer';

const DefaultLayout: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="admin-container">
      <DefaultAside />
      <main className="content" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <Header />
        <div className="page-wrapper" style={{ flex: 1, padding: '16px', overflowY: 'auto', background: '#f8fafc' }}>
          <Outlet />
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default DefaultLayout;
