import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isEqual,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  parseISO,
  startOfToday,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";

interface TimeSlot {
  startDatetime: string;
  endDatetime: string;
}

const occupiedSlots: TimeSlot[] = [
  { startDatetime: '2025-03-19T09:30', endDatetime: '2025-03-19T10:00' },
  { startDatetime: '2025-03-19T10:30', endDatetime: '2025-03-19T11:00' },
  { startDatetime: '2025-03-19T11:30', endDatetime: '2025-03-19T12:00' },
  { startDatetime: '2025-03-19T14:30', endDatetime: '2025-03-19T15:00' },
  { startDatetime: '2025-03-19T15:30', endDatetime: '2025-03-19T16:00' },
];

function classNames(...classes: (string | boolean)[]) {
  return classes.filter(Boolean).join(' ');
}

const colStartClasses = [
  '',
  'col-start-2',
  'col-start-3',
  'col-start-4',
  'col-start-5',
  'col-start-6',
  'col-start-7',
];

export default function Calendar() {
  const today = startOfToday();
  const [selectedDay, setSelectedDay] = useState<Date>(today);
  const [currentMonth, setCurrentMonth] = useState(format(today, 'MMM-yyyy'));
  const [isExpanded, setIsExpanded] = useState(false);
  const firstDayCurrentMonth = parse(currentMonth, 'MMM-yyyy', new Date());

  const days = eachDayOfInterval({
    start: firstDayCurrentMonth,
    end: endOfMonth(firstDayCurrentMonth),
  });

  const previousMonth = () => {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 });
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'));
  };

  const nextMonth = () => {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'));
  };

  const getAvailableTimeSlots = (day: Date) => {
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
  };

  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
    const hasEvents = occupiedSlots.some(slot =>
      isSameDay(parseISO(slot.startDatetime), day)
    );
    setIsExpanded(hasEvents);
  };

  const availableSlots = getAvailableTimeSlots(selectedDay);

  return (
    <div className="pt-16 flex justify-center">
      <div className="px-4 sm:px-7 md:px-6 w-full max-w-6xl">
        <motion.div
          className="bg-white shadow-lg rounded-lg p-6 flex gap-6 mx-auto"
          animate={{
            width: isExpanded ? "100%" : "fit-content",
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {/* Calendário */}
          <div className="min-w-[280px]">
            <div className="flex items-center">
              <h2 className="flex-auto font-semibold text-gray-900">
                {format(firstDayCurrentMonth, 'MMMM yyyy', { locale: ptBR })
                  .replace(/^./, (firstChar) => firstChar.toUpperCase())}
              </h2>
              <button
                onClick={previousMonth}
                className="-my-1.5 p-1.5 text-gray-400 hover:text-gray-500"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <button
                onClick={nextMonth}
                className="-my-1.5 -mr-1.5 ml-2 p-1.5 text-gray-400 hover:text-gray-500"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 mt-10 text-xs leading-6 text-center text-gray-500">
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                <div key={i}>{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 mt-2 text-sm">
              {days.map((day, dayIdx) => (
                <div
                  key={day.toString()}
                  className={classNames(
                    dayIdx === 0 && colStartClasses[getDay(day)],
                    'py-1.5'
                  )}
                >
                  <button
                    onClick={() => handleDayClick(day)}
                    className={classNames(
                      isEqual(day, selectedDay) && 'text-white',
                      isToday(day) && 'text-red-500',
                      !isEqual(day, selectedDay) && !isToday(day) &&
                      isSameMonth(day, firstDayCurrentMonth) && 'text-gray-900',
                      !isEqual(day, selectedDay) && !isToday(day) &&
                      !isSameMonth(day, firstDayCurrentMonth) && 'text-gray-400',
                      isEqual(day, selectedDay) && isToday(day) && 'bg-red-500',
                      isEqual(day, selectedDay) && !isToday(day) && 'bg-gray-900',
                      'mx-auto flex h-8 w-8 items-center justify-center rounded-full transition-colors'
                    )}
                  >
                    <time dateTime={format(day, 'yyyy-MM-dd')}>
                      {format(day, 'd')}
                    </time>
                  </button>
                  <div className="w-1 h-1 mx-auto mt-1">
                    {occupiedSlots.some(slot =>
                      isSameDay(parseISO(slot.startDatetime), day)) && (
                        <div className="w-1 h-1 rounded-full bg-sky-500" />
                      )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Horários */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                className="border-l border-gray-200 pl-6 flex-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="font-semibold text-gray-900 mb-4">
                  Horários disponíveis (sessões de 30m)
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {availableSlots.map((slot, index) => (
                    <motion.div
                      key={index}
                      className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                      whileHover={{ scale: 1.03 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <span className="text-gray-900 font-medium">
                        {slot.startTime}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}