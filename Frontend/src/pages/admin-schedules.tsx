import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog } from '@headlessui/react';
import { MagnifyingGlassIcon, ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/24/outline";
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
import { format } from "date-fns";

type SortKey = keyof ScheduledEvent | 'event.title' | 'event.sessionDuration' | 'selectedSlot' | 'displayName' | 'email' | 'createdAt';

export default function AdminSchedules() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>({ key: 'selectedSlot', direction: 'ascending' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scheduleToCancel, setScheduleToCancel] = useState<ScheduledEvent | null>(null);

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

  const handleOpenCancelModal = (scheduleId: number) => {
    const schedule = schedules.find(s => s.id === scheduleId);
    if (schedule) {
        setScheduleToCancel(schedule);
        setIsModalOpen(true);
    }
  };

  const handleConfirmCancel = async () => {
    if (!scheduleToCancel) return;
    await adminCancel(scheduleToCancel.id);
    setIsModalOpen(false);
    setScheduleToCancel(null);
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
              onCancel={handleOpenCancelModal}
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

      <AnimatePresence>
        {isModalOpen && scheduleToCancel && (
            <Dialog
                static
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col"
                >
                    <div className="p-6 flex items-start space-x-4">
                        <div className="flex-shrink-0 mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0">
                            <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                        </div>
                        <div className="flex-grow">
                            <Dialog.Title as="h3" className="text-lg font-bold text-gray-900">
                                Confirmar Cancelamento
                            </Dialog.Title>
                            <div className="mt-2">
                                <p className="text-sm text-gray-600">
                                    Tem certeza que deseja cancelar o agendamento de {scheduleToCancel.displayName} para o evento "{scheduleToCancel.event.title}" no dia {format(new Date(scheduleToCancel.selectedSlot), 'dd/MM/yyyy HH:mm')}?
                                </p>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsModalOpen(false)}
                            disabled={isCancelling}
                            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </motion.button>
                    </div>
                    <div className="bg-gray-50 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 rounded-b-2xl">
                        <button type="button" disabled={isCancelling} className="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50" onClick={() => setIsModalOpen(false)}>
                            Voltar
                        </button>
                        <button type="button" disabled={isCancelling} className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 disabled:bg-red-400" onClick={handleConfirmCancel}>
                            {isCancelling ? 'Cancelando...' : 'Sim, Cancelar'}
                        </button>
                    </div>
                </motion.div>
            </Dialog>
        )}
      </AnimatePresence>
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
        <div className="flex space-x-4 animate-pulse"><div className="h-6 bg-gray-200 rounded w-1/4" /><div className="h-6 bg-gray-200 rounded w-1/4" /><div className="h-6 bg-gray-200 rounded w-1/4" /><div className="h-6 bg-gray-200 rounded w-1/6" /><div className="h-6 bg-gray-200 rounded w-1/6" /></div>
        <div className="flex space-x-4 animate-pulse"><div className="h-6 bg-gray-200 rounded w-1/4" /><div className="h-6 bg-gray-200 rounded w-1/4" /><div className="h-6 bg-gray-200 rounded w-1/4" /><div className="h-6 bg-gray-200 rounded w-1/6" /><div className="h-6 bg-gray-200 rounded w-1/6" /></div>
        <div className="flex space-x-4 animate-pulse"><div className="h-6 bg-gray-200 rounded w-1/4" /><div className="h-6 bg-gray-200 rounded w-1/4" /><div className="h-6 bg-gray-200 rounded w-1/4" /><div className="h-6 bg-gray-200 rounded w-1/6" /><div className="h-6 bg-gray-200 rounded w-1/6" /></div>
        <div className="flex space-x-4 animate-pulse"><div className="h-6 bg-gray-200 rounded w-1/4" /><div className="h-6 bg-gray-200 rounded w-1/4" /><div className="h-6 bg-gray-200 rounded w-1/4" /><div className="h-6 bg-gray-200 rounded w-1/6" /><div className="h-6 bg-gray-200 rounded w-1/6" /></div>
        <div className="flex space-x-4 animate-pulse"><div className="h-6 bg-gray-200 rounded w-1/4" /><div className="h-6 bg-gray-200 rounded w-1/4" /><div className="h-6 bg-gray-200 rounded w-1/4" /><div className="h-6 bg-gray-200 rounded w-1/6" /><div className="h-6 bg-gray-200 rounded w-1/6" /></div>
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