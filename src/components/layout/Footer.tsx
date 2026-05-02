import type { FC } from 'react';
import { Heart } from 'lucide-react';

const Footer: FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="app-footer admin-default-footer" role="contentinfo">
      <span className="admin-default-footer__copy">
        © {year} <strong>NammaQr</strong>. All rights reserved.
      </span>
      <span className="admin-default-footer__credit">
        Developed with{' '}
        <Heart size={14} className="admin-default-footer__heart heartbeat" fill="currentColor" aria-hidden />{' '}
        by{' '}
        <a
          href="https://buildnexdev.co.in"
          target="_blank"
          rel="noopener noreferrer"
          className="admin-default-footer__link"
        >
          buildnexdev.co.in
        </a>
      </span>
    </footer>
  );
};

export default Footer;
