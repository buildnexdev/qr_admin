import React from 'react';
import { X } from 'lucide-react';

interface CommonOffcanvasProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  /** e.g. status badge next to the title */
  titleExtra?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
  /** Extra class on the slide-out panel (e.g. theme variant). */
  panelClassName?: string;
  /** Optional class on the backdrop (e.g. softer tint). */
  backdropClassName?: string;
}

const CommonOffcanvas: React.FC<CommonOffcanvasProps> = ({
  isOpen,
  onClose,
  title,
  titleExtra,
  children,
  footer,
  width = '450px',
  panelClassName,
  backdropClassName,
}) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className={`common-offcanvas-backdrop${backdropClassName ? ` ${backdropClassName}` : ''}`}
          onClick={onClose}
        />
      )}

      {/* Offcanvas Panel */}
      <div
        className={`common-offcanvas-panel ${panelClassName ?? ''} ${isOpen ? 'open' : 'closed'}`}
        style={{ width: width }}
      >
        <div className="offcanvas-top-bar d-flex justify-content-between align-items-center gap-2">
          <div className="offcanvas-title-group d-flex align-items-center gap-2 flex-wrap min-w-0">
            <h2 className="offcanvas-title mb-0">{title}</h2>
            {titleExtra}
          </div>
          <button onClick={onClose} className="offcanvas-close-btn d-flex align-items-center justify-content-center">
            <X size={20} />
          </button>
        </div>

        <div className="offcanvas-content d-flex flex-column gap-4">
          {children}
        </div>

        {footer && (
          <div className="offcanvas-bottom-bar d-flex gap-3">
            {footer}
          </div>
        )}
      </div>
    </>
  );
};

export default CommonOffcanvas;
