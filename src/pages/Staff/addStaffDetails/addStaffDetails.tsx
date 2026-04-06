import React, { useState, useEffect } from 'react';
import {
  RESTAURANT_ROLES,
  DEFAULT_RESTAURANT_ROLE,
  isKnownRestaurantRole,
} from '../../../const/restaurantRoles';

interface AddStaffDetailsProps {
  initialData?: Record<string, unknown> | null;
  branchOptions?: string[];
  onSave: (data: Record<string, unknown>) => void;
  onCancel: () => void;
}

const AddStaffDetails: React.FC<AddStaffDetailsProps> = ({ initialData, branchOptions = ['Main Branch'], onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    role: DEFAULT_RESTAURANT_ROLE,
    branch: 'Main Branch',
    qualification: '',
    address: '',
    status: true
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: (initialData.name as string) || '',
        phone: (initialData.phone as string) || '',
        email: (initialData.email as string) || '',
        password: '',
        role: (initialData.role as string) || DEFAULT_RESTAURANT_ROLE,
        branch: (initialData.branch as string) || branchOptions[0] || 'Main Branch',
        qualification: (initialData.qualification as string) || '',
        address: (initialData.address as string) || '',
        status: initialData.status !== undefined ? Boolean(initialData.status) : true
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        password: '',
        role: DEFAULT_RESTAURANT_ROLE,
        branch: branchOptions[0] || 'Main Branch',
        qualification: '',
        address: '',
        status: true
      });
    }
  }, [initialData, branchOptions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, status: e.target.checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form id="staff-form" onSubmit={handleSubmit} className="staff-form">
      <div className="input-group d-flex flex-column gap-1">
        <label className="input-label">Full Name *</label>
        <input name="name" value={formData.name} onChange={handleInputChange} type="text" placeholder="Enter staff name" className="dark-input" required />
      </div>

      <div className="input-group d-flex flex-column gap-1">
        <label className="input-label">Phone Number *</label>
        <input name="phone" value={formData.phone} onChange={handleInputChange} type="tel" placeholder="e.g. 9876543210" className="dark-input" required />
      </div>

      <div className="input-group d-flex flex-column gap-1">
        <label className="input-label">Email ID</label>
        <input name="email" value={formData.email} onChange={handleInputChange} type="email" placeholder="staff@example.com" className="dark-input" />
      </div>

      {!initialData && (
        <div className="input-group d-flex flex-column gap-1">
          <label className="input-label">Password *</label>
          <input name="password" value={formData.password} onChange={handleInputChange} type="password" placeholder="Create a password" className="dark-input" autoComplete="new-password" required />
        </div>
      )}

      <div className="d-flex w-100 gap-3">
        <div className="input-group d-flex flex-column gap-1 w-50">
          <label className="input-label">Role *</label>
          <select name="role" value={formData.role} onChange={handleInputChange} className="dark-input dark-select">
            {formData.role && !isKnownRestaurantRole(formData.role) && (
              <option value={formData.role}>{formData.role} (current)</option>
            )}
            {RESTAURANT_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group d-flex flex-column gap-1 w-50">
          <label className="input-label">Branch *</label>
          <select name="branch" value={formData.branch} onChange={handleInputChange} className="dark-input dark-select">
            {branchOptions.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="input-group d-flex flex-column gap-1">
        <label className="input-label">Qualification</label>
        <input name="qualification" value={formData.qualification} onChange={handleInputChange} type="text" placeholder="e.g. B.Com, MBA" className="dark-input" />
      </div>

      <div className="input-group d-flex flex-column gap-1">
        <label className="input-label">Address</label>
        <textarea name="address" value={formData.address} onChange={handleInputChange} placeholder="Enter full address" rows={2} className="dark-input" />
      </div>

      <div className="d-flex align-items-center gap-2 mt-2">
        <label className="input-label mb-0">Active Status</label>
        <label className="toggle-switch m-0 ms-2">
          <input type="checkbox" checked={formData.status} onChange={handleStatusChange} />
          <span className="toggle-switch-slider"></span>
        </label>
      </div>
    </form>
  );
};

export default AddStaffDetails;
