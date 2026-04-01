import React from 'react';
import { X } from 'lucide-react';

interface CommonOffcanvasProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
}

const CommonOffcanvas: React.FC<CommonOffcanvasProps> = ({ isOpen, onClose, title, children, footer, width = "450px" }) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="common-offcanvas-backdrop" onClick={onClose} />
      )}

      {/* Offcanvas Panel */}
      <div 
        className={`common-offcanvas-panel ${isOpen ? 'open' : 'closed'}`} 
        style={{ width: width }}
      >
        <div className="offcanvas-top-bar d-flex justify-content-between align-items-center">
          <h2 className="offcanvas-title">
            {title}
          </h2>
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
