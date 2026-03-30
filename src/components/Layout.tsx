import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="admin-container">
      <Sidebar />
      <main className="content">
        <header>
          <h1>QR Management</h1>
          <div className="user-profile">
            Admin: {user?.username}
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
