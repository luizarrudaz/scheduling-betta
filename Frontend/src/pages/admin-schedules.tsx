import { useState } from "react";
import { motion } from "framer-motion";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useAllSchedules } from "../hooks/Schedules/useAllSchedules.tsx";
import { useAdminCancelSchedule } from "../hooks/Schedules/useAdminCancelSchedule.tsx";
import SchedulesTable from "../components/Schedules/SchedulesTable.tsx";
import LogoutButton from "../components/LogoutButton/LogoutButton.tsx";
import { ScheduledEvent } from "../types/Schedule/Schedule.tsx";
import AdminNav from "../components/Nav/AppNav.tsx";
import DownloadButton from "../components/Buttons/DownloadButton.tsx";
import { usePagination } from "../hooks/usePagination.tsx";
import Pagination from "../components/Pagination/Pagination.tsx";
import { exportToCsv, exportToExcel } from "../utils/export.tsx";

type SortKey = keyof ScheduledEvent | 'event.title' | 'event.sessionDuration' | 'selectedSlot' | 'displayName' | 'email' | 'createdAt';

export default function AdminSchedules() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>({ key: 'selectedSlot', direction: 'ascending' });

  const { schedules, loading, refetch } = useAllSchedules({
    searchTerm,
    sortConfig,
    timeFilter: 'future'
  });

  const { adminCancel, isCancelling } = useAdminCancelSchedule();

  const {
    currentPage,
    totalPages,
    paginatedData,
    setCurrentPage,
  } = usePagination(schedules, 8);

  const requestSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleCancel = async (scheduleId: number) => {
    await adminCancel(scheduleId);
    refetch();
  };

  const handleCsvDownload = () => {
    exportToCsv(schedules, 'agendamentos_futuros.csv');
  };

  const handleXlsxDownload = () => {
    exportToExcel(schedules, 'agendamentos_futuros.xlsx');
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
          Gerenciar Agendamentos
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
        ) : schedules.length === 0 ? (
          <NoSchedules message="Nenhum agendamento futuro encontrado." />
        ) : (
          <>
            <SchedulesTable
              schedules={paginatedData}
              onSort={requestSort}
              sortConfig={sortConfig}
              onCancel={handleCancel}
              disabled={isCancelling}
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