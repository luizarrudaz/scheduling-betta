import { useState, useMemo } from 'react';

export const usePagination = <T,>(
  fullData: T[],
  itemsPerPage: number
) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(fullData.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return fullData.slice(startIndex, endIndex);
  }, [fullData, currentPage, itemsPerPage]);

  const nextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const prevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToPage = (page: number) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  };

  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [fullData.length, totalPages]);


  return {
    currentPage,
    totalPages,
    paginatedData,
    setCurrentPage: goToPage,
    nextPage,
    prevPage,
  };
};