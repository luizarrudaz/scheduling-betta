import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useAllSchedules } from "../hooks/Schedules/useAllSchedules.tsx";
import SchedulesTable from "../components/Schedules/SchedulesTable.tsx";
import LogoutButton from "../components/LogoutButton/LogoutButton.tsx";
import { ScheduledEvent } from "../types/Schedule/Schedule.tsx";
import AdminNav from "../components/Nav/AppNav.tsx";
import DownloadButton from "../components/Buttons/DownloadButton.tsx";
import { usePagination } from "../hooks/usePagination.tsx";
import Pagination from "../components/Pagination/Pagination.tsx";
import DateFilterSelector from "../components/Buttons/DateFilterSelector.tsx";
import api from "../services/api.tsx";
import { exportToCsv, exportToExcel } from "../utils/export.tsx";

type SortKey = keyof ScheduledEvent | 'event.title' | 'event.sessionDuration' | 'selectedSlot' | 'displayName' | 'email' | 'createdAt';

export default function AdminHistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>({ key: 'selectedSlot', direction: 'descending' });
  const [dateFilter, setDateFilter] = useState('last3months');
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  const { schedules, loading } = useAllSchedules({
    searchTerm,
    sortConfig,
    timeFilter: 'past',
    dateRangeFilter: dateFilter
  });

  const {
    currentPage,
    totalPages,
    paginatedData,
    setCurrentPage,
  } = usePagination(schedules, 8);

  useEffect(() => {
    const fetchYears = async () => {
        try {
            const { data } = await api.get<number[]>('/schedule-event/history-years');
            setAvailableYears(data);
        } catch (error) {
            console.error("Failed to fetch history years", error);
        }
    };
    fetchYears();
  }, []);

  const requestSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleDateFilterChange = (filter: string) => {
    setDateFilter(filter);
    setCurrentPage(1);
  };

  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
      setCurrentPage(1);
  };

  const handleCsvDownload = () => {
    exportToCsv(schedules, `historico_agendamentos_${dateFilter}.csv`);
  };

  const handleXlsxDownload = () => {
    exportToExcel(schedules, `historico_agendamentos_${dateFilter}.xlsx`);
  };

  return (
    <div className="min-h-screen w-screen flex flex-col px-6 py-10 relative">
      <AdminNav />
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex justify-end mb-4">
          <LogoutButton />
        </div>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-extrabold text-neutral-800 dark:text-neutral-100 text-center mb-6"
        >
          Histórico de Agendamentos
        </motion.h1>

        <div className="mb-6 flex flex-col md:flex-row justify-center items-center gap-4">
          <div className="relative flex-grow w-full md:w-auto md:max-w-lg">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="w-5 h-5 text-neutral-400" />
            </span>
            <input
              type="text"
              placeholder="Buscar por evento, nome ou e-mail..."
              className="w-full border-b-2 border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-primary py-2 pl-10 pr-4 bg-transparent text-neutral-800 dark:text-neutral-200"
              value={searchTerm}
              onChange={handleSearchTermChange}
            />
          </div>
          <DownloadButton onCsvDownload={handleCsvDownload} onXlsxDownload={handleXlsxDownload} />
        </div>

        <div className="mb-6">
            <DateFilterSelector availableYears={availableYears} onFilterChange={handleDateFilterChange} />
        </div>

        {loading ? (
          <LoadingSkeleton />
        ) : schedules.length === 0 ? (
          <NoSchedules message="Nenhum agendamento encontrado para o filtro selecionado." />
        ) : (
          <>
            <SchedulesTable
              schedules={paginatedData}
              onSort={requestSort}
              sortConfig={sortConfig}
              onCancel={() => {}}
              showActions={false}
            />
            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const LoadingSkeleton = () => (
  <motion.div
    className="space-y-4 w-full max-w-6xl mx-auto"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex space-x-4 animate-pulse">
        <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4" />
        <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4" />
        <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4" />
        <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-1/6" />
        <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-1/6" />
      </div>
    ))}
  </motion.div>
);

const NoSchedules = ({ message }: { message: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="flex flex-col items-center justify-center h-[40vh]"
  >
    <div className="text-center py-6 px-6 bg-white dark:bg-neutral-800 rounded-2xl shadow-medium w-80">
      <p className="text-neutral-600 dark:text-neutral-300 text-lg">{message}</p>
    </div>
  </motion.div>
);