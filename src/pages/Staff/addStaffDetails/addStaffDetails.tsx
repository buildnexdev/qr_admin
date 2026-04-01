import React, { useState, useEffect } from 'react';

interface AddStaffDetailsProps {
  initialData?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

const AddStaffDetails: React.FC<AddStaffDetailsProps> = ({ initialData, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    role: 'Field Officer (level3)',
    branch: 'Main Branch',
    qualification: '',
    address: '',
    status: true
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        password: '', // Blank for security
        role: initialData.role || 'Field Officer (level3)',
        branch: initialData.branch || 'Main Branch',
        qualification: initialData.qualification || '',
        address: initialData.address || '',
        status: initialData.status !== undefined ? initialData.status : true
      });
    }
  }, [initialData]);

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
          <input name="password" value={formData.password} onChange={handleInputChange} type="password" placeholder="Create a password" className="dark-input" required />
        </div>
      )}

      <div className="d-flex w-100 gap-3">
        <div className="input-group d-flex flex-column gap-1 w-50">
          <label className="input-label">Role *</label>
          <select name="role" value={formData.role} onChange={handleInputChange} className="dark-input dark-select">
            <option value="Field Officer (level3)">Field Officer</option>
            <option value="Coll Manager (level3)">Coll Manager</option>
            <option value="Sub Admin (level4)">Sub Admin</option>
            <option value="collection (level3)">Collection</option>
          </select>
        </div>

        <div className="input-group d-flex flex-column gap-1 w-50">
          <label className="input-label">Branch *</label>
          <select name="branch" value={formData.branch} onChange={handleInputChange} className="dark-input dark-select">
            <option value="Main Branch">Main Branch</option>
            <option value="North Branch">North Branch</option>
            <option value="South Branch">South Branch</option>
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
