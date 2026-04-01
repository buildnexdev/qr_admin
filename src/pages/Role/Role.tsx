import React from 'react';

const Role: React.FC = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Roles Management</h2>
        <button className="btn btn-primary">Add Role</button>
      </div>
      <div className="card">
        <p>List of roles will be displayed here.</p>
      </div>
    </div>
  );
};

export default Role;
