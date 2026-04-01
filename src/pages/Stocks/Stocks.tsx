import React from 'react';

const Stocks: React.FC = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Inventory Stocks</h2>
        <button className="btn btn-primary">Add Stock Item</button>
      </div>
      <div className="card">
        <p>Inventory and stock levels will be tracked here.</p>
      </div>
    </div>
  );
};

export default Stocks;
