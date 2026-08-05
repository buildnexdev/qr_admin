import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { QrCode } from 'lucide-react';
import Icon from '../../../components/icon/Icon';
import ThemeContext from '../../../contexts/themeContext';

type BrandProps = {
  asideStatus: boolean;
  setAsideStatus: (value: boolean | ((prev: boolean) => boolean)) => void;
};

const NammaQrBrand: React.FC<BrandProps> = ({ asideStatus, setAsideStatus }) => {
  const { setAsideStatus: setAside } = useContext(ThemeContext);

  return (
    <div className="brand">
      <div className="brand-logo">
        <h1 className="brand-title">
          <Link to="/admin" aria-label="NammaQr Home" className="d-flex align-items-center gap-2 text-decoration-none">
            <span
              className="d-inline-flex align-items-center justify-content-center rounded-3"
              style={{
                width: 36,
                height: 36,
                background: 'linear-gradient(135deg, #2d5cfe, #5b7cff)',
              }}
            >
              <QrCode size={20} color="#fff" strokeWidth={2.5} />
            </span>
            <span className="text-white fw-bold" style={{ fontSize: '1.05rem', letterSpacing: '-0.02em' }}>
              Namma<span style={{ color: '#5b7cff' }}>Qr</span>
            </span>
          </Link>
        </h1>
      </div>
      <button
        type="button"
        className="btn brand-aside-toggle"
        aria-label="Toggle Aside"
        onClick={() => {
          setAsideStatus(!asideStatus);
          setAside(!asideStatus);
        }}
      >
        <Icon icon="FirstPage" className="brand-aside-toggle-close" />
        <Icon icon="LastPage" className="brand-aside-toggle-open" />
      </button>
    </div>
  );
};

export default NammaQrBrand;
