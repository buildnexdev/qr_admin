import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Staff: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const staffData = [
    { id: 39, name: 'Auto Loan Staff', phone: '7898989983', email: 'als@gmail.com', role: 'Field Officer (level3)', status: true, image: 'https://i.pravatar.cc/150?u=39' },
    { id: 38, name: 'VISHNUTHEBUSINESSANALYST', phone: '7879797978', email: 'vishnustaff@gmail.com', role: 'Coll Manager (level3)', status: true, image: 'https://i.pravatar.cc/150?u=38' },
    { id: 37, name: 'RAJA', phone: '9877899000', email: 'tecnodinesh@Gmail.com', role: 'Coll Manager (level3)', status: true, image: 'https://i.pravatar.cc/150?u=37' },
    { id: 36, name: 'TransferBranchStaff', phone: '9898987987', email: 'adwadad@gmail.com', role: 'collection (level3)', status: true, image: 'https://i.pravatar.cc/150?u=36' },
    { id: 35, name: 'Do not touch this subAdmin', phone: '5683038272', email: 'dont@gmail.com', role: 'Sub Admin (level4)', status: true, image: 'https://i.pravatar.cc/150?u=35' },
  ];

  return (
    <div className="page-container" style={{ 
      animation: 'modalContentIn 0.5s ease-out', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '24px',
      padding: '24px',
      height: '100%',
      overflow: 'hidden'
    }}>
      {/* HEADER SECTION - Left: Staff + Search, Right: Add Button */}
      <div className="premium-table-container" style={{ padding: '20px 24px', marginTop: 0, flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
          
          {/* Left Side: Title, Counter & Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', minWidth: 'fit-content' }}>
              <div style={{ background: '#EEF2FF', color: '#4F46E5', width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(79, 70, 229, 0.12)' }}>
                <Users size={24} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#1e293b' }}>Staff Management</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Operations Control</span>
                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#cbd5e1' }}></div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4F46E5' }}>{staffData.length} Total Members</span>
                </div>
              </div>
            </div>

            {/* Local Search Bar */}
            <div className="search-wrapper" style={{ flex: 1, maxWidth: '400px' }}>
              <Search size={18} />
              <input
                type="text"
                placeholder="Search staff by name, phone or email..."
                className="search-input"
                style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 14px 12px 42px', width: '100%' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Right Side: Add Button */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button className="btn-primary" style={{ padding: '12px 24px', borderRadius: '12px', fontSize: '0.9rem', boxShadow: '0 8px 20px rgba(239, 68, 68, 0.15)' }}>
              <Plus size={20} /> Add New Staff
            </button>
          </div>

        </div>
      </div>

      {/* BODY SECTION (Scrollable Table) */}
      <div className="premium-table-container" style={{ flex: 1, overflowY: 'auto', marginTop: 0 }}>
        <table className="premium-table" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr className='text-nowrap'>
              <th style={{ paddingLeft: '32px' }}>Image</th>
              <th>Name</th>
              <th>Phone Number</th>
              <th>Email ID</th>
              <th>Role</th>
              <th style={{ textAlign: 'center' }}>Edit</th>
              <th style={{ textAlign: 'center' }}>Remove</th>
              <th style={{ textAlign: 'center' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {staffData.map((staff) => (
              <tr key={staff.id}>
                <td style={{ paddingLeft: '32px' }}><img src={staff.image} alt={staff.name} className="staff-avatar" /></td>
                <td style={{ fontWeight: 600 }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.8rem', marginRight: '4px' }}>{staff.id}</span>
                  {staff.name}
                </td>
                <td>{staff.phone}</td>
                <td>{staff.email}</td>
                <td><span style={{ fontSize: '0.85rem', color: '#64748b' }}>{staff.role}</span></td>
                <td style={{ textAlign: 'center' }}><button className="action-btn edit" style={{ background: '#EEF2FF', color: '#4F46E5' }}><Edit3 size={16} /></button></td>
                <td style={{ textAlign: 'center' }}><button className="action-btn remove" style={{ background: '#FFF1F2', color: '#E11D48' }}><Trash2 size={16} /></button></td>
                <td style={{ textAlign: 'center' }}>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked={staff.status} />
                    <span className="toggle-slider"></span>
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* PAGINATION */}
        <div className="pagination" style={{ padding: '20px 32px' }}>
          <div className="page-info" style={{ fontWeight: 600, color: '#64748b' }}>Showing 1 to 5 of {staffData.length} entries</div>
          <div className="page-controls">
            <button className="page-btn"><ChevronLeft size={18} /></button>
            <button className="page-btn active">1</button>
            <button className="page-btn"><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Staff;
