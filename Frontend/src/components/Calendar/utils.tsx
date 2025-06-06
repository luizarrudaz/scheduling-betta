import { format, parseISO, isSameDay } from 'date-fns';
import { TimeSlot } from '../Types/Event/TimeSlot';

export function classNames(...classes: (string | boolean)[]) {
  return classes.filter(Boolean).join(' ');
}

export const colStartClasses = [
  '',
  'col-start-2',
  'col-start-3',
  'col-start-4',
  'col-start-5',
  'col-start-6',
  'col-start-7',
];

export function generateAllSlots(day: Date, startHour = 8, endHour = 18, intervalMinutes = 30) {
  const slots = [];
  
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      let endHourCalc = hour;
      let endMinute = minute + intervalMinutes;

      if (endMinute >= 60) {
        endMinute %= 60;
        endHourCalc++;
      }

      const startTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      const endTime = `${String(endHourCalc).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;

      if (hour < endHour || (hour === endHour && minute === 0)) {
        slots.push({ startTime, endTime });
      }
    }
  }

  return slots;
}

export function isSlotOccupied(slot: string, occupiedSlots: TimeSlot[], day: Date) {
  return occupiedSlots.some(os => 
    isSameDay(parseISO(os.startDatetime), day) &&
    format(parseISO(os.startDatetime), 'HH:mm') === slot
  );
}