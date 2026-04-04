import React, { useState, useEffect } from 'react';
import { Receipt, Eye, Printer, HandCoins } from 'lucide-react';
import CommonHeader from '../../components/common/CommonHeader';
import CommonTable from '../../components/common/CommonTable';
import { triggerToast } from '../../components/common/CommonAlert';

interface Bill {
  id: string;
  orderId: number;
  tableName: string;
  customerName: string;
  amount: number;
  status: 'Unpaid' | 'Paid';
  date: string;
}

const Bills: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching bills
    setTimeout(() => {
      setBills([
        { id: 'INV-101', orderId: 4432, tableName: 'Terrace A1', customerName: 'John Doe', amount: 89.50, status: 'Paid', date: new Date().toISOString() },
        { id: 'INV-102', orderId: 4433, tableName: 'Indoor 4', customerName: 'Sarah Smith', amount: 45.25, status: 'Unpaid', date: new Date().toISOString() },
        { id: 'INV-103', orderId: 4435, tableName: 'VIP Lounge', customerName: 'Michael Chang', amount: 120.00, status: 'Unpaid', date: new Date().toISOString() },
        { id: 'INV-104', orderId: 4436, tableName: 'Bar 1', customerName: 'Guest', amount: 24.00, status: 'Paid', date: new Date().toISOString() }
      ]);
      setLoading(false);
    }, 600);
  }, []);

  const filteredBills = bills.filter(b => 
    b.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.tableName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const settleBill = (id: string) => {
    setBills(bills.map(b => b.id === id ? { ...b, status: 'Paid' } : b));
    triggerToast(`Bill ${id} marked as Paid`, 'success');
  };

  const columns = [
    { key: 'id', header: 'Bill No.', render: (row: Bill) => <span className="fw-bold" style={{ color: '#f59e0b' }}>{row.id}</span> },
    { key: 'tableName', header: 'Table' },
    { key: 'customerName', header: 'Customer' },
    { 
      key: 'amount', 
      header: 'Total', 
      align: 'right' as const,
      render: (row: Bill) => <span className="fw-bold">${row.amount.toFixed(2)}</span> 
    },
    { 
      key: 'status', 
      header: 'Status', 
      align: 'center' as const,
      render: (row: Bill) => (
        <span className="badge rounded-pill" style={{ 
          backgroundColor: row.status === 'Paid' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          color: row.status === 'Paid' ? '#10B981' : '#EF4444',
          border: `1px solid ${row.status === 'Paid' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
        }}>
          {row.status}
        </span>
      )
    },
    { key: 'date', header: 'Time', render: (row: Bill) => new Date(row.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'}) },
    { 
      key: 'actions', 
      header: 'Actions',
      align: 'center' as const,
      render: (row: Bill) => (
        <div className="d-flex gap-2 justify-content-center">
          {row.status === 'Unpaid' && (
            <button onClick={() => settleBill(row.id)} className="btn btn-sm btn-outline-success border-0" title="Settle Payment">
              <HandCoins size={16} />
            </button>
          )}
          <button className="btn btn-sm btn-outline-light border-0" title="View Details">
            <Eye size={16} />
          </button>
          <button onClick={() => window.print()} className="btn btn-sm btn-outline-warning border-0" title="Print Receipt">
            <Printer size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="d-flex flex-column h-100">
      <CommonHeader 
        title="Billing & Invoices" 
        icon={Receipt} 
        searchPlaceholder="Search invoices or tables..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
      />
      <div className="flex-grow-1 p-4" style={{ overflowY: 'auto' }}>
        {loading ? (
          <div className="text-center text-muted py-5">Loading bills...</div>
        ) : (
          <CommonTable 
            columns={columns} 
            data={filteredBills} 
            emptyMessage="No pending or recent bills found." 
          />
        )}
      </div>
    </div>
  );
};

export default Bills;
