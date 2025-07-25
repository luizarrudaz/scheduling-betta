import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ScheduledEvent } from '../../types/Schedule/Schedule';
import { XCircleIcon } from '@heroicons/react/24/outline';

const rowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 10 }
};

const formatEventName = (name: string): string => {
  if (name.length <= 28) {
    return name;
  }
  const words = name.split(' ');
  if (words.length <= 1) {
    return `${name.substring(0, 25)}...`;
  }
  return `${words[0]}... ${words[words.length - 1]}`;
};

const formatUserName = (name: string): string => {
  const words = name.split(' ');
  if (words.length <= 1) {
    return name;
  }
  return `${words[0]} ${words[words.length - 1]}`;
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

type SortKey = keyof ScheduledEvent | 'event.title' | 'event.sessionDuration' | 'selectedSlot' | 'displayName' | 'email';

interface SchedulesTableProps {
  schedules: ScheduledEvent[];
  onSort: (key: SortKey) => void;
  sortConfig: { key: SortKey; direction: 'ascending' | 'descending' } | null;
  showActions?: boolean;
  onCancel?: (scheduleId: number) => void;
  disabled?: boolean;
}

const SortableHeader = ({ label, sortKey, onSort, sortConfig, isCentered = false }: {
  label: string;
  sortKey: SortKey;
  onSort: (key: SortKey) => void;
  sortConfig: SchedulesTableProps['sortConfig'];
  isCentered?: boolean;
}) => {
  const isSorted = sortConfig?.key === sortKey;
  let sortIcon = '';
  if (isSorted) {
    sortIcon = sortConfig?.direction === 'ascending' ? '▲' : '▼';
  }

  const alignmentClass = isCentered ? 'text-center' : 'text-left';

  return (
    <th
      className={`px-5 py-4 ${alignmentClass} text-sm font-semibold text-neutral-600 dark:text-neutral-300 whitespace-nowrap cursor-pointer select-none`}
      onClick={() => onSort(sortKey)}
    >
      {label} {sortIcon}
    </th>
  );
};

export default function SchedulesTable({
  schedules,
  onSort,
  sortConfig,
  showActions = true,
  onCancel,
  disabled = false
}: SchedulesTableProps) {
  return (
    <motion.div
      className="bg-white dark:bg-neutral-800 rounded-xl shadow-medium overflow-hidden border border-neutral-200 dark:border-neutral-700"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-max divide-y divide-neutral-200 dark:divide-neutral-700">
          <thead className="bg-neutral-50 dark:bg-neutral-900/50">
            <tr>
              <SortableHeader label="Evento" sortKey="event.title" onSort={onSort} sortConfig={sortConfig} />
              <SortableHeader label="Nome" sortKey="displayName" onSort={onSort} sortConfig={sortConfig} />
              <SortableHeader label="Email" sortKey="email" onSort={onSort} sortConfig={sortConfig} />
              <SortableHeader label="Duração" sortKey="event.sessionDuration" onSort={onSort} sortConfig={sortConfig} isCentered={true} />
              <SortableHeader label="Data" sortKey="selectedSlot" onSort={onSort} sortConfig={sortConfig} />
              {showActions && (
                <th className="px-5 py-4 text-center text-sm font-semibold text-neutral-600 dark:text-neutral-300">Ações</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
            <AnimatePresence>
              {schedules.map((schedule) => (
                <motion.tr
                  key={schedule.id}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                  className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
                >
                  <td className="px-5 py-4 text-neutral-800 dark:text-neutral-100 whitespace-nowrap font-medium" title={schedule.event?.title}>{formatEventName(schedule.event?.title || 'N/A')}</td>
                  <td className="px-5 py-4 text-neutral-600 dark:text-neutral-300 whitespace-nowrap" title={schedule.displayName}>{formatUserName(schedule.displayName || 'N/A')}</td>
                  <td className="px-5 py-4 text-neutral-600 dark:text-neutral-300 whitespace-nowrap max-w-[220px] truncate" title={schedule.email}>{schedule.email}</td>
                  <td className="px-5 py-4 whitespace-nowrap text-center">
                    <span className="bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 px-2 py-1 rounded-full text-xs font-medium">
                      {schedule.event?.sessionDuration || 'N/A'} min
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-neutral-700 dark:text-neutral-200 whitespace-nowrap">
                    {safeFormat(schedule.selectedSlot, 'dd/MM/yyyy HH:mm')}
                  </td>
                  {showActions && (
                    <td className="px-5 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => onCancel && onCancel(schedule.id)}
                        disabled={disabled}
                        className="text-neutral-400 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Cancelar Agendamento"
                      >
                        <XCircleIcon className="w-6 h-6" />
                      </button>
                    </td>
                  )}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}