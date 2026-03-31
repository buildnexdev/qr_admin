import React from 'react';
import { useSelector } from 'react-redux';
import { User, Building2, Search } from 'lucide-react';
import type { RootState } from '../../store';

const Header: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <header className="app-header" style={{ 
      padding: '12px 32px', 
      background: 'white', 
      borderBottom: '1px solid #f1f5f9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '65px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 15px rgba(0,0,0,0.03)'
    }}>
      <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 'fit-content' }}>
          <div style={{ background: '#EEF2FF', color: '#4F46E5', width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(79, 70, 229, 0.1)' }}>
            <Building2 size={20} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {user?.role || 'Super ADMIN'}
            </h2>
            <div style={{ width: '1px', height: '22px', background: '#e2e8f0' }}></div>
            <span style={{ 
              fontSize: '0.65rem', 
              color: 'white', 
              fontWeight: 800, 
              padding: '4px 12px', 
              background: '#1e293b', 
              borderRadius: '30px', 
              letterSpacing: '1px', 
              whiteSpace: 'nowrap',
              textTransform: 'uppercase',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }}>
              System Active
            </span>
          </div>
        </div>
      </div>

      {/* Central Global Search (Generic) */}
      <div className="header-search" style={{ flex: 1, maxWidth: '450px', margin: '0 40px' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Global Search..."
            style={{ 
              width: '100%',
              background: '#f8fafc', 
              border: '1px solid #f1f5f9', 
              padding: '10px 14px 10px 42px', 
              fontSize: '0.85rem',
              borderRadius: '12px',
              fontWeight: 500,
              color: '#334155',
              transition: 'all 0.2s'
            }}
          />
        </div>
      </div>
      
      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ 
          background: '#f8fafc', 
          padding: '6px 14px', 
          borderRadius: '12px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          border: '1px solid #f1f5f9',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          transition: 'all 0.2s ease-in-out'
        }}>
          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b' }}>
            {user?.name || user?.username || 'Agal'}
          </span>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '50%', 
            background: 'white', 
            border: '1px solid #e2e8f0', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
          }}>
            <User size={18} color="#4F46E5" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
