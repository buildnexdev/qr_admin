import React, { useEffect, useLayoutEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ThemeProvider } from 'react-jss';
import AsideRoutes from '../../layout/Aside/AsideRoutes';
import HeaderRoutes from '../../layout/Header/HeaderRoutes';
import FooterRoutes from '../../layout/Footer/FooterRoutes';
import WrapperOverlay from '../../layout/Wrapper/WrapperOverlay';
import useDarkMode from '../../hooks/useDarkMode';
import COLORS from '../../common/data/enumColors';
import type { RootState } from '../../store';
const FacitShell: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { themeStatus, darkModeStatus } = useDarkMode();

  const theme = {
    theme: themeStatus,
    primary: COLORS.PRIMARY.code,
    secondary: COLORS.SECONDARY.code,
    success: COLORS.SUCCESS.code,
    info: COLORS.INFO.code,
    warning: COLORS.WARNING.code,
    danger: COLORS.DANGER.code,
    dark: COLORS.DARK.code,
    light: COLORS.LIGHT.code,
  };

  useEffect(() => {
    if (darkModeStatus) {
      document.documentElement.setAttribute('theme', 'dark');
      document.documentElement.setAttribute('data-bs-theme', 'dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('theme');
      document.documentElement.setAttribute('data-bs-theme', 'light');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [darkModeStatus]);

  useLayoutEffect(() => {
    if (process.env.REACT_APP_MODERN_DESGIN === 'true') {
      document.body.classList.add('modern-design');
    } else {
      document.body.classList.remove('modern-design');
    }
    return () => document.body.classList.remove('modern-design');
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <ThemeProvider theme={theme}>
      <div className="app">
        <AsideRoutes />
        <div className="wrapper">
          <HeaderRoutes />
          <main className="content">
            <Outlet />
          </main>
          <FooterRoutes />
        </div>
        <WrapperOverlay />
      </div>
    </ThemeProvider>
  );
};

export default FacitShell;
