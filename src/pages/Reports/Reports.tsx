import React from 'react';
import { BarChart, TrendingUp, Users, DollarSign, ArrowUpRight } from 'lucide-react';
import CommonHeader from '../../components/common/CommonHeader';
import CommonTable from '../../components/common/CommonTable';

const Reports: React.FC = () => {
  // Static mock UI for reports to demonstrate full flow layout
  const kpiData = [
    { title: "Total Revenue", value: "$12,450", trend: "+14.5%", icon: DollarSign },
    { title: "Orders Completed", value: "324", trend: "+5.2%", icon: TrendingUp },
    { title: "Total Customers", value: "892", trend: "+12.1%", icon: Users }
  ];

  const recentTransactions = [
    { id: 'TRX-998', date: 'Today, 10:45 AM', amount: 145.00, method: 'Card' },
    { id: 'TRX-999', date: 'Today, 11:20 AM', amount: 89.50, method: 'Cash' },
    { id: 'TRX-1000', date: 'Today, 11:55 AM', amount: 210.00, method: 'Card' },
  ];

  const columns = [
    { key: 'id', header: 'Transaction ID' },
    { key: 'date', header: 'Date & Time' },
    { key: 'amount', header: 'Amount', render: (row: any) => <span className="text-success fw-bold">${row.amount.toFixed(2)}</span> },
    { key: 'method', header: 'Payment Method' }
  ];

  return (
    <div className="d-flex flex-column h-100" style={{ background: 'var(--bg)', color: 'var(--cream)' }}>
      <CommonHeader 
        title="Analytics & Reports" 
        icon={BarChart} 
        searchPlaceholder=""
        searchValue=""
        onSearchChange={() => {}}
      />
      
      <div className="p-4" style={{ overflowY: 'auto' }}>
        {/* KPI Grid */}
        <div className="row g-4 mb-5">
          {kpiData.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div className="col-md-4" key={idx}>
                <div className="p-4 rounded-4" style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)'}}>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="p-2 rounded-3" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                      <Icon size={24} color="#f59e0b" />
                    </div>
                    <span className="badge rounded-pill d-flex align-items-center gap-1" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
                      <ArrowUpRight size={12} /> {kpi.trend}
                    </span>
                  </div>
                  <h4 className="text-white mb-1 fw-bold fs-2">{kpi.value}</h4>
                  <p className="m-0 fs-6" style={{ color: 'var(--muted)' }}>{kpi.title}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts / Data placeholder & Recent Data */}
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="p-4 rounded-4 h-100" style={{ background: 'var(--card)', border: '1px solid var(--border)'}}>
              <h5 className="mb-4" style={{ fontFamily: 'Playfair Display, serif', color: 'var(--cream)' }}>Revenue Over Time</h5>
              <div className="d-flex align-items-center justify-content-center" style={{ height: '240px', border: '1px dashed var(--border-h)', borderRadius: '12px' }}>
                <span style={{ color: 'var(--muted)' }}>Chart Visualization UI will inject here</span>
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="p-4 rounded-4 h-100 bg-dark" style={{ border: '1px solid var(--border)'}}>
              <h5 className="mb-4 text-white">Recent Transactions</h5>
              <CommonTable data={recentTransactions} columns={columns} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
