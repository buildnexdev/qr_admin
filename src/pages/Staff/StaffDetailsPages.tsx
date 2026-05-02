import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Users,
  Eye,
  Pencil,
  Trash2,
  KeyRound,
  Power,
  Download,
  Upload,
} from 'lucide-react';
import type { AppDispatch, RootState } from '../../store';
import {
  FetchStaffDetails,
  GetStaffDetails,
  AddStaffDetails,
  EditStaffDetails,
  DeleteStaffDetails,
  ResetStaffPassword,
  clearCurrentStaff,
  type StaffMember,
} from '../../store/staffSlice';
import { fetchBranches } from '../../store/branchSlice';
import CommonHeader from '../../components/common/CommonHeader';
import CommonTable from '../../components/common/CommonTable';
import CommonOffcanvas from '../../components/common/CommonOffcanvas';
import { triggerToast } from '../../components/common/CommonAlert';
import { getApiErrorMessage } from '../../utils/apiError';
import { RESTAURANT_ROLES } from '../../const/restaurantRoles';
import StaffMultiStepForm, { type StaffWizardPayload } from './StaffMultiStepForm';
import StaffViewPanel from './StaffViewPanel';
import './staffStyle.scss';

const getBranchLabel = (b: { branchName?: string; name?: string }) =>
  b.branchName || b.name || '';

function fmtJoinDate(d?: string) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return d;
  }
}

/** Full PUT body from list row (backend expects complete payload). */
function staffRowToPayload(row: StaffMember, overrides: Record<string, unknown> = {}) {
  return {
    name: row.name,
    phone: row.phone,
    email: row.email || '',
    role: row.role,
    branch: row.branch,
    qualification: row.qualification || '',
    address: row.address || '',
    image: row.image || '',
    status: row.status,
    employeeId: row.employeeId || '',
    gender: row.gender || '',
    dateOfBirth: row.dateOfBirth || '',
    alternatePhone: row.alternatePhone || '',
    department: row.department || '',
    shiftTiming: row.shiftTiming || '',
    joiningDate: row.joiningDate || '',
    username: row.username || '',
    isPublish: row.isPublish !== false,
    permissionsJson: row.permissionsJson ?? null,
    documentsJson: row.documentsJson ?? null,
    ...overrides,
  };
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuote = !inQuote;
      continue;
    }
    if (!inQuote && c === ',') {
      result.push(cur);
      cur = '';
      continue;
    }
    cur += c;
  }
  result.push(cur);
  return result.map((s) => s.trim());
}

