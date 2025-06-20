import { eachDayOfInterval, endOfMonth, getDay, isEqual, isSameDay, isSameMonth, isToday, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import DayCell from './DayCell';
import { classNames } from './utils';
import { Event } from '../Types/Event/Event';
import { generateSlotsForEvent } from './utils';
import { ScheduledEvent } from '../Types/Schedule/Schedule';

interface CalendarGridProps {
  firstDayCurrentMonth: Date;
  selectedDay: Date;
  selectedEvent: Event | null;
  occupiedSlots: ScheduledEvent[];
  onDayClick: (day: Date) => void;
}

export default function CalendarGrid({
  firstDayCurrentMonth,
  selectedDay,
  selectedEvent,
  occupiedSlots,
  onDayClick
}: CalendarGridProps) {
  const days = eachDayOfInterval({
    start: firstDayCurrentMonth,
    end: endOfMonth(firstDayCurrentMonth),
  });

  const hasAvailableSlots = (day: Date): boolean => {
    if (!selectedEvent) return false;

    const eventStartDate = startOfDay(new Date(selectedEvent.startTime));
    const eventEndDate = endOfDay(new Date(selectedEvent.endTime));

    if (!isWithinInterval(day, { start: eventStartDate, end: eventEndDate })) {
        return false;
    }

    const possibleSlots = generateSlotsForEvent(selectedEvent, day);
    if (possibleSlots.length === 0) return false;

    const occupiedCount = occupiedSlots.filter(s => isSameDay(new Date(s.selectedSlot), day)).length;

    return possibleSlots.length > occupiedCount;
  };


  return (
    <>
      <div className="grid grid-cols-7 mt-4 text-xs leading-6 text-center text-gray-500">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
          <div key={i}>{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 mt-2 text-xs max-h-[250px] overflow-hidden">
        {days.map((day, dayIdx) => (
          <div
            key={day.toString()}
            className={classNames(
              dayIdx === 0 && getDay(day) > 0 && `col-start-${getDay(day) + 1}`,
              'py-0 max-w-[30px] mx-auto'
            )}
          >
            <DayCell
              day={day}
              isSelected={isEqual(day, selectedDay)}
              isToday={isToday(day)}
              isSameMonth={isSameMonth(day, firstDayCurrentMonth)}
              hasEvents={hasAvailableSlots(day)}
              onDayClick={onDayClick}
            />
          </div>
        ))}
      </div>
    </>
  );
}