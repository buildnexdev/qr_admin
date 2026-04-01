import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface CommonPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const CommonPagination: React.FC<CommonPaginationProps> = ({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }) => {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="common-pagination">
      <div className="page-info">
        Showing {startItem} to {endItem} of {totalItems} entries
      </div>
      <div className="page-controls">
        <button 
          className="page-btn nav-btn" 
          onClick={() => onPageChange(currentPage - 1)} 
          disabled={currentPage === 1}
        >
          <ChevronLeft size={18} />
        </button>
        
        {/* Render page numbers */}
        {[...Array(totalPages)].map((_, i) => (
          <button 
            key={i} 
            className={`page-btn num-btn ${currentPage === i + 1 ? 'active' : ''}`}
            onClick={() => onPageChange(i + 1)}
          >
            {i + 1}
          </button>
        ))}

        <button 
          className="page-btn nav-btn" 
          onClick={() => onPageChange(currentPage + 1)} 
          disabled={currentPage === totalPages}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default CommonPagination;
