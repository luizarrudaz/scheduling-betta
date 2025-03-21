import { isSameDay, parseISO, format } from 'date-fns';
import { AnimatePresence, motion } from "framer-motion";
import { generateAllSlots } from './utils';
import { TimeSlot } from './types';
import { useState } from 'react';
import ScheduleModal from './ScheduleModal';

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
  const allSlots = generateAllSlots(selectedDay);
  const occupiedTimes = occupiedSlots
    .filter(slot => isSameDay(parseISO(slot.startDatetime), selectedDay))
    .map(slot => format(parseISO(slot.startDatetime), 'HH:mm'));

  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const handleTimeClick = (time: string) => {
    setSelectedTime(time);
  };

  const handleCloseModal = () => {
    setSelectedTime(null);
  };

  const handleConfirmSchedule = () => {
    console.log('Agendando:', selectedTime);
    handleCloseModal();
  };

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

          <div className="overflow-y-auto pr-2" style={{ maxHeight: '240px' }}>
            <div className="grid grid-cols-4 gap-3">
              {allSlots.map((slot, index) => {
                const isOccupied = occupiedTimes.includes(slot.startTime);
                return (
                  <motion.div
                    key={index}
                    className={`p-3 rounded-lg ${isOccupied
                      ? 'bg-red-100 cursor-not-allowed'
                      : 'bg-gray-50 hover:bg-gray-100 cursor-pointer'
                    }`}
                    whileHover={{ scale: isOccupied ? 1 : 1.03 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    onClick={() => !isOccupied && handleTimeClick(slot.startTime)}
                  >
                    <span className={`font-medium ${isOccupied ? 'text-red-500' : 'text-gray-900'}`}>
                      {slot.startTime}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <ScheduleModal
            isOpen={!!selectedTime}
            selectedTime={selectedTime || ''}
            onClose={handleCloseModal}
            onSchedule={handleConfirmSchedule}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