const StaffDetailsPages: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { staff: staffData, loading, currentStaff } = useSelector((state: RootState) => state.staff);
  const { branches } = useSelector((state: RootState) => state.branches);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const [formOpen, setFormOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [saving, setSaving] = useState(false);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);

  const [resetPwdStaff, setResetPwdStaff] = useState<StaffMember | null>(null);
  const [resetPwd1, setResetPwd1] = useState('');
  const [resetPwd2, setResetPwd2] = useState('');
  const [resetSaving, setResetSaving] = useState(false);

  const importRef = useRef<HTMLInputElement>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const branchOptions = useMemo(() => {
    const labels = branches.map(getBranchLabel).filter(Boolean);
    return labels.length > 0 ? labels : ['Main Branch'];
  }, [branches]);

  const roleFilterOptions = useMemo(() => {
    const fromData = new Set<string>();
    staffData.forEach((s) => {
      if (s.role) fromData.add(s.role);
    });
    RESTAURANT_ROLES.forEach((r) => fromData.add(r));
    return Array.from(fromData).sort();
  }, [staffData]);

  useEffect(() => {
    void dispatch(FetchStaffDetails())
      .unwrap()
      .catch((msg: unknown) => {
        triggerToast('Could not load staff', 'error', String(msg));
      });
    void dispatch(fetchBranches()).unwrap().catch(() => {
      /* optional */
    });
  }, [dispatch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRole, filterBranch, filterStatus]);

  const filteredData = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return staffData.filter((s) => {
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        (s.phone || '').includes(searchTerm.trim()) ||
        (s.alternatePhone || '').includes(searchTerm.trim()) ||
        (s.email || '').toLowerCase().includes(q) ||
        (s.employeeId || '').toLowerCase().includes(q);

      const matchesRole = !filterRole || s.role === filterRole;
      const matchesBranch = !filterBranch || s.branch === filterBranch;
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && s.status) ||
        (filterStatus === 'inactive' && !s.status);

      return matchesSearch && matchesRole && matchesBranch && matchesStatus;
    });
  }, [staffData, searchTerm, filterRole, filterBranch, filterStatus]);

  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openForm = (staff?: StaffMember) => {
    setEditingStaff(staff || null);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingStaff(null);
  };

  const handleSubmitWizard = async (payload: StaffWizardPayload) => {
    setSaving(true);
    try {
      if (editingStaff?.id) {
        await dispatch(
          EditStaffDetails({ id: editingStaff.id, payload })
        ).unwrap();
        triggerToast('Staff updated', 'success', 'Changes saved successfully.');
      } else {
        await dispatch(AddStaffDetails(payload)).unwrap();
        triggerToast('Staff added', 'success', 'New staff member was created.');
      }
      closeForm();
    } catch (err: unknown) {
      triggerToast('Save failed', 'error', getApiErrorMessage(err, 'Failed to save staff'));
    }
    setSaving(false);
  };

  const handleDelete = async (row: StaffMember) => {
    if (!window.confirm(`Remove staff member "${row.name}"?`)) return;
    try {
      await dispatch(DeleteStaffDetails(row.id)).unwrap();
      triggerToast('Staff removed', 'success');
    } catch (err: unknown) {
      triggerToast('Delete failed', 'error', getApiErrorMessage(err, 'Failed to delete staff'));
    }
  };

  const patchStaff = async (row: StaffMember, overrides: Record<string, unknown>, okMsg: string) => {
    try {
      await dispatch(
        EditStaffDetails({ id: row.id, payload: staffRowToPayload(row, overrides) })
      ).unwrap();
      triggerToast('Updated', 'success', okMsg);
    } catch (err: unknown) {
      triggerToast('Update failed', 'error', getApiErrorMessage(err, 'Failed to update'));
    }
  };

  const openView = async (row: StaffMember) => {
    setViewOpen(true);
    setViewLoading(true);
    dispatch(clearCurrentStaff());
    try {
      await dispatch(GetStaffDetails(row.id)).unwrap();
    } catch (err: unknown) {
      triggerToast('Could not load profile', 'error', getApiErrorMessage(err, 'Failed to load staff'));
      setViewOpen(false);
    }
    setViewLoading(false);
  };

  const closeView = () => {
    setViewOpen(false);
    dispatch(clearCurrentStaff());
  };

  const handleExport = () => {
    const headers = [
      'name',
      'employeeId',
      'role',
      'branch',
      'phone',
      'email',
      'status',
      'joiningDate',
      'isPublish',
    ];
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lines = [
      headers.join(','),
      ...filteredData.map((r) =>
        headers
          .map((h) => {
            if (h === 'status') return esc(r.status ? 'Active' : 'Inactive');
            if (h === 'isPublish') return esc(r.isPublish !== false ? '1' : '0');
            return esc((r as Record<string, unknown>)[h]);
          })
          .join(',')
      ),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `staff-export-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast('Exported', 'success', `${filteredData.length} row(s) downloaded.`);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    let text: string;
    try {
      text = await file.text();
    } catch {
      triggerToast('Import failed', 'error', 'Could not read file.');
      return;
    }
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) {
      triggerToast('Import failed', 'error', 'CSV needs a header row and at least one data row.');
      return;
    }
    const header = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/^\ufeff/, ''));
    const idx = (name: string) => header.indexOf(name);

    const iName = idx('name');
    const iPhone = idx('phone');
    if (iName < 0 || iPhone < 0) {
      triggerToast('Import failed', 'error', 'CSV must include columns: name, phone');
      return;
    }

    const defaultPw =
      window.prompt('Default password for imported rows (required by server):', 'ChangeMe123!') ||
      '';
    if (!defaultPw.trim()) {
      triggerToast('Import cancelled', 'info', 'Password is required for new staff.');
      return;
    }

    let ok = 0;
    let fail = 0;
    for (let li = 1; li < lines.length; li++) {
      const cells = parseCsvLine(lines[li]);
      const get = (i: number) => (i >= 0 ? cells[i] || '' : '');
      const name = get(iName).trim();
      const phone = get(iPhone).trim();
      if (!name || !phone) {
        fail++;
        continue;
      }
      const payload: Record<string, unknown> = {
        name,
        phone,
        email: get(idx('email')),
        role: get(idx('role')) || 'Server',
        branch: get(idx('branch')) || branchOptions[0],
        password: get(idx('password')) || defaultPw,
        status: true,
        isPublish: true,
      };
      const emp = get(idx('employeeid'));
      if (emp) payload.employeeId = emp;
      try {
        await dispatch(AddStaffDetails(payload)).unwrap();
        ok++;
      } catch {
        fail++;
      }
    }
    triggerToast(
      'Import finished',
      ok > 0 ? 'success' : 'warning',
      `Created ${ok} staff record(s). ${fail ? `${fail} row(s) skipped or failed.` : ''}`
    );
  };

  const submitResetPassword = async () => {
    if (!resetPwdStaff) return;
    if (!resetPwd1.trim()) {
      triggerToast('Validation', 'error', 'Enter a new password.');
      return;
    }
    if (resetPwd1 !== resetPwd2) {
      triggerToast('Validation', 'error', 'Passwords do not match.');
      return;
    }
    setResetSaving(true);
    try {
      await dispatch(
        ResetStaffPassword({ id: resetPwdStaff.id, password: resetPwd1 })
      ).unwrap();
      triggerToast('Password reset', 'success', 'The new password is active.');
      setResetPwdStaff(null);
      setResetPwd1('');
      setResetPwd2('');
    } catch (err: unknown) {
      triggerToast('Reset failed', 'error', getApiErrorMessage(err, 'Failed to reset password'));
    }
    setResetSaving(false);
  };

  const columns = [
    {
      key: 'idx',
      header: 'S.No',
      render: (_: StaffMember, i: number) => (
        <span className="text-muted fw-bold">{(currentPage - 1) * itemsPerPage + i + 1}</span>
      ),
    },
    {
      key: 'name',
      header: 'Staff Name',
      render: (row: StaffMember) => (
        <div className="d-flex align-items-center gap-3 fw-bold">
          <img
            src={row.image || `https://i.pravatar.cc/150?u=${row.id}`}
            alt=""
            className="staff-profile-pill"
          />
          <span className="text-truncate" style={{ maxWidth: 160 }}>
            {row.name}
          </span>
        </div>
      ),
    },
    {
      key: 'employeeId',
      header: 'Employee ID',
      render: (row: StaffMember) => (
        <span className="text-white-50">{row.employeeId || '—'}</span>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (row: StaffMember) => <span className="staff-role-badge">{row.role}</span>,
    },
    {
      key: 'branch',
      header: 'Branch',
      render: (row: StaffMember) => <span className="text-white-50">{row.branch || '—'}</span>,
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (row: StaffMember) => <span className="text-white-50">{row.phone || '—'}</span>,
    },
    {
      key: 'email',
      header: 'Email',
      render: (row: StaffMember) => (
        <span className="text-white-50 text-truncate d-inline-block" style={{ maxWidth: 140 }}>
          {row.email || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: StaffMember) => (
        <span className={`badge ${row.status ? 'text-bg-success' : 'text-bg-secondary'}`}>
          {row.status ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'joiningDate',
      header: 'Joining Date',
      render: (row: StaffMember) => (
        <span className="text-white-50">{fmtJoinDate(row.joiningDate)}</span>
      ),
    },
    {
      key: 'publish',
      header: 'Publish',
      align: 'center' as const,
      render: (row: StaffMember) => (
        <label className="toggle-switch mx-auto d-block">
          <input
            type="checkbox"
            checked={row.isPublish !== false}
            onChange={() =>
              void patchStaff(row, { isPublish: row.isPublish === false }, 'Publish setting saved.')
            }
          />
          <span className="toggle-switch-slider" />
        </label>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center' as const,
      render: (row: StaffMember) => (
        <div className="staff-actions-cell d-flex align-items-center justify-content-center gap-1 flex-wrap">
          <button
            type="button"
            className="staff-icon-btn"
            title="View"
            onClick={() => void openView(row)}
          >
            <Eye size={16} />
          </button>
          <button type="button" className="staff-icon-btn" title="Edit" onClick={() => openForm(row)}>
            <Pencil size={16} />
          </button>
          <button
            type="button"
            className="staff-icon-btn"
            title={row.status ? 'Deactivate' : 'Activate'}
            onClick={() =>
              void patchStaff(
                row,
                { status: !row.status },
                row.status ? 'Staff deactivated.' : 'Staff activated.'
              )
            }
          >
            <Power size={16} />
          </button>
          <button
            type="button"
            className="staff-icon-btn"
            title="Reset password"
            onClick={() => {
              setResetPwdStaff(row);
              setResetPwd1('');
              setResetPwd2('');
            }}
          >
            <KeyRound size={16} />
          </button>
          <button
            type="button"
            className="staff-icon-btn staff-icon-btn--danger"
            title="Delete"
            onClick={() => void handleDelete(row)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="staff-page-container staff-page--flush">
      <CommonHeader
        title="Staff Management"
        icon={Users}
        searchPlaceholder="Search by name, phone, email, employee ID…"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onAddClick={() => openForm()}
        addButtonLabel="Add Staff"
      />

      <div className="staff-toolbar flex-shrink-0 d-flex flex-wrap align-items-center justify-content-between gap-1 px-2 py-1">
        <div className="d-flex flex-wrap align-items-center gap-1">
          <button type="button" className="btn-toolbar" onClick={handleExport}>
            <Download size={16} /> Export
          </button>
          <button type="button" className="btn-toolbar" onClick={() => importRef.current?.click()}>
            <Upload size={16} /> Import
          </button>
          <input
            ref={importRef}
            type="file"
            accept=".csv,text/csv"
            className="d-none"
            onChange={(e) => void handleImportFile(e)}
          />
          <span className="staff-toolbar__sep" aria-hidden />
        </div>
        <div className="d-flex flex-wrap align-items-center gap-1">
          <label className="staff-toolbar__filter mb-0">
            <span className="text-muted small me-1">Role</span>
            <select
              className="dark-input dark-select"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="">All roles</option>
              {roleFilterOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <label className="staff-toolbar__filter mb-0">
            <span className="text-muted small me-1">Branch</span>
            <select
              className="dark-input dark-select"
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
            >
              <option value="">All branches</option>
              {branchOptions.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </label>
          <label className="staff-toolbar__filter mb-0">
            <span className="text-muted small me-1">Status</span>
            <select
              className="dark-input dark-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </div>
      </div>

      <div className="staff-table-region flex-grow-1 d-flex flex-column overflow-auto min-h-0">
        {loading ? (
          <div className="d-flex align-items-center justify-content-center flex-grow-1 text-muted">
            Loading staff…
          </div>
        ) : (
          <CommonTable
            columns={columns}
            data={paginatedData}
            emptyMessage="No staff matches your filters."
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
        isOpen={formOpen}
        onClose={closeForm}
        title="Staff Details"
        titleExtra={
          !editingStaff ? (
            <span className="staff-detail-badge" title="New record">
              New
            </span>
          ) : null
        }
        width="min(96vw, 920px)"
        panelClassName="staff-offcanvas--ledger"
        backdropClassName="common-offcanvas-backdrop--ledger"
      >
        <StaffMultiStepForm
          initialData={editingStaff}
          branchOptions={branchOptions}
          isSubmitting={saving}
          onSubmit={(payload) => {
            void handleSubmitWizard(payload);
          }}
          onCancel={closeForm}
        />
      </CommonOffcanvas>

      <CommonOffcanvas
        isOpen={viewOpen}
        onClose={closeView}
        title="Staff profile"
        width="440px"
      >
        <StaffViewPanel staff={currentStaff} loading={viewLoading} />
      </CommonOffcanvas>

      {resetPwdStaff && (
        <div className="staff-modal-backdrop" role="presentation" onClick={() => !resetSaving && setResetPwdStaff(null)}>
          <div
            className="staff-modal"
            role="dialog"
            aria-modal
            aria-labelledby="staff-reset-title"
            onClick={(ev) => ev.stopPropagation()}
          >
            <h3 id="staff-reset-title" className="h6 mb-3">
              Reset password — {resetPwdStaff.name}
            </h3>
            <div className="d-flex flex-column gap-2 mb-3">
              <div>
                <label className="input-label">New password</label>
                <input
                  type="password"
                  className="dark-input w-100"
                  value={resetPwd1}
                  onChange={(e) => setResetPwd1(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="input-label">Confirm password</label>
                <input
                  type="password"
                  className="dark-input w-100"
                  value={resetPwd2}
                  onChange={(e) => setResetPwd2(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn-cancel"
                disabled={resetSaving}
                onClick={() => setResetPwdStaff(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-premium"
                disabled={resetSaving}
                onClick={() => void submitResetPassword()}
              >
                {resetSaving ? 'Saving…' : 'Reset password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDetailsPages;
