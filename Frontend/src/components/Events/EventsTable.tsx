import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Event } from '../../types/Event/Event';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

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

type SortKey = 'title' | 'location' | 'startTime' | 'sessionDuration';

interface EventsTableProps {
  events: Event[];
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
  onSort: (key: SortKey) => void;
  sortConfig: { key: SortKey; direction: 'ascending' | 'descending' } | null;
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
    sortConfig: EventsTableProps['sortConfig'];
  }) => {
    const isSorted = sortConfig?.key === sortKey;
    const sortIcon = isSorted ? (sortConfig?.direction === 'ascending' ? '▲' : '▼') : '';
  
    return (
      <th
        className="px-5 py-4 text-left text-sm font-semibold text-neutral-600 dark:text-neutral-300 whitespace-nowrap cursor-pointer select-none"
        onClick={() => onSort(sortKey)}
      >
        {label} {sortIcon}
      </th>
    );
  };


export default function EventsTable({
  events,
  onEdit,
  onDelete,
  onSort,
  sortConfig
}: EventsTableProps) {
  return (
    <motion.div
      className="bg-white dark:bg-neutral-800 rounded-xl shadow-medium overflow-hidden border border-neutral-200 dark:border-neutral-700"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50 dark:bg-neutral-900/50">
            <tr>
                <SortableHeader label="Evento" sortKey="title" onSort={onSort} sortConfig={sortConfig} />
                <SortableHeader label="Local" sortKey="location" onSort={onSort} sortConfig={sortConfig} />
                <SortableHeader label="Data" sortKey="startTime" onSort={onSort} sortConfig={sortConfig} />
                <SortableHeader label="Duração" sortKey="sessionDuration" onSort={onSort} sortConfig={sortConfig} />
                <th className="px-5 py-4 text-left text-sm font-semibold text-neutral-600 dark:text-neutral-300 whitespace-nowrap">
                    Ações
                </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
            <AnimatePresence>
              {events.map((event) => (
                <motion.tr
                  key={event.id}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                  className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
                >
                  <td className="px-5 py-4 text-neutral-800 dark:text-neutral-100 max-w-xs truncate font-medium">{event.title}</td>
                  <td className="px-5 py-4 text-neutral-600 dark:text-neutral-300">{event.location}</td>
                  <td className="px-5 py-4 text-sm text-neutral-700 dark:text-neutral-200">
                    {safeFormat(event.startTime, 'dd/MM/yyyy HH:mm')}
                  </td>
                  <td className="px-5 py-4">
                    <span className="bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 px-2 py-1 rounded-full text-xs font-medium">
                      {event.sessionDuration} min
                    </span>
                  </td>
                  <td className="px-5 py-4 space-x-2 flex items-center">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onEdit(event)}
                      className="p-2 rounded-full text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors"
                      title="Editar Evento"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onDelete(event)}
                      className="p-2 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      title="Excluir Evento"
                    >
                      <TrashIcon className="w-5 h-5" />
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