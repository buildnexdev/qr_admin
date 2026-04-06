import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="app-footer" style={{ padding: '8px 10px', textAlign: 'center', borderTop: '1px solid var(--border)', marginTop: 'auto', background: 'var(--card)' }}>
      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
        &copy; {new Date().getFullYear()} <span style={{ fontWeight: 600, color: 'var(--text)' }}>Nammaqr</span>. 
        Developed with <Heart size={14} className="heartbeat" fill="currentColor" /> by 
        <a href="https://buildnexdev.co.in" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>buildnexdev.co.in</a>
      </p>
    </footer>
  );
};

export default Footer;
