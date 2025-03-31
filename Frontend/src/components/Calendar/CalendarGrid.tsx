import { eachDayOfInterval, endOfMonth, getDay, isEqual, isSameDay, isSameMonth, isToday } from 'date-fns';
import DayCell from './DayCell';
import { TimeSlot } from '../Types/TimeSlot';
import { classNames, colStartClasses } from './utils';
import { parseISO } from 'date-fns';

interface CalendarGridProps {
  firstDayCurrentMonth: Date;
  selectedDay: Date;
  occupiedSlots: TimeSlot[];
  onDayClick: (day: Date) => void;
}

export default function CalendarGrid({
  firstDayCurrentMonth,
  selectedDay,
  occupiedSlots,
  onDayClick
}: CalendarGridProps) {
  const days = eachDayOfInterval({
    start: firstDayCurrentMonth,
    end: endOfMonth(firstDayCurrentMonth),
  });

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
              dayIdx === 0 && colStartClasses[getDay(day)],
              'py-0 max-w-[30px] mx-auto'
            )}
          >
            <DayCell
              day={day}
              isSelected={isEqual(day, selectedDay)}
              isToday={isToday(day)}
              isSameMonth={isSameMonth(day, firstDayCurrentMonth)}
              hasEvents={occupiedSlots?.some(slot => 
                slot?.startDatetime && 
                isSameDay(parseISO(slot.startDatetime), day)
              )}
              onDayClick={onDayClick}
            />
          </div>
        ))}
      </div>
    </>
  );
}