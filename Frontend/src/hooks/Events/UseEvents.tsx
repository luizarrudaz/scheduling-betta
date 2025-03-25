import { useState, useEffect } from 'react';
import { Event } from '../../pages/admin-events';

export default function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Simulando chamada API
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockData: Event[] = [/* Seus dados mockados aqui */];
        setEvents(mockData);
      } catch (err) {
        setError('Erro ao carregar eventos');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return { events, loading, error };
}