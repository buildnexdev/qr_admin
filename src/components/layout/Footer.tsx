import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="app-footer" style={{ padding: '6px', textAlign: 'center', borderTop: '1px solid rgba(0,0,0,0.05)', marginTop: 'auto', background: 'white' }}>
      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
        &copy; {new Date().getFullYear()} <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>Nammaqr</span>. 
        Developed with <Heart size={14} className="heartbeat" fill="currentColor" /> by 
        <a href="https://buildnexdev.co.in" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>buildnexdev.co.in</a>
      </p>
    </footer>
  );
};

export default Footer;
