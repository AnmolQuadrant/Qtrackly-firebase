// import React from 'react';
// import { ChevronLeft, ChevronRight } from 'lucide-react';

// function Pagination({ paginationData, onPageChange }) {
//     if (!paginationData || paginationData.totalPages <= 1) return null;

//     const { pageNumber, totalPages, totalCount, pageSize } = paginationData;
//     const startItem = (pageNumber - 1) * pageSize + 1;
//     const endItem = Math.min(pageNumber * pageSize, totalCount);

//     const getPageNumbers = () => {
//         const pages = [];
//         const maxVisiblePages = 5;
//         if (totalPages <= maxVisiblePages) {
//             for (let i = 1; i <= totalPages; i++) pages.push(i);
//         } else {
//             const halfVisible = Math.floor(maxVisiblePages / 2);
//             let startPage = Math.max(1, pageNumber - halfVisible);
//             let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
//             if (endPage - startPage < maxVisiblePages - 1) {
//                 startPage = Math.max(1, endPage - maxVisiblePages + 1);
//             }
//             if (startPage > 1) {
//                 pages.push(1);
//                 if (startPage > 2) pages.push('...');
//             }
//             for (let i = startPage; i <= endPage; i++) pages.push(i);
//             if (endPage < totalPages) {
//                 if (endPage < totalPages - 1) pages.push('...');
//                 pages.push(totalPages);
//             }
//         }
//         return pages;
//     };

