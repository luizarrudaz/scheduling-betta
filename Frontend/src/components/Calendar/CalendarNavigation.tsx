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
      <h2 className="flex-auto font-semibold text-neutral-900 dark:text-neutral-100">
        {format(firstDayCurrentMonth, 'MMMM yyyy', { locale: ptBR })
          .replace(/^./, (firstChar) => firstChar.toUpperCase())}
      </h2>
      <button
        onClick={onPrevious}
        className="-my-1.5 p-1.5 text-neutral-400 hover:text-neutral-500 dark:text-neutral-500 dark:hover:text-neutral-300"
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </button>
      <button
        onClick={onNext}
        className="-my-1.5 -mr-1.5 ml-2 p-1.5 text-neutral-400 hover:text-neutral-500 dark:text-neutral-500 dark:hover:text-neutral-300"
      >
        <ChevronRightIcon className="w-5 h-5" />
      </button>
    </div>
  );
}