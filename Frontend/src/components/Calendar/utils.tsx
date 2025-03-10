// components/Calendar/utils.ts
import { parseISO, isSameDay } from 'date-fns';
import { TimeSlot } from './types';

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

export function getAvailableTimeSlots(day: Date, occupiedSlots: TimeSlot[]) {
  const slots: { startTime: string; endTime: string }[] = [];
  const times = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00',
    '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00'];

  times.forEach((startTime, index) => {
    const endTime = times[index + 1] || '16:30';
    const isOccupied = occupiedSlots.some(slot =>
      isSameDay(parseISO(slot.startDatetime), day) &&
      (slot.startDatetime.includes(startTime) || slot.endDatetime.includes(endTime))
    );

    if (!isOccupied) slots.push({ startTime, endTime });
  });

  return slots;
}