import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Aside, { AsideBody, AsideFoot, AsideHead } from '../../../layout/Aside/Aside';
import ThemeContext from '../../../contexts/themeContext';
import { ADMIN_MENU } from '../../../const/menu';
import type { RootState } from '../../../store';
import NammaQrBrand from './NammaQrBrand';
import NammaQrFacitUser from './NammaQrFacitUser';

const NammaQrFacitAside: React.FC = () => {
  const { asideStatus, setAsideStatus } = useContext(ThemeContext);
  const isSetupMode = useSelector((state: RootState) => {
    const { user } = state.auth;
    return !user?.role || Number(user.role) === 0 || !user?.branchid || Number(user.branchid) === 0;
  });

  return (
    <Aside>
      <AsideHead>
        <NammaQrBrand asideStatus={asideStatus} setAsideStatus={setAsideStatus} />
      </AsideHead>
      <AsideBody>
        <nav aria-label="Main navigation">
          <div className="navigation">
            {!isSetupMode &&
              (() => {
                let lastSection: string | undefined;
                const nodes: React.ReactNode[] = [];
                for (const item of ADMIN_MENU) {
                  if (item.section && item.section !== lastSection) {
                    lastSection = item.section;
                    nodes.push(
                      <span key={`sec-${item.section}`} className="navigation-title d-block px-3 py-2 text-uppercase small opacity-50">
                        {item.section}
                      </span>,
                    );
                  } else if (!item.section) {
                    lastSection = undefined;
                  }
                  const Icon = item.icon;
                  nodes.push(
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/admin' || item.path === '/admin/workspace'}
                      className={({ isActive }) =>
                        `navigation-item text-decoration-none${isActive ? ' active' : ''}`
                      }
                    >
                      <span className="navigation-link">
                        <span className="navigation-link-info">
                          <Icon size={18} className="navigation-icon me-2" strokeWidth={2} />
                          <span className="navigation-text">{item.name}</span>
                        </span>
                      </span>
                    </NavLink>,
                  );
                }
                return nodes;
              })()}
          </div>
        </nav>
      </AsideBody>
      <AsideFoot>
        <NammaQrFacitUser />
      </AsideFoot>
    </Aside>
  );
};

export default NammaQrFacitAside;
