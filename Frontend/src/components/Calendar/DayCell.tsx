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
    <div className="flex flex-col items-center h-full justify-between pb-1">
      <button
        onClick={() => onDayClick(day)}
        className={`
          mx-auto flex h-8 w-8 items-center justify-center rounded-full transition-colors
          ${textColorClasses()} ${bgColorClasses()}
          relative
        `}
      >
        <time dateTime={format(day, 'yyyy-MM-dd')}>
          {format(day, 'd')}
        </time>

        <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2">
          <IndicatorDot show={hasEvents && !isSelected} />
        </div>
      </button>
    </div>
  );
}