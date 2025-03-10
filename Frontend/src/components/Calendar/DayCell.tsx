import { format } from 'date-fns';
import IndicatorDot from './IndicatorDot';

interface DayCellProps {
  day: Date;
  isSelected: boolean;
  isToday: boolean;
  isSameMonth: boolean;
  hasEvents: boolean;
  onDayClick: (day: Date) => void;
}

export default function DayCell({
  day,
  isSelected,
  isToday,
  isSameMonth,
  hasEvents,
  onDayClick
}: DayCellProps) {
  const textColorClasses = () => {
    if (isSelected) return 'text-white';
    if (isToday) return 'text-red-500';
    if (!isSameMonth) return 'text-gray-400';
    return 'text-gray-900';
  };

  const bgColorClasses = () => {
    if (isSelected) return isToday ? 'bg-red-500' : 'bg-gray-900';
    return '';
  };

  return (
    <>
      <button
        onClick={() => onDayClick(day)}
        className={`
          mx-auto flex h-8 w-8 items-center justify-center rounded-full transition-colors
          ${textColorClasses()} ${bgColorClasses()}
        `}
      >
        <time dateTime={format(day, 'yyyy-MM-dd')}>
          {format(day, 'd')}
        </time>
      </button>
      <IndicatorDot show={hasEvents} />
    </>
  );
}