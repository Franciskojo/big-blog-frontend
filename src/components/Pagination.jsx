import React from 'react';
import '../styles/components.css';

const Pagination = ({ current, total, onPageChange }) => {
  const pages = [];
  const maxVisiblePages = 5;

  let startPage = Math.max(1, current - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(total, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  if (pages.length === 0) return null;

  return (
    <div className="pagination">
      <button
        onClick={() => onPageChange(current - 1)}
        disabled={current === 1}
        className="pagination-btn"
      >
        Previous
      </button>

      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`pagination-btn ${current === page ? 'active' : ''}`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(current + 1)}
        disabled={current === total}
        className="pagination-btn"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;