import { useState } from 'react';
import { startOfToday, format, parse, add, isSameDay, parseISO } from 'date-fns';
import { motion } from "framer-motion";

import CalendarNavigation from '../components/Calendar/CalendarNavigation.tsx';
import CalendarGrid from '../components/Calendar/CalendarGrid.tsx';
import TimeSlotsPanel from '../components/Calendar/TimeSlotPanel.tsx';
import ServiceSelector from '../components/ServiceSelector/ServiceSelector.tsx';
import LogoutButton from '../components/LogoutButton/LogoutButton.tsx';
import { TimeSlot } from '../components/Calendar/types.tsx';

export default function Calendar() {
  const today = startOfToday();
  const [selectedDay, setSelectedDay] = useState<Date>(today);
  const [currentMonth, setCurrentMonth] = useState(format(today, 'MMM-yyyy'));
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [occupiedSlots, setOccupiedSlots] = useState<TimeSlot[]>([
    { startDatetime: '2025-03-24T09:30', endDatetime: '2025-03-24T10:00' },
    { startDatetime: '2025-03-26T10:30', endDatetime: '2025-03-26T11:00' },
    { startDatetime: '2025-03-26T11:00', endDatetime: '2025-03-26T11:30' },
    { startDatetime: '2025-03-26T13:30', endDatetime: '2025-03-26T14:00' }
  ]);

  const firstDayCurrentMonth = parse(currentMonth, 'MMM-yyyy', new Date());

  const handlePreviousMonth = () => {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 });
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'));
    setIsExpanded(false);
  };

  const handleNextMonth = () => {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'));
    setIsExpanded(false);
  };

  const handleDayClick = (day: Date) => {
    const hasOccupied = occupiedSlots.some(slot => 
      isSameDay(parseISO(slot.startDatetime), day)
    );
    
    setSelectedDay(day);
    setIsExpanded(hasOccupied);
  };

  return (
    <div className="pt-4 sm:pt-8 flex justify-center">
      <LogoutButton />

      <div className="px-2 sm:px-4 md:px-4 w-full max-w-4xl">
        <ServiceSelector />

        <motion.div
          className="bg-white shadow-lg rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row gap-3 mx-auto mt-2"
          animate={{ width: isExpanded ? "100%" : "fit-content" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <div className="min-w-[280px] max-h-[300px]">
            <CalendarNavigation
              firstDayCurrentMonth={firstDayCurrentMonth}
              onPrevious={handlePreviousMonth}
              onNext={handleNextMonth}
            />
            
            <CalendarGrid
              firstDayCurrentMonth={firstDayCurrentMonth}
              selectedDay={selectedDay}
              occupiedSlots={occupiedSlots}
              onDayClick={handleDayClick}
            />
          </div>

          <TimeSlotsPanel
            isExpanded={isExpanded}
            selectedDay={selectedDay}
            occupiedSlots={occupiedSlots}
          />
        </motion.div>
      </div>
    </div>
  );
}