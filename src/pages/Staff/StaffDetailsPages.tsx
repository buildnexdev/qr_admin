import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { Users, Edit3, Save, Trash2 } from 'lucide-react';
import type { RootState } from '../../store';
import { setStaff, setStaffLoading, type StaffMember } from '../../store/staffSlice';
import { setBranches, setLoading as setBranchesLoading } from '../../store/branchSlice';
import CommonHeader from '../../components/common/CommonHeader';
import CommonTable from '../../components/common/CommonTable';
import CommonOffcanvas from '../../components/common/CommonOffcanvas';
import AddStaffDetails from './addStaffDetails/addStaffDetails';
import { triggerToast } from '../../components/common/CommonAlert';
import { getApiErrorMessage } from '../../utils/apiError';
import './staffStyle.scss';

const API_BASE_URL = 'http://localhost:5000/api';

const StaffDetailsPages: React.FC = () => {
  const dispatch = useDispatch();
  const { staff: staffData, loading } = useSelector((state: RootState) => state.staff);
  const { branches } = useSelector((state: RootState) => state.branches);

  const [searchTerm, setSearchTerm] = useState('');
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [saving, setSaving] = useState(false);

  const itemsPerPage = 5;

  const branchOptions = useMemo(
    () => (branches.length > 0 ? branches.map((b) => b.name) : ['Main Branch']),
    [branches]
  );

  const fetchStaff = async () => {
    dispatch(setStaffLoading(true));
    try {
      const res = await axios.get<StaffMember[]>(`${API_BASE_URL}/staff`);
      dispatch(setStaff(res.data));
    } catch (err) {
      console.error(err);
      triggerToast('Could not load staff', 'error', getApiErrorMessage(err, 'Failed to load staff'));
    }
    dispatch(setStaffLoading(false));
  };

  const fetchBranchesIfNeeded = async () => {
    if (branches.length > 0) return;
    dispatch(setBranchesLoading(true));
    try {
      const res = await axios.get(`${API_BASE_URL}/branches`);
      dispatch(setBranches(res.data));
    } catch {
      /* optional for dropdown */
    }
    dispatch(setBranchesLoading(false));
  };

  useEffect(() => {
    fetchStaff();
    fetchBranchesIfNeeded();
  }, []);

  const handleOpenOffcanvas = (staff?: StaffMember) => {
    setEditingStaff(staff || null);
    setIsOffcanvasOpen(true);
  };

  const handleSaveStaff = async (data: Record<string, unknown>) => {
    setSaving(true);
    const wasEdit = !!editingStaff;
    try {
      if (editingStaff) {
        await axios.put(`${API_BASE_URL}/staff/${editingStaff.id}`, data);
      } else {
        await axios.post(`${API_BASE_URL}/staff`, data);
      }
      setIsOffcanvasOpen(false);
      await fetchStaff();
      if (wasEdit) {
        triggerToast('Staff updated', 'success', 'Changes saved successfully.');
      } else {
        triggerToast('Staff added', 'success', 'New staff member was created.');
      }
    } catch (err) {
      triggerToast('Save failed', 'error', getApiErrorMessage(err, 'Failed to save staff'));
    }
    setSaving(false);
  };

  const handleDelete = async (row: StaffMember) => {
    if (!window.confirm(`Remove staff member "${row.name}"?`)) return;
    try {
      await axios.delete(`${API_BASE_URL}/staff/${row.id}`);
      await fetchStaff();
      triggerToast('Staff removed', 'success');
    } catch (err) {
      triggerToast('Delete failed', 'error', getApiErrorMessage(err, 'Failed to delete staff'));
    }
  };

  const toggleStaffStatus = async (row: StaffMember) => {
    try {
      await axios.put(`${API_BASE_URL}/staff/${row.id}`, {
        name: row.name,
        phone: row.phone,
        email: row.email,
        role: row.role,
        branch: row.branch,
        qualification: row.qualification,
        address: row.address,
        image: row.image,
        status: !row.status,
      });
      await fetchStaff();
      triggerToast('Status updated', 'success', 'Active status saved.');
    } catch (err) {
      triggerToast('Update failed', 'error', getApiErrorMessage(err, 'Failed to update status'));
    }
  };

  const filteredData = staffData.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.includes(searchTerm) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const columns = [
    { key: 'idx', header: 'S.No', render: (_: StaffMember, idx: number) => <span className="text-muted fw-bold">{idx + 1}</span> },
    {
      key: 'name',
      header: 'Name',
      render: (row: StaffMember) => (
        <div className="d-flex align-items-center gap-3 fw-bold">
          <img src={row.image} alt={row.name} className="staff-profile-pill" />
          {row.name}
        </div>
      ),
    },
    { key: 'phone', header: 'Phone Number', render: (row: StaffMember) => <span className="text-white-50">{row.phone}</span> },
    {
      key: 'role',
      header: 'Role',
      render: (row: StaffMember) => <span className="staff-role-badge">{row.role}</span>,
    },
    {
      key: 'edit',
      header: 'Edit',
      align: 'center' as const,
      render: (row: StaffMember) => (
        <button
          type="button"
          onClick={() => handleOpenOffcanvas(row)}
          className="staff-action-edit d-flex align-items-center justify-content-center mx-auto"
        >
          <Edit3 size={16} />
        </button>
      ),
    },
    {
      key: 'delete',
      header: 'Delete',
      align: 'center' as const,
      render: (row: StaffMember) => (
        <button
          type="button"
          onClick={() => handleDelete(row)}
          className="staff-action-edit d-flex align-items-center justify-content-center mx-auto border-danger text-danger"
          style={{ borderWidth: 1, borderStyle: 'solid', background: 'rgba(239,68,68,0.08)' }}
        >
          <Trash2 size={16} />
        </button>
      ),
    },
    {
      key: 'publish',
      header: 'Publish',
      align: 'center' as const,
      render: (row: StaffMember) => (
        <label className="toggle-switch mx-auto d-block">
          <input type="checkbox" checked={row.status} onChange={() => toggleStaffStatus(row)} />
          <span className="toggle-switch-slider" />
        </label>
      ),
    },
  ];

  return (
    <div className="staff-page-container">
      <CommonHeader
        title="Staff Management"
        icon={Users}
        searchPlaceholder="Search staff by name, phone or email..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onAddClick={() => handleOpenOffcanvas()}
        addButtonLabel="Add New Staff"
      />

      <div className="flex-grow-1 d-flex flex-column overflow-auto">
        {loading ? (
          <div className="d-flex align-items-center justify-content-center flex-grow-1 text-muted">Loading staff…</div>
        ) : (
          <CommonTable
            columns={columns}
            data={paginatedData}
            emptyMessage="No staff found matching your search."
            pagination={{
              currentPage,
              totalPages,
              totalItems,
              itemsPerPage,
              onPageChange: setCurrentPage,
            }}
          />
        )}
      </div>

      <CommonOffcanvas
        isOpen={isOffcanvasOpen}
        onClose={() => setIsOffcanvasOpen(false)}
        title={editingStaff ? 'Edit Staff Details' : 'Add New Staff'}
        footer={
          <>
            <button type="button" onClick={() => setIsOffcanvasOpen(false)} className="btn-cancel" disabled={saving}>
              Cancel
            </button>
            <button type="submit" form="staff-form" className="btn-premium btn-save" disabled={saving}>
              <Save size={18} /> {saving ? 'Saving…' : editingStaff ? 'Save Changes' : 'Add Staff'}
            </button>
          </>
        }
      >
        <AddStaffDetails
          initialData={editingStaff}
          branchOptions={branchOptions}
          onSave={(data) => {
            void handleSaveStaff(data);
          }}
          onCancel={() => setIsOffcanvasOpen(false)}
        />
      </CommonOffcanvas>
    </div>
  );
};

export default StaffDetailsPages;
