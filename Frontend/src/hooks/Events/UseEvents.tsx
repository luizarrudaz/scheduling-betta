import { useState, useEffect, useCallback } from 'react';
import { Event } from '../../types/Event/Event';
import api from '../../services/api';

interface UseEventsProps {
    filter?: 'upcoming' | 'all';
    searchTerm?: string;
    sortConfig?: { key: string; direction: string; } | null;
}

export default function useEvents({ filter = 'all', searchTerm = '', sortConfig }: UseEventsProps = {}) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filter) {
        params.append('filter', filter);
      }
      if (searchTerm) {
          params.append('searchTerm', searchTerm);
      }
      if (sortConfig) {
          params.append('sortKey', sortConfig.key);
          params.append('sortDirection', sortConfig.direction);
      }

      const response = await api.get<Event[]>('/event', { params });

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
  }, [filter, searchTerm, sortConfig]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, loading, error, refetch: fetchEvents };
}