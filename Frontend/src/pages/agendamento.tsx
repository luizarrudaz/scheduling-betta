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
import { ptBR } from 'date-fns/locale'; // Importa a localidade em português
import { useState } from 'react';

// Define the Meeting type
interface Meeting {
  id: number;
  name: string;
  startDatetime: string;
  endDatetime: string;
}

// Mock data for meetings
const meetings: Meeting[] = [
  {
    id: 1,
    name: 'Thais Oliveira',
    startDatetime: '2025-03-19T09:30',
    endDatetime: '2025-03-19T10:00',
  },
  {
    id: 2,
    name: 'Bernardo Carvalho',
    startDatetime: '2025-03-19T10:30',
    endDatetime: '2025-03-19T11:00',
  },
  {
    id: 3,
    name: 'Luiz Arruda',
    startDatetime: '2025-03-19T11:30',
    endDatetime: '2025-03-19T12:00',
  },
  {
    id: 4,
    name: 'Amanda Nogueira',
    startDatetime: '2025-03-19T14:30',
    endDatetime: '2025-03-19T15:00',
  },
  {
    id: 5,
    name: 'Bruno Rosa',
    startDatetime: '2025-03-19T15:30',
    endDatetime: '2025-03-19T16:00',
  },
];

// Utility function to conditionally join class names
function classNames(...classes: (string | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Define the column start classes for the calendar grid
const colStartClasses = [
  '',
  'col-start-2',
  'col-start-3',
  'col-start-4',
  'col-start-5',
  'col-start-6',
  'col-start-7',
];

// Main Calendar Component
export default function Calendar() {
  const today = startOfToday();
  const [selectedDay, setSelectedDay] = useState<Date>(today);
  const [currentMonth, setCurrentMonth] = useState<string>(format(today, 'MMM-yyyy'));
  const firstDayCurrentMonth = parse(currentMonth, 'MMM-yyyy', new Date());

  const days = eachDayOfInterval({
    start: firstDayCurrentMonth,
    end: endOfMonth(firstDayCurrentMonth),
  });

  // Function to go to the previous month
  const previousMonth = () => {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 });
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'));
  };

  // Function to go to the next month
  const nextMonth = () => {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'));
  };

  // Function to get the available time slots for a specific day
  const getAvailableTimeSlots = (day: Date) => {
    const slots: { startTime: string; endTime: string }[] = [];
    const times = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00'];

    times.forEach((startTime, index) => {
      const endTime = times[index + 1] || '16:30'; // Default end time for last slot

      if (
        !meetings.some(
          (meeting) =>
            isSameDay(parseISO(meeting.startDatetime), day) &&
            (meeting.startDatetime.startsWith(startTime) || meeting.endDatetime.startsWith(endTime))
        )
      ) {
        slots.push({ startTime, endTime });
      }
    });

    return slots;
  };

  // Function to group time slots into chunks
  const groupTimeSlots = (slots: { startTime: string; endTime: string }[]) => {
    const chunkSize = slots.length >= 12 ? 4 : 3; // 4x4 para 12+ horários, 3x3 para menos
    const groupedSlots = [];

    for (let i = 0; i < slots.length; i += chunkSize) {
      groupedSlots.push(slots.slice(i, i + chunkSize));
    }

    return groupedSlots;
  };

  // Filter meetings for the selected day
  const selectedDayMeetings = meetings.filter((meeting) =>
    isSameDay(parseISO(meeting.startDatetime), selectedDay)
  );

  // Get available time slots for the selected day
  const availableSlots = getAvailableTimeSlots(selectedDay);
  const groupedSlots = groupTimeSlots(availableSlots);

  return (
    <div className="pt-16">
      <div className="max-w-md px-4 mx-auto sm:px-7 md:max-w-4xl md:px-6">
        {/* Card wrapper around the calendar and agenda */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="md:grid md:grid-cols-2 md:divide-x md:divide-gray-200">
            <div className="md:pr-14">
              <div className="flex items-center">
                <h2 className="flex-auto font-semibold text-gray-900">
                  {format(firstDayCurrentMonth, 'MMMM yyyy', { locale: ptBR })
                    .replace(/^./, (firstChar) => firstChar.toUpperCase())}
                </h2>

                <button
                  type="button"
                  onClick={previousMonth}
                  className="-my-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Previous month</span>
                  <ChevronLeftIcon className="w-5 h-5" aria-hidden="true" />
                </button>
                <button
                  onClick={nextMonth}
                  type="button"
                  className="-my-1.5 -mr-1.5 ml-2 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Next month</span>
                  <ChevronRightIcon className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
              <div className="grid grid-cols-7 mt-10 text-xs leading-6 text-center text-gray-500">
                <div>D</div>
                <div>S</div>
                <div>T</div>
                <div>Q</div>
                <div>Q</div>
                <div>S</div>
                <div>S</div>
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
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      className={classNames(
                        isEqual(day, selectedDay) && 'text-white',
                        !isEqual(day, selectedDay) && isToday(day) && 'text-red-500',
                        !isEqual(day, selectedDay) &&
                        !isToday(day) &&
                        isSameMonth(day, firstDayCurrentMonth) &&
                        'text-gray-900',
                        !isEqual(day, selectedDay) &&
                        !isToday(day) &&
                        !isSameMonth(day, firstDayCurrentMonth) &&
                        'text-gray-400',
                        isEqual(day, selectedDay) && isToday(day) && 'bg-red-500',
                        isEqual(day, selectedDay) && !isToday(day) && 'bg-gray-900',
                        !isEqual(day, selectedDay) && 'hover:bg-gray-200',
                        (isEqual(day, selectedDay) || isToday(day)) && 'font-semibold',
                        'mx-auto flex h-8 w-8 items-center justify-center rounded-full'
                      )}
                    >
                      <time dateTime={format(day, 'yyyy-MM-dd')}>{format(day, 'd')}</time>
                    </button>

                    <div className="w-1 h-1 mx-auto mt-1">
                      {meetings.some((meeting) =>
                        isSameDay(parseISO(meeting.startDatetime), day)
                      ) && <div className="w-1 h-1 rounded-full bg-sky-500"></div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <section className="mt-12 md:mt-0 md:pl-14">
              <h2 className="font-semibold text-gray-900">
                Horários disponíveis (sessões de 30m) 
              </h2>
              <div className={`mt-4 ${availableSlots.length >= 16 ? 'overflow-y-auto h-64' : ''}`}>
                {groupedSlots.map((group, groupIndex) => (
                  <div
                    key={groupIndex}
                    className={`grid ${availableSlots.length >= 12 ? 'grid-cols-4' : 'grid-cols-3'} gap-4 mb-4`}
                  >
                    {group.map((slot, index) => (
                      <div
                        key={index}
                        className="flex items-center px-4 py-2 space-x-4 group rounded-xl focus-within:bg-gray-100 hover:bg-gray-100"
                      >
                        <div className="flex-auto">
                          <p className="text-gray-900">{slot.startTime}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
        {/* End of card wrapper */}
      </div>
    </div>
  );
}