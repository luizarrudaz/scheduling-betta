import { useState } from 'react';
import api from '../../services/api';

interface SchedulePayload {
    eventId: number;
    selectedSlot: string;
}

export function useCreateSchedule() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const createSchedule = async (payload: SchedulePayload) => {
        setIsLoading(true);
        setError(null);
        setIsSuccess(false);

        try {
            await api.post('/schedule-event', payload);
            setIsSuccess(true);
            return true;
        } catch (err: any) {
            let errorMessage = "Erro ao agendar horário";
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

    return { createSchedule, isLoading, error, isSuccess, setError };
}