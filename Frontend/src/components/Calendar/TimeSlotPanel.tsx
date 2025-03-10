import { AnimatePresence, motion } from "framer-motion";
import { getAvailableTimeSlots } from './utils';
import { TimeSlot } from './types';

interface TimeSlotsPanelProps {
  isExpanded: boolean;
  selectedDay: Date;
  occupiedSlots: TimeSlot[];
}

export default function TimeSlotsPanel({
  isExpanded,
  selectedDay,
  occupiedSlots
}: TimeSlotsPanelProps) {
  const availableSlots = getAvailableTimeSlots(selectedDay, occupiedSlots);

  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          className="border-l border-gray-200 pl-6 flex-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <h2 className="font-semibold text-gray-900 mb-4">
            Horários disponíveis (sessões de 30m)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {availableSlots.map((slot, index) => (
              <motion.div
                key={index}
                className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="text-gray-900 font-medium">
                  {slot.startTime}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}