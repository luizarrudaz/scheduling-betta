import { useState, useEffect } from 'react';
import { Event } from '../../types/Event/Event';
import api from '../../services/api';

export default function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<Event[]>('/event');

      const eventsWithDates = response.data.map(event => ({
        ...event,
        startTime: new Date(event.startTime),
        endTime: new Date(event.endTime),
        breakWindow: event.breakWindow ? {
          breakStart: new Date(event.breakWindow.breakStart),
          breakEnd: new Date(event.breakWindow.breakEnd)
        } : null
      }));

      setEvents(eventsWithDates);
    } catch (err: any) {
      let errorMessage = "Erro ao carregar eventos";

      if (err.response) {
        errorMessage = err.response.data?.message || `Erro ${err.response.status}`;
      } else if (err.request) {
        errorMessage = "Sem resposta do servidor";
      } else {
        errorMessage = err.message || errorMessage;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return { events, loading, error, refetch: fetchEvents };
}