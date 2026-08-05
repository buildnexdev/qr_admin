import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useWindowSize } from 'react-use';
import ThemeContext from '../../../contexts/themeContext';
import useDarkMode from '../../../hooks/useDarkMode';
import { logout } from '../../../store/authSlice';
import type { RootState, AppDispatch } from '../../../store';

const NammaQrFacitUser: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { width } = useWindowSize();
  const { setAsideStatus } = useContext(ThemeContext);
  const { darkModeStatus, setDarkModeStatus } = useDarkMode();
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div
      className="user"
      role="button"
      tabIndex={0}
      onClick={() => navigate('/admin/profile')}
      onKeyDown={(e) => e.key === 'Enter' && navigate('/admin/profile')}
    >
      <div className="user-avatar">
        <img
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4"
          alt="User avatar"
          width={48}
          height={48}
        />
      </div>
      <div className="user-info">
        <div className="user-name">{user?.name || user?.username || 'Admin'}</div>
        <div className="user-sub-title">Restaurant Owner</div>
      </div>
      <div className="d-flex gap-1 ms-auto">
        <button
          type="button"
          className="btn btn-sm btn-light"
          title="Toggle theme"
          onClick={(e) => {
            e.stopPropagation();
            setDarkModeStatus(!darkModeStatus);
          }}
        >
          {darkModeStatus ? '☀' : '☾'}
        </button>
        <button
          type="button"
          className="btn btn-sm btn-light"
          title="Logout"
          onClick={(e) => {
            e.stopPropagation();
            dispatch(logout());
            if (width < Number(process.env.REACT_APP_MOBILE_BREAKPOINT_SIZE)) {
              setAsideStatus(false);
            }
            navigate('/login');
          }}
        >
          ⎋
        </button>
      </div>
    </div>
  );
};

export default NammaQrFacitUser;
