import { isSameDay, parseISO, format } from 'date-fns';
import { AnimatePresence, motion } from "framer-motion";
import { generateSlotsForEvent } from '../../utils/calendar';
import { useState, useMemo } from 'react';
import ScheduleModal from './ScheduleModal';
import { useCreateSchedule } from '../../hooks/Schedules/useCreateSchedule';
import { Event } from '../../types/Event/Event';
import { useAuthContext } from '../../context/AuthContext';
import { useCancelSchedule } from '../../hooks/Schedules/useCancelSchedule';
import { OccupiedSlot } from '../../hooks/Schedules/useOccupiedSlots';

interface TimeSlotsPanelProps {
  isExpanded: boolean;
  selectedDay: Date;
  selectedEvent: Event | null;
  occupiedSlots: OccupiedSlot[];
  onScheduleSuccess: () => void;
  panelHeight: string;
}

export default function TimeSlotsPanel({
  isExpanded,
  selectedDay,
  selectedEvent,
  occupiedSlots,
  onScheduleSuccess,
  panelHeight,
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
      .filter(slot => isSameDay(parseISO(slot.scheduleTime), selectedDay))
      .forEach(slot => {
        map.set(format(parseISO(slot.scheduleTime), 'HH:mm'), {
          isMine: slot.userId?.trim().toUpperCase() === sid?.trim().toUpperCase(),
          scheduleId: slot.scheduleId
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
          className="border-l border-neutral-200 dark:border-neutral-700 pl-6 flex-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Horários para <span className='text-primary dark:text-primary-lighter'>{selectedEvent.title}</span> em {format(selectedDay, 'dd/MM/yyyy')}
          </h2>

          <div 
            className="overflow-y-auto pr-2 transition-all duration-300 ease-in-out"
            style={{ maxHeight: panelHeight }}
          >
            {allSlots.length > 0 ? (
                <div className="grid grid-cols-4 gap-3">
                {allSlots.map((slot) => {
                    const occupation = occupiedTimeMap.get(slot.startTime);
                    const isOccupied = !!occupation;
                    const isMine = occupation?.isMine ?? false;
                    const isBreak = slot.isBreak;

                    let bgColor = 'bg-neutral-50 dark:bg-neutral-700/50 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer';
                    let textColor = 'text-neutral-900 dark:text-neutral-100';
                    let cursor = 'cursor-pointer';

                    if (isBreak) {
                        bgColor = 'bg-neutral-200 dark:bg-neutral-600';
                        textColor = 'text-neutral-500 dark:text-neutral-400';
                        cursor = 'cursor-not-allowed';
                    } else if (isMine) {
                      bgColor = 'bg-green-100 dark:bg-green-900/50 hover:bg-green-200 dark:hover:bg-green-900';
                      textColor = 'text-green-800 dark:text-green-300';
                    } else if (isOccupied) {
                      bgColor = 'bg-red-100 dark:bg-red-900/40';
                      textColor = 'text-red-500 dark:text-red-400';
                      cursor = 'cursor-not-allowed';
                    }

                    return (
                    <div
                        key={slot.startTime}
                        className={`p-3 rounded-lg text-center ${bgColor} ${cursor} transition-colors duration-150`}
                        onClick={() => (!isOccupied || isMine) && !isBreak ? handleTimeClick(slot.startTime, occupation?.scheduleId) : null}
                    >
                        <span className={`font-medium ${textColor}`}>
                          {slot.startTime}
                        </span>
                    </div>
                    );
                })}
                </div>
            ) : (
                <div className="text-center text-neutral-500 dark:text-neutral-400 py-10">
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