import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Event } from '../Types/Event/Event';

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
};

export default function EventsTable({ events, onEdit }: { events: Event[], onEdit: (event: Event) => void }) {
  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {['Evento', 'Local', 'Data', 'Vagas', 'Ações'].map((header, index) => (
                <th
                  key={index}
                  className="px-4 py-3 text-left text-sm font-medium text-gray-500 whitespace-nowrap"
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
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-4 text-gray-800 max-w-xs truncate">{event.nome}</td>
                  <td className="px-4 py-4 text-gray-600">{event.localidade}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm">
                        {format(new Date(event.dataInicio), 'dd/MM/yy HH:mm')}
                      </span>
                      <span className="text-xs text-gray-400">até</span>
                      <span className="text-sm">
                        {format(new Date(event.dataFim), 'dd/MM/yy HH:mm')}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                      {event.vagasDisponiveis} vagas
                    </span>
                  </td>
                  <td className="px-4 py-4 space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onEdit(event)}
                      className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100"
                    >
                      ✏️ Editar
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
                    >
                      🗑️ Excluir
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