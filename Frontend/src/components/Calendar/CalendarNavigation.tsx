import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

interface CalendarNavigationProps {
  firstDayCurrentMonth: Date;
  onPrevious: () => void;
  onNext: () => void;
}

export default function CalendarNavigation({
  firstDayCurrentMonth,
  onPrevious,
  onNext
}: CalendarNavigationProps) {
  return (
    <div className="flex items-center">
      <h2 className="flex-auto font-semibold text-gray-900">
        {format(firstDayCurrentMonth, 'MMMM yyyy', { locale: ptBR })
          .replace(/^./, (firstChar) => firstChar.toUpperCase())}
      </h2>
      <button
        onClick={onPrevious}
        className="-my-1.5 p-1.5 text-gray-400 hover:text-gray-500"
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </button>
      <button
        onClick={onNext}
        className="-my-1.5 -mr-1.5 ml-2 p-1.5 text-gray-400 hover:text-gray-500"
      >
        <ChevronRightIcon className="w-5 h-5" />
      </button>
    </div>
  );
}