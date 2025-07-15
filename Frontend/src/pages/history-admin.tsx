import { useState, useMemo } from "react";
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

type SortKey = keyof ScheduledEvent | 'event.title' | 'event.sessionDuration' | 'selectedSlot' | 'displayName' | 'email' | 'createdAt';

export default function AdminHistoryPage() {
  const { schedules, loading } = useAllSchedules();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>({ key: 'selectedSlot', direction: 'descending' });

  const filteredAndSortedSchedules = useMemo(() => {
    let searchableSchedules = schedules.filter(schedule => {
      const eventTitle = schedule.event?.title?.toLowerCase() || '';
      const userName = schedule.displayName?.toLowerCase() || '';
      const userEmail = schedule.email?.toLowerCase() || '';
      const term = searchTerm.toLowerCase();
      return eventTitle.includes(term) || userName.includes(term) || userEmail.includes(term);
    });

    if (sortConfig !== null) {
      searchableSchedules.sort((a, b) => {
        let aValue: any, bValue: any;
        const key = sortConfig.key;

        if (key.startsWith('event.')) {
          const eventKey = key.split('.')[1] as keyof ScheduledEvent['event'];
          aValue = a.event?.[eventKey];
          bValue = b.event?.[eventKey];
        } else {
          aValue = a[key as keyof ScheduledEvent];
          bValue = b[key as keyof ScheduledEvent];
        }

        if (aValue == null) return 1;
        if (bValue == null) return -1;

        if (key === 'selectedSlot' || key === 'createdAt') {
          const dateA = new Date(aValue as string);
          const dateB = new Date(bValue as string);
          if (dateA.getTime() < dateB.getTime()) return sortConfig.direction === 'ascending' ? -1 : 1;
          if (dateA.getTime() > dateB.getTime()) return sortConfig.direction === 'ascending' ? 1 : -1;
          return 0;
        }

        if (typeof aValue === 'string') {
          return aValue.localeCompare(bValue, 'pt-BR', { sensitivity: 'base' }) * (sortConfig.direction === 'ascending' ? 1 : -1);
        }

        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;

        return 0;
      });
    }

    return searchableSchedules;
  }, [schedules, searchTerm, sortConfig]);

  const {
    currentPage,
    totalPages,
    paginatedData,
    setCurrentPage,
  } = usePagination(filteredAndSortedSchedules, 8);

  const requestSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleCsvDownload = () => {
    console.log("Download CSV: usar 'filteredAndSortedSchedules'", filteredAndSortedSchedules);
  };

  const handleXlsxDownload = () => {
    console.log("Download XLSX: usar 'filteredAndSortedSchedules'", filteredAndSortedSchedules);
  };

  return (
    <div className="h-screen w-screen bg-gray-50 flex flex-col px-6 py-10 relative">
      <AdminNav />
      <div className="w-full max-w-5xl mx-auto">
        <div className="flex justify-end mb-4">
          <LogoutButton />
        </div>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-extrabold text-gray-800 text-center mb-10"
        >
          Histórico de Agendamentos
        </motion.h1>

        <div className="mb-8 flex justify-center items-center gap-4">
          <div className="relative flex-grow max-w-lg">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
            </span>
            <input
              type="text"
              placeholder="Buscar por evento, nome ou e-mail..."
              className="w-full border-b-2 border-gray-200 focus:outline-none focus:border-[#FA7014] py-2 pl-10 pr-4 bg-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <DownloadButton onCsvDownload={handleCsvDownload} onXlsxDownload={handleXlsxDownload} />
        </div>

        {loading ? (
          <LoadingSkeleton />
        ) : filteredAndSortedSchedules.length === 0 ? (
          <NoSchedules message="Nenhum agendamento no histórico." />
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
    className="space-y-4 w-full max-w-5xl mx-auto"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex space-x-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4" />
        <div className="h-6 bg-gray-200 rounded w-1/4" />
        <div className="h-6 bg-gray-200 rounded w-1/4" />
        <div className="h-6 bg-gray-200 rounded w-1/6" />
        <div className="h-6 bg-gray-200 rounded w-1/6" />
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
    <div className="text-center py-6 px-6 bg-white rounded-2xl shadow-xl w-80">
      <p className="text-gray-600 text-lg">{message}</p>
    </div>
  </motion.div>
);
