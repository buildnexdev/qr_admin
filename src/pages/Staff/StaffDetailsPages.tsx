import React, { useState } from 'react';
import { Users, Edit3, Save } from 'lucide-react';
import CommonHeader from '../../components/common/CommonHeader';
import CommonTable from '../../components/common/CommonTable';
import CommonOffcanvas from '../../components/common/CommonOffcanvas';
import { triggerToast } from '../../components/common/CommonAlert';
import AddStaffDetails from './addStaffDetails/addStaffDetails';
import './staffStyle.scss';

const StaffDetailsPages: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [staffData, setStaffData] = useState([
    { id: 39, name: 'Auto Loan Staff', phone: '7898989983', email: 'als@gmail.com', role: 'Field Officer (level3)', status: true, image: 'https://i.pravatar.cc/150?u=39' },
    { id: 38, name: 'VISHNUTHEBUSINESSANALYST', phone: '7879797978', email: 'vishnustaff@gmail.com', role: 'Coll Manager (level3)', status: true, image: 'https://i.pravatar.cc/150?u=38' },
    { id: 37, name: 'RAJA', phone: '9877899000', email: 'tecnodinesh@Gmail.com', role: 'Coll Manager (level3)', status: true, image: 'https://i.pravatar.cc/150?u=37' },
    { id: 36, name: 'TransferBranchStaff', phone: '9898987987', email: 'adwadad@gmail.com', role: 'collection (level3)', status: true, image: 'https://i.pravatar.cc/150?u=36' },
    { id: 35, name: 'Do not touch this subAdmin', phone: '5683038272', email: 'dont@gmail.com', role: 'Sub Admin (level4)', status: true, image: 'https://i.pravatar.cc/150?u=35' },
    { id: 34, name: 'Support Staff', phone: '5683038272', email: 'dont@gmail.com', role: 'Sub Admin (level4)', status: true, image: 'https://i.pravatar.cc/150?u=35' },
    { id: 34, name: 'Support Staff', phone: '5683038272', email: 'dont@gmail.com', role: 'Sub Admin (level4)', status: true, image: 'https://i.pravatar.cc/150?u=35' },
    { id: 34, name: 'Support Staff', phone: '5683038272', email: 'dont@gmail.com', role: 'Sub Admin (level4)', status: true, image: 'https://i.pravatar.cc/150?u=35' },
    { id: 34, name: 'Support Staff', phone: '5683038272', email: 'dont@gmail.com', role: 'Sub Admin (level4)', status: true, image: 'https://i.pravatar.cc/150?u=35' },
  ]);

  const handleOpenOffcanvas = (staff?: any) => {
    setEditingStaff(staff || null);
    setIsOffcanvasOpen(true);
  };

  const handleSaveStaff = (data: any) => {
    if (editingStaff) {
      setStaffData(prev => prev.map(s => s.id === editingStaff.id ? { ...s, ...data } : s));
      triggerToast('Staff updated successfully', 'success');
    } else {
      const newStaff = { ...data, id: Date.now(), image: `https://i.pravatar.cc/150?u=${Date.now()}` };
      setStaffData(prev => [newStaff, ...prev]);
      triggerToast('Staff added successfully', 'success');
    }
    setIsOffcanvasOpen(false);
  };

  // Filter Data
  const filteredData = staffData.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.phone.includes(searchTerm) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Table Columns Setup
  const columns = [
    { key: 'idx', header: 'S.No', render: (_: any, idx: number) => <span className="text-muted fw-bold">{idx + 1}</span> },
    {
      key: 'name', header: 'Name',
      render: (row: any) => (
        <div className="d-flex align-items-center gap-3 fw-bold">
          <img src={row.image} alt={row.name} className="staff-profile-pill" />
          {row.name}
        </div>
      )
    },
    { key: 'phone', header: 'Phone Number', render: (row: any) => <span className="text-white-50">{row.phone}</span> },
    {
      key: 'role', header: 'Role',
      render: (row: any) => (
        <span className="staff-role-badge">
          {row.role}
        </span>
      )
    },
    {
      key: 'edit', header: 'Edit', align: 'center' as const,
      render: (row: any) => (
        <button onClick={() => handleOpenOffcanvas(row)} className="staff-action-edit d-flex align-items-center justify-content-center mx-auto">
          <Edit3 size={16} />
        </button>
      )
    },
    {
      key: 'publish', header: 'Publish', align: 'center' as const,
      render: (row: any) => (
        <label className="toggle-switch mx-auto d-block">
          <input type="checkbox" defaultChecked={row.status} />
          <span className="toggle-switch-slider"></span>
        </label>
      )
    }
  ];

  return (
    <div className="staff-page-container">
      {/* 1. Common Header */}
      <CommonHeader
        title="Staff Management"
        icon={Users}
        searchPlaceholder="Search staff by name, phone or email..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onAddClick={() => handleOpenOffcanvas()}
        addButtonLabel="Add New Staff"
      />

      {/* 2. Common Table */}
      <div className="flex-grow-1 d-flex flex-column overflow-auto">
        <CommonTable 
          columns={columns} 
          data={paginatedData} 
          emptyMessage="No staff found matching your search."
          pagination={{
            currentPage,
            totalPages,
            totalItems,
            itemsPerPage,
            onPageChange: setCurrentPage
          }}
        />
      </div>

      {/* 3. Common Offcanvas specifically rendering addStaffDetails form */}
      <CommonOffcanvas
        isOpen={isOffcanvasOpen}
        onClose={() => setIsOffcanvasOpen(false)}
        title={editingStaff ? "Edit Staff Details" : "Add New Staff"}
        footer={
          <>
            <button
              onClick={() => setIsOffcanvasOpen(false)}
              className="btn-cancel"
            >
              Cancel
            </button>
            <button type="submit" form="staff-form" className="btn-premium btn-save">
              <Save size={18} /> {editingStaff ? 'Save Changes' : 'Add Staff'}
            </button>
          </>
        }
      >
        <AddStaffDetails
          initialData={editingStaff}
          onSave={handleSaveStaff}
          onCancel={() => setIsOffcanvasOpen(false)}
        />
      </CommonOffcanvas>

    </div>
  );
};

export default StaffDetailsPages;
