import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useUserSchedules } from "../hooks/Schedules/useUserSchedules.tsx";
import UserSchedulesTable from "../components/Schedules/UserScheduleTable.tsx";
import LogoutButton from "../components/LogoutButton/LogoutButton.tsx";
import { ScheduledEvent } from "../types/Schedule/Schedule.tsx"; 
import { useCancelSchedule } from "../hooks/Schedules/useCancelSchedule.tsx";
import AppNav from "../components/Nav/AppNav.tsx";
import { useNavigate } from "react-router-dom";

type SortKey = keyof ScheduledEvent | 'event.title' | 'event.sessionDuration' | 'selectedSlot' | 'createdAt';

export default function MySchedulesPage() {
  const { schedules, loading, refetch } = useUserSchedules();
  const { cancelSchedule, isLoading: isCancelling, error: cancelError } = useCancelSchedule();
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>({ key: 'selectedSlot', direction: 'ascending' });

  useEffect(() => {
    if (cancelError) {
      alert(cancelError);
    }
  }, [cancelError]);

  const handleCancel = async (scheduleId: number) => {
    if (window.confirm("Tem certeza que deseja cancelar este agendamento?")) {
      const success = await cancelSchedule(scheduleId);
      if (success) {
        refetch();
      }
    }
  };
  
  const sortedSchedules = useMemo(() => {
    const now = new Date();
    
    const futureSchedules = schedules.filter(schedule => {
        if (!schedule.selectedSlot) return false;
        try {
            return new Date(schedule.selectedSlot) > now;
        } catch {
            return false;
        }
    });

    if (sortConfig !== null) {
      futureSchedules.sort((a, b) => {
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
            if (dateA < dateB) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (dateA > dateB) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        }

        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        
        return 0;
      });
    }

    return futureSchedules;
  }, [schedules, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const isLoading = loading || isCancelling;

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
                onCancel={handleCancel}
                disabled={isCancelling}
            />
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
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex space-x-4 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-6 bg-gray-200 rounded w-1/6" />
          <div className="h-6 bg-gray-200 rounded w-1/4" />
          <div className="h-6 bg-gray-200 rounded w-1/6" />
        </div>
      ))}
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