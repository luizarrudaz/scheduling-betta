import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useUserSchedules } from "../hooks/Schedules/useUserSchedules.tsx";
import UserSchedulesTable from "../components/Schedules/UserScheduleTable.tsx";
import LogoutButton from "../components/LogoutButton/LogoutButton.tsx";
import { ScheduledEvent } from "../types/Schedule/Schedule.tsx";
import { useCancelSchedule } from "../hooks/Schedules/useCancelSchedule.tsx";
import AppNav from "../components/Nav/AppNav.tsx";
import { useNavigate } from "react-router-dom";
import ScheduleModal from "../components/Calendar/ScheduleModal.tsx";
import { format } from "date-fns";

type SortKey = keyof ScheduledEvent | 'event.title' | 'event.sessionDuration' | 'selectedSlot' | 'createdAt';

const getSortableValue = (obj: ScheduledEvent, key: SortKey): any => {
  if (key.startsWith('event.')) {
    const eventKey = key.split('.')[1] as keyof ScheduledEvent['event'];
    return obj.event?.[eventKey];
  }
  return obj[key as keyof ScheduledEvent];
};

const comparator = (a: any, b: any, isAsc: boolean): number => {
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;

  if (a < b) return isAsc ? -1 : 1;
  if (a > b) return isAsc ? 1 : -1;
  
  return 0;
};

export default function MySchedulesPage() {
  const { schedules, loading, refetch } = useUserSchedules();
  const { cancelSchedule, isLoading: isCancelling, error: cancelError, setError: setCancelError } = useCancelSchedule();
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>({ key: 'selectedSlot', direction: 'ascending' });
  const [scheduleToCancel, setScheduleToCancel] = useState<ScheduledEvent | null>(null);

  useEffect(() => {
    if (cancelError) {
      alert(cancelError);
      setCancelError(null);
    }
  }, [cancelError, setCancelError]);

  const handleOpenCancelModal = (scheduleId: number) => {
    const schedule = sortedSchedules.find(s => s.id === scheduleId);
    if (schedule) {
      setScheduleToCancel(schedule);
    }
  };

  const handleCloseModal = () => {
    setScheduleToCancel(null);
  };

  const handleConfirmCancel = async () => {
    if (!scheduleToCancel) return;

    const success = await cancelSchedule(scheduleToCancel.id);
    if (success) {
      refetch();
      handleCloseModal();
    }
  };

  const sortedSchedules = useMemo(() => {
    const now = new Date();
    const futureSchedules = schedules.filter(schedule => 
      schedule.selectedSlot && new Date(schedule.selectedSlot) > now
    );

    if (!sortConfig) {
      return futureSchedules;
    }

    const { key, direction } = sortConfig;
    const isAsc = direction === 'ascending';
    const dateKeys: SortKey[] = ['selectedSlot', 'createdAt'];

    futureSchedules.sort((a, b) => {
      const valA = getSortableValue(a, key);
      const valB = getSortableValue(b, key);

      if (dateKeys.includes(key)) {
        const timeA = valA ? new Date(valA).getTime() : null;
        const timeB = valB ? new Date(valB).getTime() : null;
        return comparator(timeA, timeB, isAsc);
      }

      return comparator(valA, valB, isAsc);
    });

    return futureSchedules;
  }, [schedules, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const isLoading = loading;

  return (
    <div className="h-screen w-screen bg-gray-50 flex flex-col px-6 py-10 relative">
      <AppNav />
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex justify-end mb-4">
          <LogoutButton />
        </div>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-extrabold text-gray-800 text-center mb-10"
        >
          Meus Agendamentos
        </motion.h1>

        {isLoading ? (
          <LoadingSkeleton />
        ) : sortedSchedules.length === 0 ? (
          <NoSchedules
            message="Você ainda não tem agendamentos."
            buttonText="Fazer um agendamento"
          />
        ) : (
          <UserSchedulesTable
            schedules={sortedSchedules}
            onSort={requestSort}
            sortConfig={sortConfig}
            onCancel={handleOpenCancelModal}
            disabled={isCancelling}
          />
        )}
      </div>

      {scheduleToCancel && (
        <ScheduleModal
          isOpen={!!scheduleToCancel}
          isCancelling={true}
          selectedTime={format(new Date(scheduleToCancel.selectedSlot), 'dd/MM/yyyy HH:mm')}
          onClose={handleCloseModal}
          onSchedule={() => {}}
          onCancel={handleConfirmCancel}
          isLoading={isCancelling}
          error={cancelError}
        />
      )}
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
        <div key="skeleton-1" className="flex space-x-4 animate-pulse"><div className="h-6 bg-gray-200 rounded w-1/3" /><div className="h-6 bg-gray-200 rounded w-1/6" /><div className="h-6 bg-gray-200 rounded w-1/4" /><div className="h-6 bg-gray-200 rounded w-1/6" /></div>
        <div key="skeleton-2" className="flex space-x-4 animate-pulse"><div className="h-6 bg-gray-200 rounded w-1/3" /><div className="h-6 bg-gray-200 rounded w-1/6" /><div className="h-6 bg-gray-200 rounded w-1/4" /><div className="h-6 bg-gray-200 rounded w-1/6" /></div>
        <div key="skeleton-3" className="flex space-x-4 animate-pulse"><div className="h-6 bg-gray-200 rounded w-1/3" /><div className="h-6 bg-gray-200 rounded w-1/6" /><div className="h-6 bg-gray-200 rounded w-1/4" /><div className="h-6 bg-gray-200 rounded w-1/6" /></div>
    </motion.div>
);

const NoSchedules = ({ message, buttonText }: { message: string; buttonText: string; }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center h-[50vh]"
    >
      <div className="text-center py-6 px-6 bg-white rounded-2xl shadow-xl w-80">
        <p className="text-gray-600 text-lg mb-4">{message}</p>
        <motion.button
          onClick={() => navigate('/eventos')}
          className="w-full bg-[#FA7014] text-white py-3 rounded-xl font-semibold hover:bg-[#E55F00] transition-all duration-300"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
        >
          {buttonText}
        </motion.button>
      </div>
    </motion.div>
  )
};