import React, { useLayoutEffect, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const EXIT_FALLBACK_MS = 500;

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const [shouldRender, setShouldRender] = useState(isOpen);

  useLayoutEffect(() => {
    if (isOpen) setShouldRender(true);
  }, [isOpen]);

  const handleOverlayAnimationEnd = useCallback(
    (e: React.AnimationEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget) return;
      if (!isOpen) setShouldRender(false);
    },
    [isOpen]
  );

  useEffect(() => {
    if (!isOpen && shouldRender) {
      const id = window.setTimeout(() => setShouldRender(false), EXIT_FALLBACK_MS);
      return () => window.clearTimeout(id);
    }
  }, [isOpen, shouldRender]);

  useEffect(() => {
    if (!isOpen || !shouldRender) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, shouldRender, onClose]);

  if (!shouldRender || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className={`modal-overlay ${!isOpen ? 'exit' : ''}`}
      onAnimationEnd={handleOverlayAnimationEnd}
      onClick={onClose}
      role="presentation"
    >
      <div
        className="premium-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="premium-modal-title"
      >
        <div className="premium-modal-head">
          <h2 id="premium-modal-title">{title}</h2>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="premium-modal-inner">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
