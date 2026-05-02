import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Shield, Edit3, Trash2, X, Loader2, FilePlus } from 'lucide-react';
import CommonSubHeader from '../../components/common/CommonSubHeader';
import { triggerToast } from '../../components/common/CommonAlert';
import { getApiErrorMessage } from '../../utils/apiError';
import { API_BASE_URL } from '../../router/const';
import { ROLE_LEVEL_OPTIONS, getRoleCodeLabel, isKnownRoleCode } from '../../const/roleCodes';
import '../Branch/Branch.scss';

export interface RoleRow {
  roleID: number;
  roleName: string;
  roleCode: string | null;
  description: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
}

const ROLES_API = `${API_BASE_URL}api/roles`;

const EMPTY_FORM = {
  roleName: '',
  roleCode: '',
};

const RolePage: React.FC = () => {
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RoleRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await axios.get<RoleRow[]>(ROLES_API);
      setRoles(res.data);
    } catch (err) {
      console.error(err);
      triggerToast('Could not load roles', 'error', getApiErrorMessage(err, 'Failed to load roles'));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const openModal = (row?: RoleRow) => {
    if (row) {
      setEditing(row);
      setForm({
        roleName: row.roleName || '',
        roleCode: row.roleCode || '',
      });
    } else {
      setEditing(null);
      setForm({ ...EMPTY_FORM });
    }
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveRole = async () => {
    if (!form.roleName.trim()) {
      triggerToast('Validation', 'error', 'Role name is required');
      return;
    }
    if (!form.roleCode.trim()) {
      triggerToast('Validation', 'error', 'Please select a role level');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        roleName: form.roleName.trim(),
        roleCode: form.roleCode.trim() || null,
        description: editing ? editing.description || '' : '',
        status: editing ? editing.status : 'Active',
      };
      if (editing) {
        await axios.put(`${ROLES_API}/${editing.roleID}`, payload);
        triggerToast('Role updated', 'success', 'Changes were saved.');
      } else {
        await axios.post(ROLES_API, payload);
        triggerToast('Role created', 'success', 'The new role was added.');
      }
      await fetchRoles();
      closeModal();
    } catch (err) {
      triggerToast('Save failed', 'error', getApiErrorMessage(err, 'Could not save role'));
    }
    setSaving(false);
  };

  const deleteRole = async (row: RoleRow) => {
    if (!window.confirm(`Delete role "${row.roleName}"?`)) return;
    try {
      await axios.delete(`${ROLES_API}/${row.roleID}`);
      await fetchRoles();
      triggerToast('Role deleted', 'success', 'The role was removed.');
    } catch (err) {
      triggerToast('Delete failed', 'error', getApiErrorMessage(err, 'Could not delete role'));
    }
  };

  const toggleStatus = async (row: RoleRow) => {
    const next = row.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await axios.put(`${ROLES_API}/${row.roleID}`, {
        roleName: row.roleName,
        roleCode: row.roleCode,
        description: row.description,
        status: next,
      });
      await fetchRoles();
      triggerToast('Status updated', 'success', `Role is now ${next}.`);
    } catch (err) {
      triggerToast('Update failed', 'error', getApiErrorMessage(err, 'Could not update status'));
    }
  };

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return roles.filter((r) => {
      const codeLabel = getRoleCodeLabel(r.roleCode).toLowerCase();
      return (
        r.roleName.toLowerCase().includes(q) ||
        (r.roleCode || '').toLowerCase().includes(q) ||
        codeLabel.includes(q) ||
        (r.description || '').toLowerCase().includes(q)
      );
    });
  }, [roles, searchTerm]);

  const activeCount = roles.filter((r) => r.status === 'Active').length;
  const inactiveCount = roles.length - activeCount;

  return (
    <div className="branch-page">
      <CommonSubHeader
        icon={Shield}
        title={
          <>
            <span>Role</span> Management
          </>
        }
        totalLabel="Total Roles"
        totalCount={roles.length}
        stats={[
          { label: 'Active', value: activeCount, color: 'green' },
          { label: 'Inactive', value: inactiveCount, color: 'red' },
        ]}
        searchPlaceholder="Search roles..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        addButtonText="Add Role"
        onAddClick={() => openModal()}
      />

      <div className="table-wrapper">
        <table className="branch-table">
          <thead className="prim">
            <tr>
              <th>Role Name</th>
              <th>Role Level</th>
              <th>Description</th>
              <th className="text-center">Status</th>
              <th>Created</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="loading-state">
                  <div className="heartbeat loader-icon">
                    <Shield size={32} />
                  </div>
                  <p>Loading roles...</p>
                </td>
              </tr>
            ) : filtered.length > 0 ? (
              filtered.map((row) => (
                <tr key={row.roleID} className="data-row">
                  <td>
                    <span className="name" style={{ fontWeight: 600, color: 'var(--cream)' }}>
                      {row.roleName}
                    </span>
                  </td>
                  <td>
                    <span className="code" style={{ color: 'var(--amber)', fontSize: '13px' }}>
                      {getRoleCodeLabel(row.roleCode)}
                    </span>
                  </td>
                  <td>
                    <span className="manager-text" style={{ maxWidth: 280, display: 'inline-block' }}>
                      {row.description ? (
                        row.description.length > 80 ? `${row.description.slice(0, 80)}…` : row.description
                      ) : (
                        '—'
                      )}
                    </span>
                  </td>
                  <td className="text-center">
                    <button type="button" onClick={() => toggleStatus(row)} className="status-btn">
                      <div className={`status-badge ${row.status === 'Active' ? 'active' : 'inactive'}`}>
                        <div className="dot" />
                        {row.status}
                      </div>
                    </button>
                  </td>
                  <td>
                    <span className="manager-text">
                      {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}
                    </span>
                  </td>
                  <td>
                    <div className="actions-wrap">
                      <button type="button" onClick={() => openModal(row)} className="action-btn edit" title="Edit">
                        <Edit3 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteRole(row)}
                        className="action-btn delete"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="empty-state">
                  <Shield size={48} className="empty-icon" />
                  <h3>No roles found</h3>
                  <p>{searchTerm ? 'Try a different search.' : 'Add a role to get started.'}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div
        className={`branch-modal-backdrop ${modalOpen ? 'is-visible' : ''}`}
        onClick={closeModal}
        aria-hidden={!modalOpen}
      />
      <div className={`branch-modal-center ${modalOpen ? 'is-open' : ''}`} role="presentation">
        <div
          className="branch-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="role-modal-title"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="branch-modal__header">
            <div className="branch-modal__title-block">
              <h2 id="role-modal-title">Role</h2>
              <span className="branch-modal__badge">{editing ? 'Edit' : 'New'}</span>
            </div>
            <button type="button" className="branch-modal__close" onClick={closeModal} aria-label="Close">
              <X size={22} strokeWidth={2} />
            </button>
          </div>

          <div className="branch-modal__body">
            <div className="branch-modal__grid">
              <div className="branch-modal-field branch-modal-field--full">
                <span className="branch-modal-field__label">
                  Role name<span className="branch-modal-field__req"> *</span>
                </span>
                <input
                  name="roleName"
                  value={form.roleName}
                  onChange={handleChange}
                  className="branch-modal-input"
                  placeholder="e.g. Branch Manager"
                  autoComplete="off"
                />
              </div>
              <div className="branch-modal-field branch-modal-field--full">
                <span className="branch-modal-field__label">
                  Role Level<span className="branch-modal-field__req"> *</span>
                </span>
                <select
                  name="roleCode"
                  value={form.roleCode}
                  onChange={handleChange}
                  className="branch-modal-input branch-modal-select"
                >
                  <option value="">Select Role Level</option>
                  {editing && form.roleCode && !isKnownRoleCode(form.roleCode) && (
                    <option value={form.roleCode}>{getRoleCodeLabel(form.roleCode)} (current)</option>
                  )}
                  {ROLE_LEVEL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="branch-modal__footer" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="branch-modal__submit" onClick={saveRole} disabled={saving}>
              {saving ? <Loader2 className="spin" size={18} /> : <FilePlus size={18} strokeWidth={2} />}
              {saving ? 'Saving…' : editing ? 'Update Role' : 'Add Role'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolePage;
