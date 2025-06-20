import { useState } from 'react';
import api from '../../services/api';

export function useAdminCancelSchedule() {
    const [isCancelling, setIsCancelling] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const adminCancel = async (scheduleId: number): Promise<boolean> => {
        setIsCancelling(true);
        setError(null);
        try {
            await api.delete(`/schedule-event/admin-cancel/${scheduleId}`);
            return true;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Falha ao cancelar o agendamento.');
            return false;
        } finally {
            setIsCancelling(false);
        }
    };

    return { adminCancel, isCancelling, error };
}