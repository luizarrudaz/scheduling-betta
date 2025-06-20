import { useState, useMemo } from 'react';
import { startOfToday, format, parse, add, isSameDay, isAfter } from 'date-fns';
import { motion } from "framer-motion";
import { Event } from '../components/Types/Event/Event';
import useEvents from '../hooks/Events/UseEvents';
import { useAllSchedules } from '../hooks/Schedules/useAllSchedules';
import CalendarNavigation from '../components/Calendar/CalendarNavigation.tsx';
import CalendarGrid from '../components/Calendar/CalendarGrid.tsx';
import TimeSlotsPanel from '../components/Calendar/TimeSlotPanel.tsx';
import ServiceSelector from '../components/Calendar/ServiceSelector.tsx';
import LogoutButton from '../components/LogoutButton/LogoutButton.tsx';

export default function Calendar() {
  const today = startOfToday();
  const [selectedDay, setSelectedDay] = useState<Date>(today);
  const [currentMonth, setCurrentMonth] = useState(format(today, 'MMM-yyyy'));

  const { events, loading: eventsLoading } = useEvents();
  const { schedules, loading: schedulesLoading, refetch: refetchSchedules } = useAllSchedules();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const upcomingEvents = useMemo(() => {
    if (!events) return [];
    const now = new Date();
    return events.filter(event => isAfter(new Date(event.endTime), now));
  }, [events]);

  const firstDayCurrentMonth = parse(currentMonth, 'MMM-yyyy', new Date());

  const occupiedSlotsForEvent = useMemo(() => {
    if (!selectedEvent) return [];
    return schedules.filter(s => s.event?.id === selectedEvent.id);
  }, [schedules, selectedEvent]);

  const isExpanded = useMemo(() => {
    if (!selectedEvent) return false;
    const dayHasAppointments = schedules.some(
      s => s.event?.id === selectedEvent.id && isSameDay(new Date(s.selectedSlot), selectedDay)
    );
    const eventIsActiveOnDay = isSameDay(new Date(selectedEvent.startTime), selectedDay) || isSameDay(new Date(selectedEvent.endTime), selectedDay) || (selectedDay > new Date(selectedEvent.startTime) && selectedDay < new Date(selectedEvent.endTime));

    return eventIsActiveOnDay || dayHasAppointments;
  }, [selectedDay, selectedEvent, schedules]);

  const handlePreviousMonth = () => {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 });
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'));
  };

  const handleNextMonth = () => {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'));
  };

  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
  };

  const handleServiceSelect = (service: Event | null) => {
    setSelectedEvent(service);
    if (service) {
      setSelectedDay(new Date(service.startTime));
      setCurrentMonth(format(new Date(service.startTime), 'MMM-yyyy'));
    }
  };

  if (eventsLoading || schedulesLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FA7014]"></div>
      </div>
    );
  }

  return (
    <div className="pt-4 sm:pt-8 flex justify-center">
      <div className="flex justify-end">
        <LogoutButton />
      </div>

      <div className="w-full max-w-4xl relative">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 max-w-max whitespace-nowrap text-center">
          <h1 className="text-3xl text-gray-800 font-bold">Agendamentos Betta</h1>
        </div>

        <div className="mt-14 sm:mt-16">
          <ServiceSelector
            services={upcomingEvents}
            selectedService={selectedEvent}
            onServiceSelect={handleServiceSelect}
          />

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
                selectedEvent={selectedEvent}
                occupiedSlots={occupiedSlotsForEvent}
                onDayClick={handleDayClick}
              />
            </div>

            <TimeSlotsPanel
              isExpanded={isExpanded}
              selectedDay={selectedDay}
              selectedEvent={selectedEvent}
              occupiedSlots={occupiedSlotsForEvent}
              onScheduleSuccess={refetchSchedules}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}