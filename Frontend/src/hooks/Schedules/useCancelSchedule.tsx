import { useState } from 'react';
import api from '../../services/api';

export function useCancelSchedule() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const cancelSchedule = async (scheduleId: number) => {
        setIsLoading(true);
        setError(null);
        setIsSuccess(false);

        try {
            await api.delete(`/schedule-event/${scheduleId}`);
            setIsSuccess(true);
            return true;
        } catch (err: any) {
            let errorMessage = "Erro ao cancelar agendamento";
            if (err.response?.data?.detail) {
                errorMessage = err.response.data.detail;
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }
            setError(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { cancelSchedule, isLoading, error, isSuccess, setError };
}