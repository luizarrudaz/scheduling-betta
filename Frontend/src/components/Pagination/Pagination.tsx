import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const getPageNumbers = () => {
    const pageNeighbours = 1; // Quantos vizinhos de cada lado do número atual
    const totalNumbers = (pageNeighbours * 2) + 1; // Total de números a mostrar (ex: 3)
    const totalBlocks = totalNumbers + 2; // Total incluindo "..." (ex: 5)

    if (totalPages <= totalBlocks) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const startPage = Math.max(2, currentPage - pageNeighbours);
    const endPage = Math.min(totalPages - 1, currentPage + pageNeighbours);
    let pages: (number | string)[] = Array.from({ length: (endPage - startPage) + 1 }, (_, i) => startPage + i);

    const hasLeftSpill = startPage > 2;
    const hasRightSpill = (totalPages - endPage) > 1;
    const spillOffset = totalNumbers - (pages.length + 1);

    switch (true) {
      case (hasLeftSpill && !hasRightSpill): {
        const extraPages = Array.from({ length: spillOffset }, (_, i) => startPage - i - 1).reverse();
        pages = [...extraPages, ...pages];
        break;
      }
      case (!hasLeftSpill && hasRightSpill): {
        const extraPages = Array.from({ length: spillOffset }, (_, i) => endPage + i + 1);
        pages = [...pages, ...extraPages];
        break;
      }
    }

    let finalPages: (string | number)[] = [1, ...pages, totalPages];

    if (hasLeftSpill) {
      finalPages.splice(1, 0, '...');
    }
    if (hasRightSpill) {
      finalPages.splice(finalPages.length - 1, 0, '...');
    }
    
    // Simplificação para mostrar sempre até 4 números como no exemplo
    if(totalPages > 4) {
      let start = Math.max(1, currentPage - 1);
      let end = Math.min(start + 3, totalPages);
      if (end - start < 3) {
        start = Math.max(1, end - 3);
      }
      const range = Array.from({ length: (end - start) + 1 }, (_, i) => start + i);

      const showStartEllipsis = start > 1;
      const showEndEllipsis = end < totalPages;

      finalPages = range;
      if(showStartEllipsis) finalPages.unshift('...');
      if(showEndEllipsis) finalPages.push('...');
      
      return finalPages;
    }
    
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  };

  const pages = getPageNumbers();
  if(totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-center space-x-2 mb-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-50 transition-colors"
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </button>

      {pages.map((page, index) =>
        typeof page === 'number' ? (
          <button
            key={index}
            onClick={() => onPageChange(page)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              currentPage === page
                ? 'bg-[#FA7014] text-white shadow-md'
                : 'text-gray-700 hover:bg-orange-50'
            } transition-colors`}
          >
            {page}
          </button>
        ) : (
          <span key={index} className="px-4 py-2 text-gray-500">
            {page}
          </span>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-50 transition-colors"
      >
        <ChevronRightIcon className="w-5 h-5" />
      </button>
    </nav>
  );
}