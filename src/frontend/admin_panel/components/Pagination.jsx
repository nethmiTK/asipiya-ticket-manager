import React from 'react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  itemsPerPage, 
  onItemsPerPageChange,
  totalItems 
}) => {
  // Calculate the range of items being displayed
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mt-4 p-4 bg-white rounded-lg shadow">
      <div className="flex items-center space-x-4 mb-4 sm:mb-0">
        {/* Entries per page selector */}
        <div className="flex items-center">
          <span className="text-gray-700 text-sm mr-2">Entries per page:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        {/* Items range display */}
        <span className="text-gray-700 text-sm whitespace-nowrap">
          {totalItems === 0 
            ? 'No items found'
            : `Showing ${startItem} to ${endItem} of ${totalItems} entries`
          }
        </span>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1 || totalItems === 0}
          className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          title="First Page"
        >
          &lt;&lt;
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || totalItems === 0}
          className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          title="Previous Page"
        >
          &lt;
        </button>
        <span className="text-gray-700 text-sm font-medium px-2">
          Page {totalItems === 0 ? 0 : currentPage} of {totalPages || 1}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalItems === 0}
          className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          title="Next Page"
        >
          &gt;
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages || totalItems === 0}
          className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          title="Last Page"
        >
          &gt;&gt;
        </button>
      </div>
    </div>
  );
};

export default Pagination; 