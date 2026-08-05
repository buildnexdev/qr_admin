import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Header, { HeaderLeft, HeaderRight } from '../../../layout/Header/Header';
import Search from '../../../components/Search';
import Button from '../../../components/bootstrap/Button';
import ThemeContext from '../../../contexts/themeContext';
import useDarkMode from '../../../hooks/useDarkMode';
import { logout } from '../../../store/authSlice';
import type { RootState, AppDispatch } from '../../../store';

const NammaQrFacitHeader: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { setAsideStatus, asideStatus } = useContext(ThemeContext);
  const { darkModeStatus, setDarkModeStatus } = useDarkMode();

  return (
    <Header>
      <HeaderLeft>
        <Button
          aria-label="Toggle Aside"
          className="mobile-header-toggle d-lg-none me-2"
          size="lg"
          color={asideStatus ? 'primary' : darkModeStatus ? 'dark' : 'light'}
          isLight={asideStatus}
          icon={asideStatus ? 'FirstPage' : 'LastPage'}
          onClick={() => setAsideStatus(!asideStatus)}
        />
        <Search />
      </HeaderLeft>
      <HeaderRight>
        <div className="row g-2 align-items-center">
          <div className="col-auto">
            <Button
              icon={darkModeStatus ? 'DarkMode' : 'LightMode'}
              color={darkModeStatus ? 'dark' : 'light'}
              isLight={!darkModeStatus}
              size="lg"
              onClick={() => setDarkModeStatus(!darkModeStatus)}
              aria-label="Toggle dark mode"
            />
          </div>
          <div className="col-auto">
            <Button icon="Notifications" color={darkModeStatus ? 'dark' : 'light'} isLight={!darkModeStatus} size="lg" aria-label="Notifications" />
          </div>
          <div className="col-auto d-none d-md-block">
            <button
              type="button"
              className="btn btn-light rounded-pill d-flex align-items-center gap-2"
              onClick={() => navigate('/admin/profile')}
            >
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4"
                alt=""
                width={28}
                height={28}
                className="rounded-circle"
              />
              <span className="small fw-semibold">{user?.name || user?.username || 'Admin'}</span>
            </button>
          </div>
          <div className="col-auto">
            <Button
              icon="Logout"
              color="danger"
              isLight
              size="lg"
              onClick={() => dispatch(logout())}
              aria-label="Logout"
            />
          </div>
        </div>
      </HeaderRight>
    </Header>
  );
};

export default NammaQrFacitHeader;
