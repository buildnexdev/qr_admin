import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, ArrowUpCircle } from 'lucide-react';
import CommonHeader from '../../components/common/CommonHeader';
import CommonTable from '../../components/common/CommonTable';
import { triggerToast } from '../../components/common/CommonAlert';

interface StockItem {
  id: string;
  name: string;
  category: string;
  qty: number;
  unit: string;
  threshold: number;
  lastRestocked: string;
}

const Stocks: React.FC = () => {
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock inventory fetch
    setTimeout(() => {
      setStocks([
        { id: 'SKU-001', name: 'Premium Espresso Beans', category: 'Beverage', qty: 12, unit: 'kg', threshold: 5, lastRestocked: '2026-03-20' },
        { id: 'SKU-002', name: 'Organic Milk', category: 'Dairy', qty: 4, unit: 'L', threshold: 10, lastRestocked: '2026-04-03' },
        { id: 'SKU-003', name: 'Truffle Oil', category: 'Pantry', qty: 2, unit: 'bottles', threshold: 3, lastRestocked: '2026-03-15' },
        { id: 'SKU-004', name: 'Wagyu Beef A5', category: 'Meat', qty: 15, unit: 'kg', threshold: 8, lastRestocked: '2026-04-01' },
      ]);
      setLoading(false);
    }, 600);
  }, []);

  const filteredStocks = stocks.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const reorderStock = (id: string) => {
    triggerToast(`Reorder request sent for ${filteredStocks.find(s => s.id === id)?.name}`, 'info');
  };

  const columns = [
    { key: 'name', header: 'Item Name', render: (row: StockItem) => <span className="fw-bold text-white">{row.name}</span> },
    { key: 'category', header: 'Category', render: (row: StockItem) => <span className="text-muted">{row.category}</span> },
    { 
      key: 'qty', 
      header: 'Stock Level', 
      align: 'center' as const,
      render: (row: StockItem) => {
        const isLow = row.qty <= row.threshold;
        return (
          <div className="d-flex align-items-center justify-content-center gap-2">
            <span style={{ color: isLow ? '#EF4444' : '#10B981', fontWeight: 700, fontSize: '15px' }}>
              {row.qty} {row.unit}
            </span>
            {isLow && <AlertTriangle size={14} color="#EF4444" />}
          </div>
        )
      }
    },
    { key: 'threshold', header: 'Min Threshold', align: 'center' as const, render: (row: StockItem) => `${row.threshold} ${row.unit}` },
    { key: 'lastRestocked', header: 'Last Restocked' },
    { 
      key: 'actions', 
      header: 'Actions',
      align: 'center' as const,
      render: (row: StockItem) => (
        <button 
          onClick={() => reorderStock(row.id)} 
          className="btn btn-sm btn-outline-warning border-0 d-flex align-items-center gap-1 mx-auto"
        >
          <ArrowUpCircle size={15} /> Request Reorder
        </button>
      )
    }
  ];

  return (
    <div className="d-flex flex-column h-100">
      <CommonHeader 
        title="Inventory & Stocks" 
        icon={Package} 
        searchPlaceholder="Search inventory items..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
      />
      
      <div className="flex-grow-1 p-4" style={{ overflowY: 'auto' }}>
        {loading ? (
          <div className="text-center text-muted py-5">Loading stock data...</div>
        ) : (
          <div className="bg-dark rounded-4 p-2 shadow-sm border" style={{ borderColor: 'rgba(245, 158, 11, 0.1)'}}>
             <CommonTable 
              columns={columns} 
              data={filteredStocks} 
              emptyMessage="No stock items found matching your search." 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Stocks;
