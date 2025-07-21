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
              ? 'bg-primary text-white shadow-soft'
              : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-600'
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