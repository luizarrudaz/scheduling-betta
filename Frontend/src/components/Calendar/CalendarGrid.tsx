import { eachDayOfInterval, endOfMonth, getDay, isEqual, isSameMonth, isToday, format } from 'date-fns';
import DayCell from './DayCell';
import { classNames } from '../../utils/calendar';

interface CalendarGridProps {
  firstDayCurrentMonth: Date;
  selectedDay: Date;
  availableDaysSet: Set<string>;
  onDayClick: (day: Date) => void;
}

export default function CalendarGrid({
  firstDayCurrentMonth,
  selectedDay,
  availableDaysSet,
  onDayClick
}: CalendarGridProps) {
  const days = eachDayOfInterval({
    start: firstDayCurrentMonth,
    end: endOfMonth(firstDayCurrentMonth),
  });

  return (
    <>
      <div className="grid grid-cols-7 mt-4 text-xs leading-6 text-center text-neutral-500 dark:text-neutral-400">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
          <div key={i}>{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 mt-2 text-sm">
        {days.map((day, dayIdx) => (
          <div
            key={day.toISOString()}
            className={classNames(
              dayIdx === 0 && getDay(day) > 0 && `col-start-${getDay(day) + 1}`,
              'py-1.5'
            )}
          >
            <DayCell
              day={day}
              isSelected={isEqual(day, selectedDay)}
              isToday={isToday(day)}
              isSameMonth={isSameMonth(day, firstDayCurrentMonth)}
              hasEvents={availableDaysSet.has(format(day, 'yyyy-MM-dd'))}
              onDayClick={onDayClick}
            />
          </div>
        ))}
      </div>
    </>
  );
}