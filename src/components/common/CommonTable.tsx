import React from 'react';
import CommonPagination from './CommonPagination';
import type { CommonPaginationProps } from './CommonPagination';

interface Column {
  key: string;
  header: string;
  render?: (row: any, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

interface CommonTableProps {
  columns: Column[];
  data: any[];
  emptyMessage?: string;
  /** When set, replaces the plain empty message (e.g. illustration + caption). */
  emptySlot?: React.ReactNode;
  pagination?: CommonPaginationProps;
}

const CommonTable: React.FC<CommonTableProps> = ({
  columns,
  data,
  emptyMessage = 'No records found.',
  emptySlot,
  pagination,
}) => {
  return (
    <div className="table-wrapper">
      <table className="premium-dark-table m-0">
        <thead className="sticky-top z-2">
          <tr className='text-nowrap'>
            {columns.map((col, idx) => (
              <th 
                key={idx} 
                className={`text-${col.align === 'center' ? 'center' : col.align === 'right' ? 'end' : 'start'} ${idx === 0 ? 'ps-5' : ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? data.map((row, rowIndex) => (
            <tr key={row.id || rowIndex}>
              {columns.map((col, colIndex) => (
                <td 
                  key={colIndex} 
                  className={`text-${col.align === 'center' ? 'center' : col.align === 'right' ? 'end' : 'start'} ${colIndex === 0 ? 'ps-5' : ''}`}
                >
                  {col.render ? col.render(row, rowIndex) : row[col.key]}
                </td>
              ))}
            </tr>
          )) : (
            <tr className="empty-row">
              <td colSpan={columns.length}>
                {emptySlot ?? emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {pagination && (
        <CommonPagination {...pagination} />
      )}
    </div>
  );
};

export default CommonTable;
