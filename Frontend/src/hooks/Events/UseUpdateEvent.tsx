import { Key, useState } from 'react';
import api from '../../services/api';

export function useUpdateEvent(apiEndpoint: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const updateEvent = async (id: Key | null | undefined, eventData: any): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      const endpoint = `${apiEndpoint.replace(api.defaults.baseURL || '', '')}/${id}`;
      await api.put(endpoint, eventData);

      setIsSuccess(true);
      return true;
    } catch (err: any) {
      let errorMessage = "Erro ao atualizar evento";

      if (err.response) {
        errorMessage = err.response.data?.message || `Erro ${err.response.status}`;
      } else if (err.request) {
        errorMessage = "Sem resposta do servidor";
      } else {
        errorMessage = err.message || errorMessage;
      }

      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateEvent,
    isLoading,
    error,
    isSuccess,
  };
}
