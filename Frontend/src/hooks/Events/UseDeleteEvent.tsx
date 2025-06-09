import { Key, useState } from 'react';
import api from '../../services/api';

export function useDeleteEvent(apiEndpoint: string) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const deleteEvent = async (id: Key | null | undefined): Promise<boolean> => {
    setIsDeleting(true);
    setError(null);
    setIsSuccess(false);

    try {
      const endpoint = `${apiEndpoint.replace(api.defaults.baseURL || '', '')}/${id}`;
      await api.delete(endpoint);

      setIsSuccess(true);
      return true;
    } catch (err: any) {
      let errorMessage = "Erro ao excluir evento";

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
      setIsDeleting(false);
    }
  };

  return {
    deleteEvent,
    isDeleting,
    error,
    isSuccess
  };
}