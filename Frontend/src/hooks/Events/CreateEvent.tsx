import { useState } from 'react'
import { Event } from '../../components/Types/Event/Event'

interface ApiEvent {
  title: string
  sessionDuration: number
  location: string
  startTime: string
  endTime: string
  breakWindow: {
    breakStart: string
    breakEnd: string
  } | null
}

export function useCreateEvent(apiEndpoint: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const createEvent = async (event: ApiEvent): Promise<Event | null> => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ${response.status}`);
      }

      const createdEvent: Event = await response.json();
      setIsSuccess(true);
      return createdEvent;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    createEvent, 
    isLoading, 
    error,
    isSuccess
  };
}