//     return (
//         <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
//             <div className="flex justify-between flex-1 sm:hidden">
//                 <button
//                     onClick={() => onPageChange(pageNumber - 1)}
//                     disabled={pageNumber <= 1}
//                     className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                     Previous
//                 </button>
//                 <button
//                     onClick={() => onPageChange(pageNumber + 1)}
//                     disabled={pageNumber >= totalPages}
//                     className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                     Next
//                 </button>
//             </div>
//             <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
//                 <div>
//                     <p className="text-sm text-gray-700">
//                         Showing <span className="font-medium">{startItem}</span> to{' '}
//                         <span className="font-medium">{endItem}</span> of{' '}
//                         <span className="font-medium">{totalCount}</span> results
//                     </p>
//                 </div>
//                 <div>
//                     <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
//                         <button
//                             onClick={() => onPageChange(pageNumber - 1)}
//                             disabled={pageNumber <= 1}
//                             className="relative inline-flex items-center px-2 py-2 text-gray-400 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 hover:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
//                         >
//                             <span className="sr-only">Previous</span>
//                             <ChevronLeft className="w-5 h-5" aria-hidden="true" />
//                         </button>
//                         {getPageNumbers().map((page, index) => (
//                             page === '...' ? (
//                                 <span
//                                     key={index}
//                                     className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300"
//                                 >
//                                     ...
//                                 </span>
//                             ) : (
//                                 <button
//                                     key={page}
//                                     onClick={() => onPageChange(page)}
//                                     className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border ${
//                                         page === pageNumber
//                                             ? 'z-10 bg-[#48019F] border-[#48019F] text-white'
//                                             : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700'
//                                     }`}
//                                 >
//                                     {page}
//                                 </button>
//                             )
//                         ))}
//                         <button
//                             onClick={() => onPageChange(pageNumber + 1)}
//                             disabled={pageNumber >= totalPages}
//                             className="relative inline-flex items-center px-2 py-2 text-gray-400 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 hover:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
//                         >
//                             <span className="sr-only">Next</span>
//                             <ChevronRight className="w-5 h-5" aria-hidden="true" />
//                         </button>
//                     </nav>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default Pagination;

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function Pagination({ paginationData, onPageChange }) {
    if (!paginationData || paginationData.totalPages <= 1) return null;

    const { pageNumber, totalPages, totalCount, pageSize } = paginationData;
    const startItem = (pageNumber - 1) * pageSize + 1;
    const endItem = Math.min(pageNumber * pageSize, totalCount);

    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        
        if (totalPages <= maxVisiblePages) {
            // Show all pages if total pages is less than or equal to maxVisiblePages
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            const halfVisible = Math.floor(maxVisiblePages / 2);
            let startPage = Math.max(1, pageNumber - halfVisible);
            let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
            
            // Adjust startPage if we're near the end
            if (endPage - startPage < maxVisiblePages - 1) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }
            
            // Add first page if not in range
            if (startPage > 1) {
                pages.push(1);
                // Add ellipsis only if there's a gap (more than 1 page difference)
                if (startPage > 2) {
                    pages.push('ellipsis-left');
                }
            }
            
            // Add pages in the calculated range
            for (let i = startPage; i <= endPage; i++) {
                // Avoid duplicating first and last pages
                if (i !== 1 && i !== totalPages) {
                    pages.push(i);
                } else if (pages.length === 0 || pages[pages.length - 1] !== i) {
                    // Only add if it's not already in the array
                    pages.push(i);
                }
            }
            
            // Add last page if not in range
            if (endPage < totalPages) {
                // Add ellipsis only if there's a gap (more than 1 page difference)
                if (endPage < totalPages - 1) {
                    pages.push('ellipsis-right');
                }
                // Only add last page if it's not already in the array
                if (pages[pages.length - 1] !== totalPages) {
                    pages.push(totalPages);
                }
            }
        }
        
        // Remove any duplicate consecutive pages (safety check)
        const uniquePages = [];
        for (let i = 0; i < pages.length; i++) {
            if (i === 0 || pages[i] !== pages[i - 1]) {
                uniquePages.push(pages[i]);
            }
        }
        
        return uniquePages;
    };

    const handleEllipsisClick = (type) => {
        if (type === 'ellipsis-left') {
            const targetPage = Math.max(1, pageNumber - 5);
            onPageChange(targetPage);
        } else if (type === 'ellipsis-right') {
            const targetPage = Math.min(totalPages, pageNumber + 5);
            onPageChange(targetPage);
        }
    };

    return (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
            <div className="flex justify-between flex-1 sm:hidden">
                <button
                    onClick={() => onPageChange(pageNumber - 1)}
                    disabled={pageNumber <= 1}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Previous
                </button>
                <button
                    onClick={() => onPageChange(pageNumber + 1)}
                    disabled={pageNumber >= totalPages}
                    className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{startItem}</span> to{' '}
                        <span className="font-medium">{endItem}</span> of{' '}
                        <span className="font-medium">{totalCount}</span> results
                    </p>
                </div>
                <div>
                    <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <button
                            onClick={() => onPageChange(pageNumber - 1)}
                            disabled={pageNumber <= 1}
                            className="relative inline-flex items-center px-2 py-2 text-gray-400 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 hover:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="sr-only">Previous</span>
                            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                        </button>
                        {getPageNumbers().map((page, index) => {
                            if (typeof page === 'string' && page.startsWith('ellipsis')) {
                                return (
                                    <button
                                        key={`${page}-${index}`}
                                        onClick={() => handleEllipsisClick(page)}
                                        className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-500 cursor-pointer"
                                        title={page === 'ellipsis-left' ? 'Go back 5 pages' : 'Go forward 5 pages'}
                                    >
                                        ...
                                    </button>
                                );
                            }
                            
                            return (
                                <button
                                    key={`page-${page}-${index}`}
                                    onClick={() => onPageChange(page)}
                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border ${
                                        page === pageNumber
                                            ? 'z-10 bg-[#48019F] border-[#48019F] text-white'
                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                    }`}
                                >
                                    {page}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => onPageChange(pageNumber + 1)}
                            disabled={pageNumber >= totalPages}
                            className="relative inline-flex items-center px-2 py-2 text-gray-400 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 hover:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="sr-only">Next</span>
                            <ChevronRight className="w-5 h-5" aria-hidden="true" />
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
}

export default Pagination;