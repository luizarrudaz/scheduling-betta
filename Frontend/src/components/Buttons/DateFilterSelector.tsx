import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

interface DateFilterSelectorProps {
  availableYears: number[];
  onFilterChange: (filter: string) => void;
}

const DateFilterSelector = ({ availableYears, onFilterChange }: DateFilterSelectorProps) => {
  const [activeFilter, setActiveFilter] = useState('last3months');

  const filters = useMemo(() => {
    const currentYear = new Date().getFullYear();
    
    const baseFilters = [
      { key: 'last3months', label: 'Últimos 3 meses' },
      { key: 'last6months', label: 'Últimos 6 meses' },
      { key: 'thisyear', label: 'Este ano' },
    ];
    
    const yearFilters = availableYears
      .filter(year => year < currentYear)
      .map(year => ({ key: year.toString(), label: year.toString() }));

    return [...baseFilters, ...yearFilters];
  }, [availableYears]);

  const handleFilterClick = (filterKey: string) => {
    setActiveFilter(filterKey);
    onFilterChange(filterKey);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map(filter => (
        <motion.button
          key={filter.key}
          onClick={() => handleFilterClick(filter.key)}
          className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
            activeFilter === filter.key
              ? 'bg-[#FA7014] text-white shadow-md'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {filter.label}
        </motion.button>
      ))}
    </div>
  );
};

export default DateFilterSelector;