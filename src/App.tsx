import { useRoutes, Navigate, type RouteObject } from 'react-router-dom';
import React, { useEffect } from 'react';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Landing from './pages/Landing/Landing';
import { contentRouters } from './router/contentRouters';
import './App.css';
import './styles/common.scss';

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const routes: RouteObject[] = [
    { path: '/', element: <Landing /> },
    { path: '/login', element: <Login /> },
    { path: '/register', element: <Register /> },
    ...contentRouters,
    { path: '*', element: <Navigate to="/" replace /> }
  ];

  const element = useRoutes(routes);

  return <>{element}</>;
}

export default App;
