import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ScheduledEvent } from '../Types/Schedule/Schedule';
import { PencilIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const rowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 10 }
};

const safeFormat = (date: Date | string | null, formatStr: string) => {
  if (!date) return 'N/A';
  try {
    const d = date instanceof Date ? date : new Date(date);
    return isNaN(d.getTime()) ? 'Data inválida' : format(d, formatStr);
  } catch {
    return 'Data inválida';
  }
};

type SortKey = keyof ScheduledEvent | 'event.title' | 'event.sessionDuration' | 'selectedSlot';

interface UserSchedulesTableProps {
  schedules: ScheduledEvent[];
  onSort: (key: SortKey) => void;
  sortConfig: { key: SortKey; direction: 'ascending' | 'descending' } | null;
  onCancel: (scheduleId: number) => void;
  disabled: boolean;
}

const SortableHeader = ({
  label,
  sortKey,
  onSort,
  sortConfig
}: {
  label: string;
  sortKey: SortKey;
  onSort: (key: SortKey) => void;
  sortConfig: UserSchedulesTableProps['sortConfig'];
}) => {
  const isSorted = sortConfig?.key === sortKey;
  const sortIcon = isSorted ? (sortConfig?.direction === 'ascending' ? '▲' : '▼') : '';

  return (
    <th
      className="px-5 py-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap cursor-pointer select-none"
      onClick={() => onSort(sortKey)}
    >
      {label} {sortIcon}
    </th>
  );
};

export default function MySchedulesTable({ schedules, onSort, sortConfig, onCancel, disabled }: UserSchedulesTableProps) {
  const navigate = useNavigate();

  const handleEdit = (schedule: ScheduledEvent) => {
    if (schedule.event) {
      navigate('/eventos', { state: { eventIdToSelect: schedule.event.id } });
    }
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-max divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortableHeader label="Evento" sortKey="event.title" onSort={onSort} sortConfig={sortConfig} />
              <SortableHeader label="Duração" sortKey="event.sessionDuration" onSort={onSort} sortConfig={sortConfig} />
              <SortableHeader label="Data Agendada" sortKey="selectedSlot" onSort={onSort} sortConfig={sortConfig} />
              <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <AnimatePresence>
              {schedules.map((schedule) => (
                <motion.tr
                  key={schedule.id}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-5 py-4 text-gray-800 whitespace-nowrap font-medium">{schedule.event?.title || 'N/A'}</td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                      {schedule.event?.sessionDuration || 'N/A'} min
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">
                    {safeFormat(schedule.selectedSlot, 'dd/MM/yyyy HH:mm')}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEdit(schedule)}
                      className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
                      title="Editar Agendamento"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onCancel(schedule.id)}
                      disabled={disabled}
                      className="p-2 rounded-full text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                      title="Cancelar Agendamento"
                    >
                      <XCircleIcon className="w-6 h-6" />
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}