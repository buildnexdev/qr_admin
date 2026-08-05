import React from 'react';
import classNames from 'classnames';
import useDarkMode from '../../../hooks/useDarkMode';
import Footer from '../../../layout/Footer/Footer';

const NammaQrFacitFooter: React.FC = () => {
  const { darkModeStatus } = useDarkMode();
  const year = new Date().getFullYear();

  return (
    <Footer>
      <div className="container-fluid">
        <div className="row align-items-center">
          <div className="col">
            <span className="fw-light">
              Copyright © {year} <strong>NammaQr</strong> — Facit Modern UI
            </span>
          </div>
          <div className="col-auto">
            <a
              href="https://facit-modern.omtanke.studio/"
              target="_blank"
              rel="noopener noreferrer"
              className={classNames('text-decoration-none', {
                'link-dark': !darkModeStatus,
                'link-light': darkModeStatus,
              })}
            >
              <small className="fw-bold">Facit Theme</small>
            </a>
          </div>
        </div>
      </div>
    </Footer>
  );
};

export default NammaQrFacitFooter;
