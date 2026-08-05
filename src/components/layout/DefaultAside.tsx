import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ChevronLeft, ChevronRight, QrCode } from 'lucide-react';
import { ADMIN_MENU } from '../../const/menu';
import type { RootState } from '../../store';

type AsideProps = {
  isOpen?: boolean;
  isMini?: boolean;
  onClose?: () => void;
  onToggleMini?: () => void;
};

const DefaultAside: React.FC<AsideProps> = ({
  isOpen = true,
  isMini = false,
  onClose,
  onToggleMini,
}) => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <aside
      className={`sidebar-container ${isOpen ? 'is-open' : 'is-collapsed'}${isMini ? ' is-mini' : ''}`}
      aria-hidden={!isOpen}
    >
      <div className="aside-head">
        <div className="aside-brand">
          <div className="aside-brand-mark" onClick={() => navigate('/admin')} style={{ cursor: 'pointer' }}>
            <QrCode size={18} strokeWidth={2.5} />
          </div>
          <span className="aside-brand-text" onClick={() => navigate('/admin')} style={{ cursor: 'pointer' }}>
            Namma<span>Qr</span>
          </span>
          {onToggleMini && (
            <button
              type="button"
              className="aside-collapse-btn"
              onClick={onToggleMini}
              aria-label={isMini ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isMini ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          )}
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        <span className="nav-label">Menu</span>
        {(() => {
          let lastSection: string | undefined;
          const nodes: React.ReactNode[] = [];
          for (const item of ADMIN_MENU) {
            if (item.section && item.section !== lastSection) {
              lastSection = item.section;
              nodes.push(
                <span key={`nav-sec-${item.section}`} className="nav-label">
                  {item.section}
                </span>
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
                  `sidebar-nav-link${isActive ? ' sidebar-nav-link--active' : ''}`
                }
                onClick={() => onClose?.()}
                title={isMini ? item.name : undefined}
              >
                <Icon size={18} strokeWidth={2} />
                <span>{item.name}</span>
              </NavLink>
            );
          }
          return nodes;
        })()}
      </nav>

      <div className="aside-foot">
        <div
          className="aside-user"
          onClick={() => navigate('/admin/profile')}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/admin/profile')}
          role="button"
          tabIndex={0}
        >
          <div className="aside-user-avatar">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4"
              alt=""
            />
          </div>
          <div className="aside-user-info">
            <div className="aside-user-name">{user?.name || user?.username || 'Admin'}</div>
            <div className="aside-user-role">Restaurant Owner</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default DefaultAside;
