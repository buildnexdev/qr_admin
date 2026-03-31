import React from 'react';

const Categories: React.FC = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Category Management</h2>
        <button className="btn btn-primary">Add Category</button>
      </div>
      <div className="card">
        <p>Menu categories will be managed here.</p>
      </div>
    </div>
  );
};

export default Categories;
