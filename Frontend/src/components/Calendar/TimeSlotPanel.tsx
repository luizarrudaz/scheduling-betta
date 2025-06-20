import { isSameDay, parseISO, format } from 'date-fns';
import { AnimatePresence, motion } from "framer-motion";
import { generateSlotsForEvent } from './utils';
import { useState, useMemo } from 'react';
import ScheduleModal from './ScheduleModal';
import { useCreateSchedule } from '../../hooks/Schedules/useCreateSchedule';
import { Event } from '../Types/Event/Event';
import { ScheduledEvent } from '../Types/Schedule/Schedule';
import { useAuthContext } from '../../context/AuthContext';
import { useCancelSchedule } from '../../hooks/Schedules/useCancelSchedule';

interface TimeSlotsPanelProps {
  isExpanded: boolean;
  selectedDay: Date;
  selectedEvent: Event | null;
  occupiedSlots: ScheduledEvent[];
  onScheduleSuccess: () => void;
}

export default function TimeSlotsPanel({
  isExpanded,
  selectedDay,
  selectedEvent,
  occupiedSlots,
  onScheduleSuccess
}: TimeSlotsPanelProps) {

  const { createSchedule, isLoading: isScheduling, error: scheduleError, setError: setScheduleError } = useCreateSchedule();
  const { cancelSchedule, isLoading: isCancelling, error: cancelError, setError: setCancelError } = useCancelSchedule();
  const { sid } = useAuthContext();
  
  const [selectedSlot, setSelectedSlot] = useState<{time: string, scheduleId?: number} | null>(null);

  const allSlots = useMemo(() => {
    if (!selectedEvent) return [];
    return generateSlotsForEvent(selectedEvent, selectedDay);
  }, [selectedEvent, selectedDay]);

  const occupiedTimeMap = useMemo(() => {
    const map = new Map<string, {isMine: boolean, scheduleId: number}>();
    occupiedSlots
      .filter(slot => isSameDay(parseISO(slot.selectedSlot), selectedDay))
      .forEach(slot => {
        map.set(format(parseISO(slot.selectedSlot), 'HH:mm'), {
          isMine: slot.userId?.trim().toUpperCase() === sid?.trim().toUpperCase(),
          scheduleId: slot.id
        });
      });
    return map;
  }, [occupiedSlots, selectedDay, sid]);

  const handleTimeClick = (time: string, scheduleId?: number) => {
    setScheduleError(null);
    setCancelError(null);
    setSelectedSlot({ time, scheduleId });
  };

  const handleCloseModal = () => {
    setSelectedSlot(null);
  };

  const handleConfirmSchedule = async () => {
    if (!selectedSlot || !selectedEvent) return;
    const [hours, minutes] = selectedSlot.time.split(':').map(Number);
    const slotDateTime = new Date(selectedDay);
    slotDateTime.setHours(hours, minutes, 0, 0);
    const payload = {
        eventId: selectedEvent.id,
        selectedSlot: slotDateTime.toISOString(),
    };
    const success = await createSchedule(payload);
    if (success) {
        onScheduleSuccess();
        handleCloseModal();
    }
  };

  const handleConfirmCancel = async () => {
    if (!selectedSlot?.scheduleId) return;
    const success = await cancelSchedule(selectedSlot.scheduleId);
    if(success) {
      onScheduleSuccess();
      handleCloseModal();
    }
  }

  return (
    <AnimatePresence>
      {isExpanded && selectedEvent && (
        <motion.div
          className="border-l border-gray-200 pl-6 flex-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <h2 className="font-semibold text-gray-900 mb-4">
            Horários para <span className='text-[#FA7014]'>{selectedEvent.title}</span> em {format(selectedDay, 'dd/MM/yyyy')}
          </h2>

          <div className="overflow-y-auto pr-2" style={{ maxHeight: '240px' }}>
            {allSlots.length > 0 ? (
                <div className="grid grid-cols-4 gap-3">
                {allSlots.map((slot, index) => {
                    const occupation = occupiedTimeMap.get(slot.startTime);
                    const isOccupied = !!occupation;
                    const isMine = occupation?.isMine ?? false;
                    const isBreak = slot.isBreak;

                    let bgColor = 'bg-gray-50 hover:bg-gray-100 cursor-pointer';
                    let textColor = 'text-gray-900';
                    let cursor = 'cursor-pointer';

                    if (isBreak) {
                        bgColor = 'bg-gray-200';
                        textColor = 'text-gray-500';
                        cursor = 'cursor-not-allowed';
                    } else if (isMine) {
                      bgColor = 'bg-green-100 hover:bg-green-200';
                      textColor = 'text-green-800';
                    } else if (isOccupied) {
                      bgColor = 'bg-red-100';
                      textColor = 'text-red-500';
                      cursor = 'cursor-not-allowed';
                    }

                    return (
                    <motion.div
                        key={index}
                        className={`p-3 rounded-lg text-center ${bgColor} ${cursor} transition-colors duration-150`}
                        whileHover={{ scale: (isOccupied && !isMine) || isBreak ? 1 : 1.03 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        onClick={() => (!isOccupied || isMine) && !isBreak ? handleTimeClick(slot.startTime, occupation?.scheduleId) : null}
                    >
                        <span className={`font-medium ${textColor}`}>
                          {slot.startTime}
                        </span>
                    </motion.div>
                    );
                })}
                </div>
            ) : (
                <div className="text-center text-gray-500 py-10">
                    Nenhum horário disponível para este dia.
                </div>
            )}
          </div>

          <ScheduleModal
            isOpen={!!selectedSlot}
            isCancelling={!!selectedSlot?.scheduleId}
            selectedTime={selectedSlot?.time || ''}
            onClose={handleCloseModal}
            onSchedule={handleConfirmSchedule}
            onCancel={handleConfirmCancel}
            isLoading={isScheduling || isCancelling}
            error={scheduleError || cancelError}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}