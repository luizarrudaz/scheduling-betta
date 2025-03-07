import { useState } from 'react';
import { add, eachDayOfInterval, endOfMonth, format, isSameDay, parse, parseISO, startOfToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Meeting from './meeting';

interface MeetingData {
  id: number;
  title: string;
  date: string;
  participants: string[];
}

interface CalendarProps {
  selectedDay: Date;
  setSelectedDay: (date: Date) => void;
}

const meetings: MeetingData[] = [
  { id: 1, title: 'Reunião de Equipe', date: '2025-03-10T10:00', participants: ['Luiz', 'Amanda'] },
  { id: 2, title: 'Projeto X', date: '2025-03-12T14:00', participants: ['Carlos', 'Beatriz'] },
];

const colStartClasses = ['', 'col-start-2', 'col-start-3', 'col-start-4', 'col-start-5', 'col-start-6', 'col-start-7'];

export default function Calendar({ selectedDay, setSelectedDay }: CalendarProps) {
  const today = startOfToday();
  const [currentMonth, setCurrentMonth] = useState<string>(format(today, 'MMM-yyyy'));
  const firstDayCurrentMonth = parse(currentMonth, 'MMM-yyyy', new Date());

  const days = eachDayOfInterval({ start: firstDayCurrentMonth, end: endOfMonth(firstDayCurrentMonth) });

  const changeMonth = (offset: number) => {
    const newMonth = add(firstDayCurrentMonth, { months: offset });
    setCurrentMonth(format(newMonth, 'MMM-yyyy'));
  };

  const selectedDayMeetings = meetings.filter(meeting => isSameDay(parseISO(meeting.date), selectedDay));

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow-lg rounded-lg">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">{format(firstDayCurrentMonth, 'MMMM yyyy', { locale: ptBR })}</h2>
        <div>
          <button onClick={() => changeMonth(-1)} className="px-2">&#9665;</button>
          <button onClick={() => changeMonth(1)} className="px-2">&#9655;</button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center mt-4">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="font-bold">DSTQQSS".charAt(i)</div>
        ))}
        {days.map((day, idx) => (
          <button key={day.toString()} onClick={() => setSelectedDay(day)}
            className={`p-2 rounded-full ${isSameDay(day, selectedDay) ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}> 
            {format(day, 'd')}
          </button>
        ))}
      </div>
      <div className="mt-4">
        <h3 className="text-md font-semibold">Eventos</h3>
        {selectedDayMeetings.length > 0 ? (
          selectedDayMeetings.map(meeting => (
            <Meeting key={meeting.id} title={meeting.title} date={parseISO(meeting.date)} participants={meeting.participants} />
          ))
        ) : (
          <p className="text-gray-500">Nenhum evento</p>
        )}
      </div>
    </div>
  );
}