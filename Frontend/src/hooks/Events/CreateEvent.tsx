import { useState } from 'react';
import { Event } from '../../types/Event/Event';
import api from '../../services/api'; 

interface ApiEvent {
  title: string;
  sessionDuration: number;
  location: string;
  startTime: string;
  endTime: string;
  breakWindow: {
    breakStart: string;
    breakEnd: string;
  } | null;
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
      const endpoint = apiEndpoint.replace(api.defaults.baseURL || '', '');
      
      const { data: createdEvent } = await api.post<Event>(endpoint, event);
      
      setIsSuccess(true);
      return createdEvent;
    } catch (err: any) {
      let errorMessage = "Erro desconhecido";
      
      if (err.response) {
        errorMessage = err.response.data?.message || `Erro ${err.response.status}`;
      } else if (err.request) {
        errorMessage = "Sem resposta do servidor";
      } else {
        errorMessage = err.message || errorMessage;
      }

      setError(errorMessage);
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