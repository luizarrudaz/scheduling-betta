import { useState, useMemo, useEffect } from 'react';
import { startOfToday, format, parse, add, isSameDay, isAfter, startOfDay, endOfDay, isWithinInterval, parseISO } from 'date-fns';
import { motion } from "framer-motion";
import { Event } from '../types/Event/Event';
import useEvents from '../hooks/Events/UseEvents';
import { useOccupiedSlots } from '../hooks/Schedules/useOccupiedSlots';
import CalendarNavigation from '../components/Calendar/CalendarNavigation.tsx';
import CalendarGrid from '../components/Calendar/CalendarGrid.tsx';
import TimeSlotsPanel from '../components/Calendar/TimeSlotPanel.tsx';
import ServiceSelector from '../components/Calendar/ServiceSelector.tsx';
import LogoutButton from '../components/LogoutButton/LogoutButton.tsx';
import { useAuthContext } from '../context/AuthContext.tsx';
import AppNav from '../components/Nav/AppNav.tsx';
import { useLocation, useNavigate } from 'react-router-dom';
import { generateSlotsForEvent } from '../utils/calendar';

export default function Calendar() {
  const today = startOfToday();
  const [selectedDay, setSelectedDay] = useState<Date>(today);
  const [currentMonth, setCurrentMonth] = useState(format(today, 'MMM-yyyy'));

  const { events, loading: eventsLoading } = useEvents();
  const { occupiedSlots, loading: schedulesLoading, refetch: refetchSchedules } = useOccupiedSlots();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const { isAuthenticated } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const eventIdToSelect = location.state?.eventIdToSelect;
    if (eventIdToSelect && events.length > 0) {
      const eventToSelect = events.find(event => event.id === eventIdToSelect);
      if (eventToSelect) {
        handleServiceSelect(eventToSelect);
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location.state, events, navigate]);

  const upcomingEvents = useMemo(() => {
    if (!events) return [];
    const now = new Date();
    return events.filter(event => isAfter(new Date(event.endTime), now));
  }, [events]);

  const firstDayCurrentMonth = parse(currentMonth, 'MMM-yyyy', new Date());

  const occupiedSlotsForEvent = useMemo(() => {
    if (!selectedEvent) return [];
    return occupiedSlots.filter(slot => slot.eventId === selectedEvent.id);
  }, [occupiedSlots, selectedEvent]);

  const availableDaysSet = useMemo(() => {
    const available = new Set<string>();
    if (!selectedEvent) return available;

    const eventStartDate = startOfDay(new Date(selectedEvent.startTime));
    const eventEndDate = endOfDay(new Date(selectedEvent.endTime));
    
    const dailyOccupiedCount = new Map<string, number>();
    occupiedSlotsForEvent.forEach(slot => {
        const dayKey = format(parseISO(slot.scheduleTime), 'yyyy-MM-dd');
        dailyOccupiedCount.set(dayKey, (dailyOccupiedCount.get(dayKey) || 0) + 1);
    });

    let currentDate = eventStartDate;
    while (currentDate <= eventEndDate) {
        const dayKey = format(currentDate, 'yyyy-MM-dd');
        const possibleSlots = generateSlotsForEvent(selectedEvent, currentDate);
        const occupiedCount = dailyOccupiedCount.get(dayKey) || 0;

        if (possibleSlots.length > occupiedCount) {
            available.add(dayKey);
        }
        currentDate = add(currentDate, { days: 1 });
    }

    return available;
  }, [selectedEvent, occupiedSlotsForEvent]);

  const isExpanded = useMemo(() => {
    if (!selectedEvent) return false;
    const dayHasAppointments = occupiedSlotsForEvent.some(
      s => isSameDay(parseISO(s.scheduleTime), selectedDay)
    );
    const eventIsActiveOnDay = isWithinInterval(selectedDay, {
        start: startOfDay(new Date(selectedEvent.startTime)),
        end: endOfDay(new Date(selectedEvent.endTime))
    });

    return eventIsActiveOnDay || dayHasAppointments;
  }, [selectedDay, selectedEvent, occupiedSlotsForEvent]);

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
      const serviceStartDate = new Date(service.startTime);
      setSelectedDay(serviceStartDate);
      setCurrentMonth(format(serviceStartDate, 'MMM-yyyy'));
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
    <div className="w-screen min-h-screen bg-gray-50 flex justify-center items-center p-4">
        {isAuthenticated && <AppNav />}
        <LogoutButton />

        <div className="flex flex-col items-center">
            <motion.h1 
                className="text-3xl font-bold text-gray-800"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                Eventos
            </motion.h1>

            <ServiceSelector
                services={upcomingEvents}
                selectedService={selectedEvent}
                onServiceSelect={handleServiceSelect}
            />

            <motion.div
                className="bg-white shadow-lg rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row gap-3 -mt-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
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
                        availableDaysSet={availableDaysSet}
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
  );
}