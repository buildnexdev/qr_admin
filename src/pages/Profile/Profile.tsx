import React from 'react';
import { useSelector } from 'react-redux';
import { User as UserIcon } from 'lucide-react';
import type { RootState } from '../../store';
import CommonHeader from '../../components/common/CommonHeader';

const Profile: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="d-flex flex-column h-100" style={{ background: 'var(--bg)', color: 'var(--cream)' }}>
      <CommonHeader 
        title="User Profile" 
        icon={UserIcon} 
        searchValue=""
        onSearchChange={() => {}}
      />
      <div className="p-4" style={{ overflowY: 'auto' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ background: 'var(--card)', padding: '30px', borderRadius: '16px', border: '1px solid var(--border)', textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '36px' }}>
              🏢
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>Registered Company</p>
            <h4 style={{ margin: '8px 0 8px', color: 'var(--cream)', fontSize: '26px', fontFamily: "'Playfair Display', serif" }}>{user?.company_name || 'Nammaqr Workspace'}</h4>
            <span style={{ display: 'inline-block', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--amber)', padding: '6px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 600 }}>
              Company ID: #{user?.companyid}
            </span>
          </div>
          
          <div style={{ background: 'var(--card)', padding: '30px', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <p style={{ margin: '0 0 24px', fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600, borderBottom: '1px solid var(--border-h)', paddingBottom: '12px' }}>Login Information</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Full Name</span>
                <p style={{ margin: '4px 0 0', color: 'var(--cream)', fontWeight: 600, fontSize: '16px' }}>{user?.name || user?.username}</p>
              </div>
              <div>
                <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Username / Login ID</span>
                <p style={{ margin: '4px 0 0', color: 'var(--cream)', fontWeight: 600, fontSize: '16px' }}>{user?.username || 'admin_user'}</p>
              </div>
              <div>
                <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Role</span>
                <p style={{ margin: '4px 0 0', color: 'var(--cream)', fontWeight: 600, fontSize: '16px', display: 'inline-flex', alignItems: 'center', padding: '4px 10px', background: 'var(--surface)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  {user?.role || 'System Admin'}
                </p>
              </div>
              <div>
                <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Contact Number</span>
                <p style={{ margin: '4px 0 0', color: 'var(--cream)', fontWeight: 600, fontSize: '16px' }}>{(user as any)?.phone || '9952954413'}</p>
              </div>
              <div>
                <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Unique User ID</span>
                <p style={{ margin: '4px 0 0', color: 'var(--cream)', fontWeight: 600, fontSize: '16px' }}>#{user?.userid}</p>
              </div>
              <div>
                <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Account Status</span>
                <p style={{ margin: '4px 0 0', color: '#10b981', fontWeight: 700, fontSize: '16px' }}>Active</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
