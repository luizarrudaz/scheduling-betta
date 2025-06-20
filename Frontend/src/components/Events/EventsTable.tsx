import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Event } from '../Types/Event/Event';
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

interface EventsTableProps {
  events: Event[];
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
}

export default function EventsTable({
  events,
  onEdit,
  onDelete
}: EventsTableProps) {
  return (
    <motion.div
      className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {['Evento', 'Local', 'Data', 'Duração', 'Ações'].map((header, index) => (
                <th
                  key={index}
                  className="px-5 py-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <AnimatePresence>
              {events.map((event) => (
                <motion.tr
                  key={event.id}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-5 py-4 text-gray-800 max-w-xs truncate font-medium">{event.title}</td>
                  <td className="px-5 py-4 text-gray-600">{event.location}</td>
                  <td className="px-5 py-4 text-sm text-gray-700">
                    {safeFormat(event.startTime, 'dd/MM/yyyy')}
                  </td>
                  <td className="px-5 py-4">
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                      {event.sessionDuration} min
                    </span>
                  </td>
                  <td className="px-5 py-4 space-x-2 flex items-center">
                    {/* 2. Botões com ícones */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onEdit(event)}
                      className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
                      title="Editar Evento"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onDelete(event)}
                      className="p-2 rounded-full text-red-500 hover:bg-red-50 transition-colors"
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